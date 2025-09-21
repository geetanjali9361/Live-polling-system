// src/utils/teacherCreateAndStart.js
import axios from 'axios'
import { socket } from '../context/pollContext'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export async function createAndStart({ title, durationSec, text, options, correctIndex }) {
  // 1) Create poll
  const { data } = await axios.post(`${API}/polls`, {
    title,
    durationSec,
    questions: [{ text, options, correctIndex }]
  })
  const poll = data.poll

  // 2) Broadcast poll via socket
  await new Promise((resolve) => {
    socket.emit('teacher:loadPoll', { pollId: poll._id }, (ack) => {
      console.log('loadPoll ack:', ack)
      resolve()
    })
  })

  // 3) Start first question
  const qid = poll.questions[0].qid
  socket.emit('teacher:startQuestion', { questionId: qid }, (ack) => {
    if (!ack?.ok) alert(ack?.msg || 'Could not start')
  })

  return poll
}
