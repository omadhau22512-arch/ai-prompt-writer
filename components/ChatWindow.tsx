'use client';

import { useEffect, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt?: string;
};

export default function ChatWindow() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0) {
          setCurrentConversation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation?.id,
          message: inputMessage,
          role: 'user',
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCurrentConversation(updated);
        setConversations((prev) =>
          prev.map((conv) => (conv.id === updated.id ? updated : conv))
        );
        setInputMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    setCurrentConversation({
      id: `conv-${Date.now()}`,
      messages: [],
      createdAt: new Date().toISOString(),
    });
    setInputMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Prompt Assistant Chat</h1>
        <button className="btn btn-secondary" onClick={createNewConversation}>
          ➕ New Chat
        </button>
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="conversation-list">
            <h3>Conversations</h3>
            {conversations.length === 0 ? (
              <p className="empty-state">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => setCurrentConversation(conv)}
                >
                  <span className="conv-date">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </span>
                  <span className="conv-preview">
                    {conv.messages.length > 0
                      ? conv.messages[0].content.substring(0, 30) + '...'
                      : 'New conversation'}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="chat-main">
          <div className="messages-container">
            {currentConversation?.messages.length === 0 ? (
              <div className="empty-state">
                <p>Start a new conversation</p>
              </div>
            ) : (
              currentConversation?.messages.map((msg, idx) => (
                <div key={idx} className={`message message-${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about prompts..."
              disabled={isLoading}
              className="message-input"
            />
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
