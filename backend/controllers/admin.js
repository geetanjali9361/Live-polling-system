//const { getRoster, disconnectBySocketId, students, getIO } = require('./socket');
const { getRoster, disconnectBySocketId, students, getIO } = require('./socket');

// roster route
function getRosterHTTP(_req, res) {
  return res.json({ success: true, roster: getRoster() });
}

// kick route
function kickStudentHTTP(req, res) {
  let { socketId, name } = req.body;

  // if teacher provided a name, look up socketId
  if (!socketId && name) {
    for (const [id, student] of students.entries()) {
      if (student.name === name) {
        socketId = id;
        break;
      }
    }
  }

  if (!socketId) {
    return res.status(400).json({ success: false, msg: 'socketId or name required' });
  }

  const ok = disconnectBySocketId(socketId);
  if (!ok) return res.status(404).json({ success: false, msg: 'student not found' });

  // optional: broadcast to everyone that roster changed
  const io = getIO();
  io?.emit('room:roster', { roster: getRoster() });

  return res.json({ success: true, kicked: socketId });
}

module.exports = { getRosterHTTP, kickStudentHTTP };
