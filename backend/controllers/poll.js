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

// Add these new functions to your existing poll controller

const getPollHistory = async (_req, res) => {
  try {
    // Get unique polls that have results
    const pipeline = [
      {
        $group: {
          _id: "$pollId",
          title: { $first: "$title" }, // We'll need to add title to Result model
          lastCompleted: { $max: "$endedAt" },
          totalQuestions: { $sum: 1 },
          participants: { $first: { $size: "$responses" } }
        }
      },
      { $sort: { lastCompleted: -1 } },
      { $limit: 50 }
    ];

    const history = await Result.aggregate(pipeline);
    
    // Get poll titles from Poll collection
    const pollIds = history.map(h => h._id);
    const polls = await Poll.find({ _id: { $in: pollIds } }).lean();
    
    const enrichedHistory = history.map(h => {
      const poll = polls.find(p => p._id.toString() === h._id.toString());
      return {
        ...h,
        title: poll?.title || 'Untitled Poll'
      };
    });

    res.json({ success: true, results: enrichedHistory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getHistoryDetails = async (req, res) => {
  try {
    const { pollId } = req.params;
    
    // Get poll details
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Get all results for this poll
    const results = await Result.find({ pollId }).sort({ endedAt: 1 }).lean();
    
    res.json({ 
      success: true, 
      poll,
      results: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update your existing exports
module.exports = {
  createPoll,
  getPolls,
  getPollById,
  getPollResults,
  getLatestPoll,
  getPollHistory,    
  getHistoryDetails
};

