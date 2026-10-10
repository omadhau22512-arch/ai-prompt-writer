'use client';

import { useState } from 'react';

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

type PromptLibraryProps = {
  prompts: SavedPrompt[];
  onSelect: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
};

export default function PromptLibrary({ prompts, onSelect, onDelete }: PromptLibraryProps) {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'General', 'Marketing', 'Writing', 'Coding', 'Business', 'Creative'];

  const filteredPrompts = prompts
    .filter((prompt) => filter === 'All' || prompt.category === filter)
    .filter((prompt) => prompt.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>Prompt Library</h1>
        <p>Browse and manage your saved prompts</p>
      </div>

      <div className="library-controls">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search prompts..."
          className="search-input"
        />

        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="prompts-grid">
        {filteredPrompts.length === 0 ? (
          <div className="empty-state">
            <p>No prompts found</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="prompt-card">
              <div className="card-header">
                <h3>{prompt.title}</h3>
                {prompt.isPublic && <span className="badge-public">Public</span>}
              </div>

              <p className="card-category">{prompt.category}</p>

              <p className="card-content">{prompt.content.substring(0, 120)}...</p>

              {prompt.tags.length > 0 && (
                <div className="card-tags">
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="card-meta">
                <small>{new Date(prompt.createdAt).toLocaleDateString()}</small>
              </div>

              <div className="card-actions">
                <button className="btn btn-small btn-primary" onClick={() => onSelect(prompt)}>
                  Edit
                </button>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(prompt.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
