'use client';

import { useState } from 'react';

type PromptEditorProps = {
  onSave: (prompt: any) => void;
};

export default function PromptEditor({ onSave }: PromptEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tone, setTone] = useState('professional');
  const [targetModel, setTargetModel] = useState('GPT-4');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const categories = ['General', 'Marketing', 'Writing', 'Coding', 'Business', 'Creative'];
  const tones = ['professional', 'friendly', 'creative', 'technical', 'persuasive'];
  const models = ['GPT-4', 'GPT-4o', 'Claude-3', 'Gemini', 'Llama'];

  const handleGeneratePrompt = async () => {
    if (!content.trim()) {
      setError('Please enter a prompt idea first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          category,
          tone,
          targetModel,
          mode: 'generate',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setContent(data.prompt || data.message);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprovePrompt = async () => {
    if (!content.trim()) {
      setError('Please enter a prompt to improve');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: content,
          feedback: `Improve clarity and effectiveness for ${targetModel}`,
          aspect: 'clarity',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve prompt');
      }

      setContent(data.refinedPrompt);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter a title and content');
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
        <h1>✨ AI Prompt Editor</h1>
        <p>Create and refine prompts with AI assistance</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

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
            <label>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="form-select">
              {tones.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Target Model</label>
            <select value={targetModel} onChange={(e) => setTargetModel(e.target.value)} className="form-select">
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Prompt Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write or describe your prompt..."
            className="form-textarea"
            rows={12}
          />
        </div>

        <div className="form-row">
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

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic">Make public</label>
          </div>
        </div>

        <div className="editor-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={isGenerating}>
            💾 Save Prompt
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleGeneratePrompt}
            disabled={isGenerating}
          >
            {isGenerating ? '...' : '✨ Generate'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleImprovePrompt}
            disabled={isGenerating}
          >
            {isGenerating ? '...' : '🚀 Improve'}
          </button>
          <button className="btn btn-secondary" onClick={() => setContent('')} disabled={isGenerating}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
