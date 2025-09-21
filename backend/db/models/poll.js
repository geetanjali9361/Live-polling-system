const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  qid: String,
  text: String,
  options: [String],
  correctIndex: Number,
  timeLimitSec: { type: Number, default: 60 }
});

const PollSchema = new mongoose.Schema({
  title: String,
  questions: [QuestionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
