// server.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { PORT } = require('./config');

// REST routes
const pollRoutes = require('./routes/pollRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Sockets
const { handleSocket } = require('./controllers/socket');

// DB
const { connectDB } = require('./db');

(async function bootstrap() {
  try {
    // ---- DB ----
  const uri = process.env.MONGO_URI || '';
  console.log('Mongo user:', (uri.match(/\/\/([^:]+):/) || [])[1]);
  console.log('Mongo host:', uri.split('@')[1]?.split('/')[0]);
    const host = uri.split('@')[1]?.split('/')[0];
    console.log('Using MONGO_URI host:', host || '(none)');
    if (!uri) {
      console.warn('⚠️  MONGO_URI not set – continuing without persistence');
    } else {
      await connectDB(uri); // ensure db/index.js sets { dbName: 'livepoll' } if no path in URI
    }

    // ---- Express ----
    const app = express();
    const FRONTEND = process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:5173'];

    //const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

   app.use(cors({ origin: FRONTEND }));
   const allowed = [
  'http://localhost:5173',
  'https://live-polling-system-plum.vercel.app'   // replace with your actual Vercel domain
];

app.use(cors({ origin: allowed, credentials: true }));
    app.use(express.json());

    app.get('/health', (_req, res) => res.json({ ok: true }));

    // ---- REST routes ----
    app.use('/polls', pollRoutes);
    app.use('/admin', adminRoutes);

    // ---- HTTP + Socket.IO ----
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: FRONTEND } });

    io.on('connection', (socket) => handleSocket(io, socket));

    if (!PORT) throw new Error('PORT is required in config file');

    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      if (uri) console.log('✅ MongoDB ready');
      console.log(`✅ CORS allowed: ${FRONTEND}`);
    });
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
})();
