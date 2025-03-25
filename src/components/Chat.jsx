import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase-config.js";
import { X, MessageCircle } from "lucide-react"; // Import the close icon and message icon

const messagesRef = collection(db, "messages");

const Chat = ({ userId, courseName, username, room, onClose }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const queryMessages = query(messagesRef, where("room", "==", room), orderBy("createdAt"));
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        username,
        userId,
        room,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error adding message: ", error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-screen"
         style={{
           backgroundColor: "#0A2342",
           backgroundImage: "url('https://images.creativefabrica.com/products/previews/2024/04/29/jtJ6RdWRI/2fmfALPIIDB3sTXKVu0xyBFLDV7-mobile.jpg')", // Replace with your pattern URL
           backgroundSize: '300px',
           backgroundRepeat: 'repeat',
           backgroundBlendMode: 'overlay'
         }}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center rounded-t-lg">
        <div className="flex items-center">
          <MessageCircle className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">{courseName}</h1>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <X size={24} />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-opacity-90 bg-gray-800 border-t border-gray-700 rounded-lg">
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 shadow-sm
                  ${message.userId === userId
                    ? 'bg-blue-100 rounded-tr-none'
                    : 'bg-gray-700 rounded-tl-none'}`}
              >
                {message.userId !== userId && (
                  <div className="font-medium text-blue-600 text-sm">{message.username}</div>
                )}
                <p className={message.userId === userId ? "text-gray-800" : "text-gray-200"}>{message.text}</p>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{formatTimestamp(message.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-3 px-1 bg-gray-900 bg-opacity-90 flex items-center rounded-b-lg">
        <input
          className="flex-1 border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          placeholder="Type a message..."
          onChange={handleInputChange}
          value={newMessage}
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chat;
