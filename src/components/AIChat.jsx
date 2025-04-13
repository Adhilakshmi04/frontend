import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiTrash2 } from 'react-icons/fi';
import {jwtDecode} from 'jwt-decode';

const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const API_KEY = 'fw_3ZGSfkttd4BzxKoKnDzKCkhE';

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id; // Make sure this matches the field name in your JWT token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch chat history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const clearChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/chat/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages([]);
      } else {
        console.error('Failed to clear chat history:', data.message);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userId = getUserId();
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // First, get AI response
      const aiResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "accounts/fireworks/models/llama4-maverick-instruct-basic",
          max_tokens: 131072,
          top_p: 1,
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0,
          temperature: 0.6,
          messages: [
            {
              role: "user",
              content: input
            }
          ]
        })
      });

      const aiData = await aiResponse.json();
      const aiMessage = {
        role: 'assistant',
        content: aiData.choices[0].message.content,
        timestamp: new Date()
      };

      // Then, save both messages to backend
      const token = localStorage.getItem('token');
      const saveResponse = await fetch('http://localhost:5000/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [userMessage, aiMessage]
        })
      });

      const saveData = await saveResponse.json();
      if (!saveData.success) {
        console.error('Failed to save messages:', saveData.message);
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    if (content.includes('```')) {
      return content.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-800 text-white p-4 rounded-lg my-2 overflow-x-auto">
              <code>{part}</code>
            </pre>
          );
        }
        return <p key={index} className="mb-2">{part}</p>;
      });
    }
    return <p className="mb-2">{content}</p>;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:right-4 sm:bottom-4 mx-auto sm:mx-0 w-full sm:w-[400px] bg-[#080D27] rounded-t-lg sm:rounded-lg shadow-2xl z-50">
      <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-700 bg-[#080D27] rounded-t-lg">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          AI Assistant
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={clearChatHistory}
            className="text-gray-400 hover:text-red-500 transition-colors flex items-center"
          >
            <FiTrash2 size={18} className="mr-1" />
            <span className="text-sm">Clear</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)] sm:h-[500px] overflow-y-auto p-4 bg-[#0d1435]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-l-lg rounded-br-lg'
                    : 'bg-gray-700 text-white rounded-r-lg rounded-bl-lg'
                } p-3 shadow-md`}
              >
                <div className="text-xs text-gray-300 mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="text-sm">
                  {formatMessage(message.content)}
                </div>
                <div className="text-xs text-gray-400 text-right mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 p-4 bg-[#080D27] border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-700 text-white placeholder-gray-400 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
