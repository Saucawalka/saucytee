import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import socket from '../../Socket';

interface Message {
  _id: string;
  userId: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
}

const HelpChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return;

    // Register the user socket connection
    socket.emit('register', userId);

    // Fetch existing chat messages from the server
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/chat/admin/chat/${userId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    fetchMessages();

    // Handle receiving messages from server in real-time
    socket.on('receiveMessage', (msg: Message) => {
      if (msg.userId === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Cleanup listener on unmount
    return () => {
      socket.off('receiveMessage');
    };
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      userId,
      sender: 'user',
      message: input,
    };

    // Emit to backend via socket
    socket.emit('sendMessage', newMessage);

    // Optimistically add to UI
    setMessages((prev) => [
        ...prev,
        {
          _id: Math.random().toString(),
          timestamp: new Date().toISOString(),
          userId,
          sender: 'user', // already satisfies 'user' | 'support'
          message: input,
        },
      ]);
      

    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Need Help? Chat With Us</h1>
      <div className="bg-white p-4 rounded shadow h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 rounded w-fit max-w-[80%] ${
                msg.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs text-gray-500 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border px-4 py-2 rounded"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpChat;
