
import React from 'react';
import { MessageProps } from '../types';
import './Message.css';

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-content">
        {message.type === 'text' ? (
          <p className="message-text">{message.content}</p>
        ) : (
          <div className="image-container">
            {message.content && <p className="image-caption">{message.content}</p>}
            {message.imageUrl && (
              <img 
                src={message.imageUrl} 
                alt="Message content" 
                className="message-image"
                loading="lazy"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
