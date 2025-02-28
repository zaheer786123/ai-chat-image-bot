
import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import { Message as MessageType } from '../types';
import { processTextWithAI } from '../services/geminiService';
import { generateImage } from '../services/huggingfaceService';
import { analyzeImage } from '../services/imageAnalysisService';
import './ChatInterface.css';

interface ChatInterfaceProps {
  mode: 'chat' | 'upload' | 'generate';
  setMode: (mode: 'chat' | 'upload' | 'generate' | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode, setMode }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  useEffect(() => {
    // Set initial message based on mode
    const welcomeMessages = {
      chat: "Hi there! I'm your AI assistant. How can I help you today?",
      upload: "Upload an image and I'll analyze it for you.",
      generate: "Describe the image you want me to create."
    };

    const initialMessage: MessageType = {
      id: generateId(),
      role: 'assistant',
      content: welcomeMessages[mode],
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([initialMessage]);

    // Automatically open file dialog if in upload mode
    if (mode === 'upload' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [mode]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Add user message with image
    const userMessage: MessageType = {
      id: generateId(),
      role: 'user',
      content: 'Please analyze this image.',
      timestamp: new Date(),
      type: 'image',
      imageUrl: url
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the image
    setIsLoading(true);
    try {
      const analysis = await analyzeImage(file);
      
      const aiResponse: MessageType = {
        id: generateId(),
        role: 'assistant',
        content: analysis,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      const errorMessage: MessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I had trouble analyzing that image. Could you try another one?',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageGeneration = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const userMessage: MessageType = {
        id: generateId(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const imageUrl = await generateImage(prompt);
      
      const aiResponse: MessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'Here\'s the image I generated:',
        timestamp: new Date(),
        type: 'image',
        imageUrl
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating image:', error);
      
      const errorMessage: MessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I had trouble generating that image. Could you try a different prompt?',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  const handleSendMessage = async () => {
    if (isLoading) return;
    
    if (mode === 'generate') {
      await handleImageGeneration(inputText);
      return;
    }
    
    if (!inputText.trim()) return;
    
    const userMessage: MessageType = {
      id: generateId(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await processTextWithAI(inputText);
      
      const aiResponse: MessageType = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error processing with AI:', error);
      
      const errorMessage: MessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Could you try again?',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleNewChat = () => {
    setMode(null);
    setMessages([]);
    setImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="chat-interface">
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        )}
      </div>
      
      <div className="input-area">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <span className="plus-icon">+</span>
        </button>
        
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me something..."
            disabled={isLoading}
          />
          
          {mode === 'upload' && (
            <button 
              className="upload-btn"
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              🖼️
            </button>
          )}
          
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || (!inputText.trim() && mode !== 'upload')}
          >
            ↑
          </button>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ChatInterface;
