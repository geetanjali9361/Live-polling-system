import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import http from '../api/http';

// One socket shared by the whole app
const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
export const socket = io(API, { transports: ['websocket'] });

const PollCtx = createContext(null);
export const usePoll = () => useContext(PollCtx);

export default function PollProvider({ children }) {
  // -------- Global state --------
  const [role, setRole] = useState(null);      // 'teacher' | 'student'
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);

  const [poll, setPoll] = useState(null);      // { _id, title, questions[] }
  const [activeQ, setActiveQ] = useState(null);// qid of active question
  const [endsAt, setEndsAt] = useState(null);  // ms timestamp
  const [counts, setCounts] = useState([]);    // live results
  const [roster, setRoster] = useState([]);    // connected students
  const [chat, setChat] = useState([]);        // chat log

  // NEW: the currently running question payload (text/options/correctIndex if present)
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // -------- Refs for auto-rejoin --------
  const roleRef = useRef(role);
  const nameRef = useRef(name);
  useEffect(() => { roleRef.current = role; }, [role]);
  useEffect(() => { nameRef.current = name; }, [name]);

  // -------- Socket listeners --------
  useEffect(() => {
    const onInit = ({ poll, currentQuestionId, endsAt, roster }) => {
      // Always hydrate UI with latest server state
      if (poll) {
        setPoll(poll);
        // If a question is running and we don't have currentQuestion yet,
        // try to derive it from the poll by qid.
        if (currentQuestionId) {
          const q = (poll.questions || []).find(x => (x.qid || x.id) === currentQuestionId);
          if (q) setCurrentQuestion(q);
        }
      }
      setActiveQ(currentQuestionId || null);
      setEndsAt(endsAt || null);
      if (roster) setRoster(roster);
    };

    const onConnect = () => {
      // Auto re-join student if page reloads
      if (roleRef.current === 'student' && nameRef.current) {
        socket.emit('student:join', { name: nameRef.current }, (ack) => {
          if (ack?.ok) setJoined(true);
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('state:init', onInit);

    socket.on('poll:created', (p) => {
      setPoll(p);
      setActiveQ(null);
      setEndsAt(null);
      setCounts([]);
      setCurrentQuestion(null);
    });

    socket.on('question:started', ({ questionId, text, options, endsAt }) => {
      setActiveQ(questionId);
      setEndsAt(endsAt);
      setCounts([]); // reset results
      // Keep a local copy so Student can render even if poll isn't ready yet
      setCurrentQuestion({ qid: questionId, text, options });
    });

    socket.on('results:update', ({ questionId, counts }) => {
      setCounts(prev => (questionId === activeQ ? counts : prev));
    });

    socket.on('results:final', ({ questionId, counts }) => {
      if (questionId === activeQ) setCounts(counts);
      setActiveQ(null);
      setEndsAt(null);
      // Keep currentQuestion so students still see the bars after the timer
    });

    socket.on('room:roster', ({ roster }) => setRoster(roster));
    socket.on('chat:new', msg => setChat(prev => [...prev, msg]));
    socket.on('student:removed', () => {
      alert("You've been kicked out by the teacher.");
      window.location.reload();
    });

    socket.on('poll:cleared', () => {
      setPoll(null);
      setActiveQ(null);
      setEndsAt(null);
      setCounts([]);
      setCurrentQuestion(null);
    });

    return () => {
      socket.removeAllListeners(); // clean slate
    };
  }, [activeQ]);

  // -------- Helpers --------
  const joinAsStudent = (studentName) =>
    new Promise((resolve) => {
      socket.emit('student:join', { name: studentName }, (ack) => {
        if (ack?.ok) { setRole('student'); setName(studentName); setJoined(true); }
        resolve(ack);
      });
    });

  const startQuestion = (qid) => new Promise((r) =>
    socket.emit('teacher:startQuestion', { questionId: qid }, (ack) => r(ack))
  );

  const endQuestion = () => new Promise((r) =>
    socket.emit('teacher:endQuestion', (ack) => r(ack))
  );

  const removeStudent = (socketId) => new Promise((r) =>
    socket.emit('teacher:removeStudent', { socketId }, (ack) => r(ack))
  );

  const sendChat = (text) => new Promise((r) =>
    socket.emit('chat:message', { fromRole: role, text }, (ack) => r(ack))
  );

  const createPoll = async (payload) => {
    const { data } = await http.post('/polls', payload);
    const created = data.poll;

    // Tell the socket room to load the poll we just created
    await new Promise((resolve) => {
      socket.emit('teacher:loadPoll', { pollId: created._id }, () => resolve());
    });

    setPoll(created);
    setCurrentQuestion(null);
    return created;
  };

  const fetchLatest = () => http.get('/polls/latest').then(r => r.data.poll);
  const fetchHistory = (pollId) => http.get(`/polls/${pollId}/results`).then(r => r.data.results);

  // -------- Value --------
  const value = {
    role, setRole, name, setName, joined, setJoined,
    poll, setPoll, activeQ, endsAt, counts, roster, chat,
    currentQuestion, setCurrentQuestion,
    joinAsStudent, startQuestion, endQuestion, removeStudent, sendChat,
    createPoll, fetchLatest, fetchHistory,
  };

  return <PollCtx.Provider value={value}>{children}</PollCtx.Provider>;
}
