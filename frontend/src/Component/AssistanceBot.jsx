import React, { useState, useEffect, useRef } from 'react';
import './AssistanceBot.css';

const AssistanceBot = ({ onClose }) => { // Add onClose prop to handle closing
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Track visibility
  const chatboxRef = useRef(null);

  const API_CONFIG = {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    key: import.meta.env.VITE_GEMINI_API_KEY || '',
  };

  const getGeminiResponse = async (message) => {
    if (!API_CONFIG.key) {
      return {
        success: true,
        data: `Mock response to: "${message}" (No API key provided)`,
      };
    }

    try {
      const url = `${API_CONFIG.url}?key=${API_CONFIG.key}`;
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      if (json.error) {
        throw new Error(json.error.message || 'Unknown API error');
      }

      if (!json.candidates || !json.candidates[0] || !json.candidates[0].content || !json.candidates[0].content.parts) {
        throw new Error("Invalid response structure from Gemini API");
      }

      return {
        success: true,
        data: json.candidates[0].content.parts[0].text || 'No response from AI',
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: `API Error: ${error.message}. Please check your console for more details.`,
      };
    }
  };

  const addMessage = (message, sender = 'user') => {
    setMessages((prev) => [
      ...prev,
      { sender, message, timestamp: new Date().toISOString() },
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const handleMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) return;

    setIsProcessing(true);
    addMessage(trimmedInput, 'user');
    setInput('');

    try {
      const response = await getGeminiResponse(trimmedInput);
      if (response.success) {
        addMessage(response.data, 'chatbot');
      } else {
        addMessage('Sorry, I encountered an error. Please try again later.', 'chatbot');
        console.error('API Error:', response.error);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('An unexpected error occurred. Please try again.', 'chatbot');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false); // Hide the bot locally
    if (onClose) {
      onClose(); // Notify the parent component to update visibility
    }
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isVisible) return null; // Don't render if hidden

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-left">
          🤖
          <h1>Assistance Bot</h1>
        </div>
        <div className="header-right">
          <button
            className="close-button"
            onClick={handleClose}
            title="Close chatbot"
          >
            ✕
          </button>
          <span className="status-indicator"></span>
          <span className="status-text">Online</span>
        </div>
      </header>

      <div className="chat-messages" id="chatbox" ref={chatboxRef}>
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>👋 Welcome!</h2>
            <p>I'm your AI assistant. How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-container">
        <div className="input-wrapper">
          <input
            type="text"
            id="messageInput"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleMessage()}
            disabled={isProcessing}
          />
          <div className="input-actions">
            <button
              className="action-button"
              id="clearButton"
              title="Clear chat"
              onClick={clearMessages}
              disabled={isProcessing}
            >
              🗑️
            </button>
            <button
              className="action-button"
              id="sendButton"
              title="Send message"
              onClick={handleMessage}
              disabled={isProcessing}
            >
              ✈️
            </button>
          </div>
        </div>
        <div className="typing-indicator" style={{ display: isProcessing ? 'flex' : 'none' }}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default AssistanceBot;