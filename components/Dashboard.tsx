'use client';

import { useEffect, useState } from 'react';
import PromptEditor from './PromptEditor';
import ChatWindow from './ChatWindow';
import PromptLibrary from './PromptLibrary';

type View = 'editor' | 'chat' | 'library';

type SavedPrompt = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('editor');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedPrompts();
  }, []);

  const fetchSavedPrompts = async () => {
    try {
      const response = await fetch('/api/save-prompt');
      if (response.ok) {
        const data = await response.json();
        setSavedPrompts(data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrompt = async (prompt: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/save-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });

      if (response.ok) {
        const savedPrompt = await response.json();
        setSavedPrompts((prev) => [savedPrompt, ...prev.filter((p) => p.id !== savedPrompt.id)]);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/save-prompt?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h2>✨ Prompt Studio</h2>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${currentView === 'editor' ? 'active' : ''}`}
            onClick={() => setCurrentView('editor')}
          >
            ✏️ Editor
          </button>
          <button
            className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentView('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`nav-item ${currentView === 'library' ? 'active' : ''}`}
            onClick={() => setCurrentView('library')}
          >
            📚 Library ({savedPrompts.length})
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">👤</div>
            <div>
              <p className="user-name">Guest User</p>
              <p className="user-email">demo@promptstudio.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {currentView === 'editor' && <PromptEditor onSave={handleSavePrompt} />}
        {currentView === 'chat' && <ChatWindow />}
        {currentView === 'library' && (
          <PromptLibrary
            prompts={savedPrompts}
            onSelect={(prompt) => {
              setSelectedPrompt(prompt);
              setCurrentView('editor');
            }}
            onDelete={handleDeletePrompt}
          />
        )}
      </main>
    </div>
  );
}
