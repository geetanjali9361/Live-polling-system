// controllers/socket.js
const { tallyCounts } = require('../helpers/comman');
const Poll   = require('../db/models/poll');
const Result = require('../db/models/result');

let ioRef = null;

let poll = null;                   // active poll (object from DB or created via socket)
const students = new Map();        // socketId -> { name }
const responses = new Map();       // qid -> Map(studentName -> optionIndex)
let currentQuestionId = null;
let timer = null;
let endsAt = null;

function getRoster() {
  return [...students.entries()].map(([socketId, { name }]) => ({ socketId, name }));
}

function disconnectBySocketId(socketId) {
  const sock = ioRef?.sockets?.sockets?.get(socketId);
  if (!sock) return false;
  ioRef.to(socketId).emit('student:removed', { reason: 'Removed by teacher' });
  sock.disconnect(true);
  return true;
}

function normalizeQuestions(questions = []) {
  return questions.map((q, i) => ({
    qid: q.id || q.qid || `q${i+1}`, 
    text: q.text,
    options: q.options || [],
    correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : undefined,
    timeLimitSec: typeof q.timeLimitSec === 'number' ? q.timeLimitSec : 60
  }));
}

function handleSocket(io, socket) {
  if (!ioRef) ioRef = io;

  socket.emit('state:init', { poll, currentQuestionId, endsAt, roster: getRoster() });

  // --- teacher resets the room (fresh session)
  socket.on('teacher:reset', (ack) => {
    try {
      poll = null;
      responses.clear();
      currentQuestionId = null;
      endsAt = null;
      if (timer) { clearTimeout(timer); timer = null; }
      io.emit('poll:cleared');
      ack?.({ ok: true });
    } catch (e) {
      ack?.({ ok: false, msg: e.message });
    }
  });

  // --- student joins
  socket.on('student:join', ({ name }, ack) => {
    if (!name || !name.trim()) return ack?.({ ok: false, msg: 'Name required' });
    students.set(socket.id, { name: name.trim() });
    ack?.({ ok: true });
    io.emit('room:count', { students: students.size });
    io.emit('room:roster', { roster: getRoster() });
  });

  // --- teacher creates poll via socket (optional)
  socket.on('teacher:createPoll', async ({ title, questions }, ack) => {
    try {
      const qs = normalizeQuestions(questions);
      if (process.env.MONGO_URI) {
        const saved = await Poll.create({ title: title || 'Poll', questions: qs });
        poll = saved.toObject();
        ack?.({ ok: true, pollId: saved._id.toString() });
      } else {
        poll = { id: 'p1', title: title || 'Poll', questions: qs };
        ack?.({ ok: true });
      }
      responses.clear();
      currentQuestionId = null;
      endsAt = null;
      io.emit('poll:created', poll);
    } catch (e) {
      console.error(e);
      ack?.({ ok: false, msg: 'Create failed' });
    }
  });

  // --- teacher loads poll by id (used after REST create)
  socket.on('teacher:loadPoll', async ({ pollId }, ack) => {
    try {
      if (!process.env.MONGO_URI) return ack?.({ ok: false, msg: 'No DB configured' });
      const p = await Poll.findById(pollId).lean();
      if (!p) return ack?.({ ok: false, msg: 'Poll not found' });
      poll = p;
      responses.clear();
      currentQuestionId = null;
      endsAt = null;
      io.emit('poll:created', poll);
      ack?.({ ok: true });
    } catch (e) {
      console.error(e);
      ack?.({ ok: false, msg: 'Load failed' });
    }
  });

  // --- start question
  socket.on('teacher:startQuestion', ({ questionId }, ack) => {
    if (!poll) return ack?.({ ok: false, msg: 'No poll' });
    if (currentQuestionId) return ack?.({ ok: false, msg: 'Another question is running' });

    const q = poll.questions.find(x => (x.qid || x.id) === questionId);
    if (!q) return ack?.({ ok: false, msg: 'Question not found' });

    const qid = q.qid || q.id;
    currentQuestionId = qid;
    responses.set(qid, new Map());

    const limit = q.timeLimitSec ?? 60;
    endsAt = Date.now() + limit * 1000;

    // Send question with correctIndex for students to know the right answer after submission
    io.emit('question:started', { 
      questionId: qid, 
      text: q.text, 
      options: q.options, 
      correctIndex: q.correctIndex, // Include correct answer
      endsAt 
    });

    timer = setTimeout(() => finalizeQuestion(io, q), limit * 1000);
    ack?.({ ok: true });
  });

  // --- student answer
  socket.on('student:answer', ({ questionId, optionIndex }, ack) => {
    if (!currentQuestionId || questionId !== currentQuestionId) {
      return ack?.({ ok: false, msg: 'No active question' });
    }
    const s = students.get(socket.id);
    if (!s) return ack?.({ ok: false, msg: 'Join first' });

    const qMap = responses.get(questionId);
    if (qMap.has(s.name)) return ack?.({ ok: false, msg: 'Already answered' });

    qMap.set(s.name, optionIndex);

    const q = poll.questions.find(x => (x.qid || x.id) === questionId);
    const counts = tallyCounts(q, qMap);
    
    // Send updated results with correct answer info
    io.emit('results:update', { 
      questionId, 
      counts,
      correctIndex: q.correctIndex 
    });

    // Auto-end if all students answered
    if (students.size > 0 && qMap.size >= students.size) {
      clearTimeout(timer);
      finalizeQuestion(io, q);
    }

    ack?.({ ok: true });
  });

  // --- end early
  socket.on('teacher:endQuestion', (ack) => {
    if (!currentQuestionId) return ack?.({ ok: false, msg: 'No active question' });
    const q = poll.questions.find(x => (x.qid || x.id) === currentQuestionId);
    clearTimeout(timer);
    finalizeQuestion(io, q);
    ack?.({ ok: true });
  });

  // --- remove student (teacher)
  socket.on('teacher:removeStudent', ({ socketId }, ack) => {
    const ok = disconnectBySocketId(socketId);
    ack?.({ ok });
  });

  // --- chat (bonus)
  socket.on('chat:message', ({ fromRole, text }, ack) => {
    const sender = students.get(socket.id);
    const name = fromRole === 'teacher' ? 'Teacher' : (sender?.name || 'Student');
    if (!text) return ack?.({ ok: false, msg: 'Text required' });
    io.emit('chat:new', { fromRole, name, text: text.trim(), ts: Date.now() });
    ack?.({ ok: true });
  });

  socket.on('disconnect', () => {
    students.delete(socket.id);
    io.emit('room:count', { students: students.size });
    io.emit('room:roster', { roster: getRoster() });
  });
}

async function finalizeQuestion(io, question) {
  const qid = question.qid || question.id;
  const qMap = responses.get(qid) || new Map();
  const counts = tallyCounts(question, qMap);

  // Persist final result if DB configured (bonus)
  try {
    if (poll?._id && process.env.MONGO_URI) {
      await Result.create({
        pollId: poll._id,
        qid,
        questionText: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
        counts,
        responses: [...qMap.entries()].map(([studentName, optionIndex]) => ({ studentName, optionIndex })),
        endedAt: new Date()
      });
    }
  } catch (e) {
    console.error('Result save failed:', e.message);
  }

  // Send final results with correct answer
  io.emit('results:final', { 
    questionId: qid, 
    counts,
    correctIndex: question.correctIndex 
  });
  
  responses.delete(qid);
  currentQuestionId = null;
  endsAt = null;
  timer = null;
}

module.exports = {
  handleSocket,
  getRoster,
  disconnectBySocketId,
  students,
  getIO: () => ioRef
};