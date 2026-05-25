import React, { useState, useRef, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { Send, Sparkles } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Draft a 4-hour Seminar timeline",
  "Suggest budget for 200 guests in Seattle",
  "Will a Saturday concert draw good crowd?"
];

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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const triggerSend = async (textToSend) => {
    const userMessage = textToSend.trim();
    if (!userMessage) return;

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const val = input;
    setInput('');
    await triggerSend(val);
  };

  const handleSuggestedPromptClick = async (prompt) => {
    if (loading) return;
    await triggerSend(prompt);
  };

  // Helper to format bot markdown text to readable HTML
  const renderMessageText = (text) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\*\s(.*)$/gm, '<li>$1</li>');
      
    if (html.includes('<li>')) {
      html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    
    html = html.replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title="AI Chatbot Assistant" />

      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <div className="chat-container glass-panel">
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
              <div key={idx} className={`chat-message-row ${msg.isUser ? 'user' : 'bot'} animate-scale-in`}>
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

          {/* Quick Suggested Prompt Chips */}
          {messages.length === 1 && (
            <div className="animate-scale-in" style={{ padding: '0 24px 16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Suggested planning starters:</p>
              <div className="prompt-chips-container" style={{ padding: 0 }}>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    className="prompt-chip"
                    onClick={() => handleSuggestedPromptClick(prompt)}
                    disabled={loading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

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

