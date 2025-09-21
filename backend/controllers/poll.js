const Poll = require('../db/models/poll');
const Result = require('../db/models/result');

const createPoll = async (req, res) => {
  try {
    const { title, durationSec, questions } = req.body;
    if (!title || !Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ success: false, message: 'title & questions required' });
    }

    const formatted = questions.map((q, i) => ({
      qid: q.id || q.qid || `q${i + 1}`,
      text: q.text,
      options: q.options || [],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : undefined,
      timeLimitSec: typeof durationSec === 'number' ? durationSec : (q.timeLimitSec ?? 60),
    }));

    const poll = await Poll.create({ title, questions: formatted });
    res.status(201).json({ success: true, poll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPolls = async (_req, res) => {
  const polls = await Poll.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, polls });
};

const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).lean();
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });
    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// BONUS: past results for a poll (persisted by socket finalize handler)
const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const rows = await Result.find({ pollId }).sort({ endedAt: 1 }).lean();
    res.json({ success: true, results: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Convenience: fetch latest poll
const getLatestPoll = async (_req, res) => {
  const poll = await Poll.findOne().sort({ createdAt: -1 }).lean();
  if (!poll) return res.status(404).json({ success: false, message: 'No polls found' });
  res.json({ success: true, poll });
};

module.exports = {
  createPoll,
  getPolls,
  getPollById,
  getPollResults,
  getLatestPoll,
};
