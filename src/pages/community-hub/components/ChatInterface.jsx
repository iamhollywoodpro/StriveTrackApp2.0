import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ChatInterface = ({ user, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Mock messages
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hey! How's your workout going today?",
        sender: user?.name,
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isUser: false
      },
      {
        id: 2,
        text: "Just finished my morning run! 🏃‍♀️ 5k in 28 minutes",
        sender: 'You',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        isUser: true
      },
      {
        id: 3,
        text: "That's awesome! You're getting faster 💪",
        sender: user?.name,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isUser: false
      },
      {
        id: 4,
        text: "Want to do a challenge together this week?",
        sender: user?.name,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        isUser: false
      }
    ]);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (message?.trim()) {
      const newMessage = {
        id: messages?.length + 1,
        text: message,
        sender: 'You',
        timestamp: new Date(),
        isUser: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate response after a delay
      setTimeout(() => {
        const responses = [
          "Great idea! 🎯",
          "I'm in! When do we start?",
          "Sounds good to me!",
          "Let's do it! 🚀"
        ];
        
        const response = {
          id: messages?.length + 2,
          text: responses?.[Math.floor(Math.random() * responses?.length)],
          sender: user?.name,
          timestamp: new Date(),
          isUser: false
        };
        
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return new Date(timestamp)?.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-xl shadow-xl z-50">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-border"
            />
            {user?.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {user?.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {user?.isOnline ? 'Active now' : user?.lastActivity}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Icon name="Phone" size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="Video" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>
      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages?.map((msg) => (
          <div
            key={msg?.id}
            className={`flex ${msg?.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg?.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{msg?.text}</p>
              <p className={`text-xs mt-1 ${
                msg?.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {formatMessageTime(msg?.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
          >
            <Icon name="Plus" size={16} />
          </Button>
          
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e?.target?.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm"
          />
          
          <Button
            type="submit"
            size="sm"
            disabled={!message?.trim()}
            className="flex-shrink-0"
          >
            <Icon name="Send" size={16} />
          </Button>
        </form>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🏃‍♀️ Workout?
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🎯 Challenge
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
          >
            📸 Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;