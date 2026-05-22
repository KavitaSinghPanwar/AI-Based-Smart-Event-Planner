import React, { useState, useRef, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { Send, Sparkles } from 'lucide-react';

const ChatbotAssistant = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am **EventAI**, your intelligent virtual planner assistant. How can I help you plan your next event?",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      const response = await api.post('ai/chatbot/', {
        message: userMessage,
        history: messages
      });
      
      setMessages(prev => [...prev, { text: response.data.response, isUser: false }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble connecting to my cognitive networks. Please try sending your query again in a moment.", 
        isUser: false 
      }]);
    }
    setLoading(false);
  };

  // Helper to format bot markdown text to readable HTML
  const renderMessageText = (text) => {
    // Simple markdown parsing for bolding and lists
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\*\s(.*)$/gm, '<li>$1</li>');
      
    // Wrap lists
    if (html.includes('<li>')) {
      html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    
    // Replace newlines with breaks
    html = html.replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="main-layout">
      <Header title="AI Chatbot Assistant" />

      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-avatar">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="chat-header-title">EventAI assistant</div>
              <div className="chat-header-subtitle">Powered by Gemini AI</div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message-row ${msg.isUser ? 'user' : 'bot'}`}>
                <div className="chat-bubble">
                  {msg.isUser ? msg.text : renderMessageText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message-row bot">
                <div className="chat-bubble" style={{ padding: '10px 14px' }}>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input 
              type="text" 
              className="chat-input"
              placeholder="Ask anything about event themes, schedules, pricing, venues..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="chat-send-btn" disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAssistant;
