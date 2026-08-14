import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faCommentDots, faComments, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useChat } from '../../context/ChatContext';
import './ChatWidget.css';

const ChatWidget = () => {
  const {
    isOpen,
    setIsOpen,
    isHighlighted,
    setIsHighlighted,
    chatMessage,
    setChatMessage,
    chatHistory,
    setChatHistory,
    isTyping,
    chatAreaRef,
    sendChatMessage,
    handleChatKeyDown
  } = useChat();

  useEffect(() => {
    if (!isHighlighted) return;

    const clearHighlight = () => setIsHighlighted(false);
    window.addEventListener('scroll', clearHighlight, { passive: true });
    const timeout = setTimeout(clearHighlight, 6000);

    return () => {
      window.removeEventListener('scroll', clearHighlight);
      clearTimeout(timeout);
    };
  }, [isHighlighted, setIsHighlighted]);

  const handleToggleClick = () => {
    setIsOpen(!isOpen);
    setIsHighlighted(false);
  };

  return (
    <>
      <button className={`chat-widget-toggle ${isOpen ? 'is-open' : ''} ${isHighlighted && !isOpen ? 'is-highlighted' : ''}`} onClick={handleToggleClick} aria-label="Toggle investment assistant">
        <FontAwesomeIcon icon={isOpen ? faTimes : faComments} />
        {!isOpen && <span className="chat-widget-toggle-label">AI Assistant</span>}
      </button>

      {isOpen && (
        <div className="chat-widget-panel">
          <div className="ai-header">
            <span className="ai-icon"><FontAwesomeIcon icon={faRobot} /></span>
            <h3>Investment Assistant</h3>
            {chatHistory.length > 0 && <button className="chat-clear-btn" onClick={() => setChatHistory([])}>Clear</button>}
          </div>
          <div className="chat-area" ref={chatAreaRef}>
            {chatHistory.length === 0 && (
              <div className="chat-welcome">
                <span className="chat-welcome-icon"><FontAwesomeIcon icon={faCommentDots} /></span>
                <p>Hi! I'm your AI investment assistant. Ask me anything about Sri Lankan real estate, tokenization, or investment opportunities!</p>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-message chat-message-${msg.role}`}>
                {msg.role === 'assistant' && <span className="msg-avatar"><FontAwesomeIcon icon={faRobot} /></span>}
                {msg.role === 'error' && <span className="msg-avatar">⚠️</span>}
                <div className={`msg-bubble msg-bubble-${msg.role}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message chat-message-assistant">
                <span className="msg-avatar"><FontAwesomeIcon icon={faRobot} /></span>
                <div className="msg-bubble msg-bubble-assistant typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask about investment opportunities..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={handleChatKeyDown}
              className="chat-input"
              disabled={isTyping}
            />
            <button className="btn-primary" onClick={() => sendChatMessage()} disabled={isTyping}>{isTyping ? '...' : 'Send'}</button>
          </div>
          <div className="quick-questions">
            <p>Quick questions:</p>
            <div className="quick-buttons">
              <button disabled={isTyping} onClick={() => sendChatMessage("What's the best investment area in Sri Lanka?")}>Best investment area?</button>
              <button disabled={isTyping} onClick={() => sendChatMessage("How does fractional ownership work on CeylonPropChain?")}>Fractional ownership?</button>
              <button disabled={isTyping} onClick={() => sendChatMessage("What are the growth projections for Sri Lankan real estate?")}>Growth projections?</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
