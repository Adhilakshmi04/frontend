const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChatHistory = require('../models/ChatHistory');
const mongoose = require('mongoose');

// Get chat history for a user
router.get('/history', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const chatHistory = await ChatHistory.findOne({ 
      userId: mongoose.Types.ObjectId(req.user.id)
    });

    res.json({
      success: true,
      messages: chatHistory ? chatHistory.messages : []
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history'
    });
  }
});

// Save new messages
router.post('/save', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format'
      });
    }

    let chatHistory = await ChatHistory.findOne({ 
      userId: mongoose.Types.ObjectId(req.user.id)
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: mongoose.Types.ObjectId(req.user.id),
        messages: []
      });
    }

    // Add timestamps if not present
    const messagesWithTimestamp = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || new Date()
    }));

    chatHistory.messages.push(...messagesWithTimestamp);
    await chatHistory.save();

    res.json({
      success: true,
      message: 'Messages saved successfully'
    });
  } catch (error) {
    console.error('Error saving messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving messages'
    });
  }
});

// Clear chat history
router.delete('/clear', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await ChatHistory.findOneAndUpdate(
      { userId: mongoose.Types.ObjectId(req.user.id) },
      { $set: { messages: [] } },
      { upsert: true, new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Chat history not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing chat history'
    });
  }
});

module.exports = router; 