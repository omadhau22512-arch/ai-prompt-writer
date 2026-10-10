'use client';

import { useState } from 'react';

type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'improve' | 'generate'>('chat');
  const [error, setError] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError('');
    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'chat' ? '/api/ai/chat' : '/api/ai/generate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          mode,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiMessage: AIMessage = {
        role: 'assistant',
        content: data.message || data.prompt || 'No response generated',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h1>AI Prompt Assistant</h1>
          <p>Powered by OpenAI GPT-4</p>
        </div>
        <div className="mode-selector">
          <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="chat">Chat</option>
            <option value="improve">Improve Prompt</option>
            <option value="generate">Generate Prompt</option>
          </select>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>Start a conversation with the AI prompt assistant</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-body">
              <p>{msg.content}</p>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-body">
              <p className="typing-animation">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI assistant..."
          disabled={isLoading}
          className="message-input"
        />
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
