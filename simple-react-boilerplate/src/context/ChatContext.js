import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { getChatbotResponse } from '../services/chatbotService';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef(null);

  const triggerHighlight = () => setIsHighlighted(true);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const sendChatMessage = async (overrideMessage) => {
    const messageToSend = overrideMessage || chatMessage;
    if (!messageToSend.trim()) {
      alert('Please enter a message');
      return;
    }

    const userMsg = { role: 'user', text: messageToSend };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsTyping(true);

    let assistantAdded = false;

    try {
      await getChatbotResponse(messageToSend, (currentText) => {
        setIsTyping(false);
        if (!assistantAdded) {
          assistantAdded = true;
          setChatHistory(prev => [...prev, { role: 'assistant', text: currentText }]);
        } else {
          setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], text: currentText };
            return newHistory;
          });
        }
      });
    } catch (error) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.push({ role: 'error', text: error.message || 'Something went wrong. Please try again.' });
        return newHistory;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      isHighlighted,
      setIsHighlighted,
      triggerHighlight,
      chatMessage,
      setChatMessage,
      chatHistory,
      setChatHistory,
      isTyping,
      chatAreaRef,
      sendChatMessage,
      handleChatKeyDown
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
