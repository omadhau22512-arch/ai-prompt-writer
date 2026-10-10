'use client';

import { useState } from 'react';

type PromptEditorProps = {
  onSave: (prompt: any) => void;
};

export default function PromptEditor({ onSave }: PromptEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const categories = ['General', 'Marketing', 'Writing', 'Coding', 'Business', 'Creative'];

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter a title and content');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    onSave({
      title,
      content,
      category,
      tags: tagArray,
      isPublic,
    });

    setTitle('');
    setContent('');
    setTags('');
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>Create New Prompt</h1>
        <p>Design and refine your AI prompts</p>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Prompt Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Product Launch Email Template"
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., email, sales, template"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Prompt Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your prompt here..."
            className="form-textarea"
            rows={12}
          />
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label htmlFor="isPublic">Make this prompt public</label>
        </div>

        <div className="editor-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Prompt
          </button>
          <button className="btn btn-secondary" onClick={() => setContent('')}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
