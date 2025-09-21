const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  studentName: String,
  optionIndex: Number
});

const ResultSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' },
  qid: String,
  questionText: String,
  options: [String],
  correctIndex: Number,
  counts: [Number],
  responses: [ResponseSchema],
  endedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);