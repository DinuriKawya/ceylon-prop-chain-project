import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { getChatbotResponse } from '../services/chatbotService';

export const ChatContext = createContext();

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;
const voiceSupported = !!SpeechRecognitionAPI;

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatAreaRef = useRef(null);
  const recognitionRef = useRef(null);

  const triggerHighlight = () => setIsHighlighted(true);

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startVoiceInput = () => {
    if (!voiceSupported || isListening) return;

    setChatMessage('');

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += segment + ' ';
        } else {
          interimTranscript += segment;
        }
      }
      setChatMessage((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access was blocked. Please allow microphone permission to use voice input.');
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
      handleChatKeyDown,
      voiceSupported,
      isListening,
      toggleVoiceInput
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
