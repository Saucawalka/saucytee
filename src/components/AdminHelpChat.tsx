import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import socket from '../../Socket';
import AdminHelpChatWidget from './AdminHelpChatWidget';

interface Message {
  _id: string;
  userId: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
}

interface UserSummary {
  _id: string;
  name: string;
  email: string;
}

const AdminHelpChat = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit('admin_join'); // Join as admin

    // Receive real-time user message
    socket.on('new_user_message', (msg: Message) => {
      if (msg.userId === selectedUserId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('new_user_message');
    };
  }, [selectedUserId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/chat/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch chat users:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/chat/${selectedUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [selectedUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selectedUserId) return;

    const newMessage = {
      userId: selectedUserId,
      sender: 'support' as const,
      message: input.trim(),
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/chat`, newMessage, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const savedMessage: Message = {
        ...res.data,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, savedMessage]);

      socket.emit('support_reply', savedMessage); // Send real-time message to user

      setInput('');
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  return (
    <div className="flex max-w-7xl mx-auto h-[600px] border rounded shadow">
      {/* Sidebar with Users */}
      <div className="w-1/4 border-r overflow-y-auto">
        <h2 className="p-4 font-bold border-b">Customers</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                selectedUserId === user._id ? 'bg-blue-200 font-semibold' : ''
              }`}
              onClick={() => setSelectedUserId(user._id)}
            >
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col space-y-3">
          {messages.length === 0 && <p className="text-center text-gray-500 mt-20">Select a customer to see messages</p>}
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 rounded max-w-[70%] ${
                msg.sender === 'support' ? 'bg-green-100 self-end' : 'bg-gray-100 self-start'
              }`}
            >
              <p>{msg.message}</p>
              <p className="text-xs text-gray-500 text-right">{new Date(msg.timestamp).toLocaleString()}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2 bg-gray-50">
          <input
            type="text"
            className="flex-1 rounded border px-4 py-2"
            placeholder="Type your reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
            disabled={!selectedUserId}
          />
          <button
            onClick={sendReply}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!selectedUserId || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
      <AdminHelpChatWidget />

    </div>
  );
};

export default AdminHelpChat;
