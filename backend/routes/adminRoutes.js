// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getRosterHTTP, kickStudentHTTP } = require('../controllers/admin');

// GET /admin/roster -> list live students (socket roster)
router.get('/roster', getRosterHTTP);

// POST /admin/kick { socketId } or { name } -> remove a student
router.post('/kick', kickStudentHTTP);

module.exports = router;
