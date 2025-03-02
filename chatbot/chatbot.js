// chatbot.js

class Chatbot {
  constructor() {
      this.messages = [];
      this.isProcessing = false;
  }

  addMessage(message, sender = 'user') {
      this.messages.push({ 
          sender, 
          message, 
          timestamp: new Date().toISOString() 
      });
  }

  getMessages() {
      return this.messages;
  }

  clearMessages() {
      this.messages = [];
  }
}

const chatbot = new Chatbot();

// API configuration
const API_CONFIG = {
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  key: 'AIzaSyClSEeNPdTPPMiwFjyL2CusotXdaESwxik' // Replace with your new API key or set via environment variable
};

// UI Elements
const elements = {
  chatbox: document.getElementById('chatbox'),
  messageInput: document.getElementById('messageInput'),
  sendButton: document.getElementById('sendButton'),
  clearButton: document.getElementById('clearButton'),
  typingIndicator: document.getElementById('typingIndicator')
};

// Message templates
const createMessageElement = (message, sender) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = message;
  
  messageDiv.appendChild(content);
  return messageDiv;
};

// API interaction
async function getGeminiResponse(message) {
  if (!API_CONFIG.key) {
      return {
          success: true,
          data: `Mock response to: "${message}" (No API key provided)`
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

      console.log('Sending request:', requestBody);

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
          console.error('Response Error Details:', errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      console.log('Parsed API Response:', json);

      if (json.error) {
          throw new Error(json.error.message || 'Unknown API error');
      }

      if (!json.candidates || !json.candidates[0] || !json.candidates[0].content || !json.candidates[0].content.parts) {
          throw new Error("Invalid response structure from Gemini API");
      }

      return {
          success: true,
          data: json.candidates[0].content.parts[0].text || 'No response from AI'
      };
  } catch (error) {
      console.error('API Error:', error);
      return {
          success: false,
          error: `API Error: ${error.message}. Please check your console for more details.`
      };
  }
}

// UI updates
function updateChatbox() {
  elements.chatbox.innerHTML = '';
  
  // Add welcome message if no messages
  if (chatbot.getMessages().length === 0) {
      const welcomeDiv = document.createElement('div');
      welcomeDiv.className = 'welcome-message';
      welcomeDiv.innerHTML = `
          <h2>👋 Welcome!</h2>
          <p>I'm your AI assistant. How can I help you today?</p>
      `;
      elements.chatbox.appendChild(welcomeDiv);
  }
  
  chatbot.getMessages().forEach(({ sender, message }) => {
      const messageElement = createMessageElement(message, sender);
      elements.chatbox.appendChild(messageElement);
  });

  elements.chatbox.scrollTop = elements.chatbox.scrollHeight;
}

function setLoadingState(isLoading) {
  elements.sendButton.disabled = isLoading;
  elements.messageInput.disabled = isLoading;
  elements.typingIndicator.style.display = isLoading ? 'flex' : 'none';
}

// Message handling
async function handleMessage() {
  const message = elements.messageInput.value.trim();

  if (!message || chatbot.isProcessing) {
      return;
  }

  try {
      chatbot.isProcessing = true;
      setLoadingState(true);

      // Add user message
      chatbot.addMessage(message, 'user');
      updateChatbox();
      elements.messageInput.value = '';

      // Get and add bot response
      const response = await getGeminiResponse(message);
      
      if (response.success) {
          chatbot.addMessage(response.data, 'chatbot');
      } else {
          chatbot.addMessage(
              'Sorry, I encountered an error. Please try again later.',
              'chatbot'
          );
          console.error('API Error:', response.error);
      }
  } catch (error) {
      console.error('Error:', error);
      chatbot.addMessage(
          'An unexpected error occurred. Please try again.',
          'chatbot'
      );
  } finally {
      chatbot.isProcessing = false;
      setLoadingState(false);
      updateChatbox();
  }
}

function clearChat() {
  chatbot.clearMessages();
  updateChatbox();
}

// Event listeners
elements.sendButton.addEventListener('click', handleMessage);
elements.clearButton.addEventListener('click', clearChat);
elements.messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
      handleMessage();
  }
});

// Initialize
updateChatbox();