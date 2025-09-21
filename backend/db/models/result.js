const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  studentName: String,
  optionIndex: Number
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  qid: { type: String, required: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  counts: { type: [Number], required: true },
  responses: { type: [ResponseSchema], default: [] },
  endedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
