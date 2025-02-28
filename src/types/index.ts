
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface MessageProps {
  message: Message;
}
