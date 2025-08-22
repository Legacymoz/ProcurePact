import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Brain, Minimize2 } from 'lucide-react';
import '../../styles/ProcureChat/ProcureChat.css';

const ProcureChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m ProcureChat, your AI procurement assistant. How can I help you with your business intelligence needs today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponses = [
        "I can help you analyze your procurement spending patterns. Would you like to see your top suppliers by spend?",
        "Based on your data, I notice some potential cost savings opportunities in your office supplies category. Would you like me to elaborate?",
        "Your contract renewal rate is 85% this quarter. I can provide recommendations to improve supplier relationships.",
        "I've identified 3 invoices that are overdue. Would you like me to prioritize them by amount?",
        "Your procurement KPIs show strong performance in delivery times but there's room for improvement in cost variance. Let me break this down for you."
      ];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        message: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    "Contract renewals due",
    "Top suppliers analysis",
    "Cost savings opportunities"
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action);
    handleSendMessage();
  };

  if (!isOpen) {
    return (
      <div className="procure-chat-container">
        <button
          onClick={() => setIsOpen(true)}
          className="floating-chat-button"
          aria-label="Open ProcureChat"
        >
          <MessageCircle className="chat-icon" />
          <div className="status-indicator">
            <div className="status-dot"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="procure-chat-container">
      <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="bot-avatar">
              <Brain className="bot-icon" />
            </div>
            <div className="chat-title-section">
              <h3 className="chat-title">ProcureChat</h3>
              <span className="chat-status">Online</span>
            </div>
          </div>
          <div className="chat-controls">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="control-button"
              title="Minimize"
            >
              <Minimize2 className="control-icon" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="control-button"
              title="Close"
            >
              <X className="control-icon" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className={`chat-messages ${isMinimized ? 'hidden' : ''}`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'bot' ? (
                  <Bot className="avatar-icon bot-avatar-icon" />
                ) : (
                  <User className="avatar-icon user-avatar-icon" />
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {msg.message}
                </div>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot className="avatar-icon bot-avatar-icon" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="quick-actions">
              <p className="quick-actions-title">Try asking me about:</p>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="quick-action-button"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className={`chat-input-container ${isMinimized ? 'hidden' : ''}`}>
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your procurement data..."
              className="chat-input"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
              title="Send message"
            >
              <Send className="send-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcureChat;