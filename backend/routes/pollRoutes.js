const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPolls,
  getPollById,
  getPollResults,
  getLatestPoll,    // optional convenience
} = require('../controllers/poll');

// Convenience: latest created poll
router.get('/latest', getLatestPoll);

// Results (bonus: past results not stored locally)
router.get('/:pollId/results', getPollResults);

// Single poll by id
router.get('/:id', getPollById);

// List all polls
router.get('/', getPolls);

// Create new poll
router.post('/', createPoll);

module.exports = router;
