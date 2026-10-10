import { useEffect, useMemo, useState } from 'react';

type PromptHistoryItem = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  createdAt: string;
};

export default function PromptWriter() {
  const templateIdeas = [
    'Write a product launch email for a fitness app.',
    'Create a short, friendly customer support reply for delayed shipping.',
    'Generate an assistant that explains code clearly to beginners.',
    'Draft a blog post outline about AI productivity for marketing teams.',
  ];

  const categoryOptions = ['Marketing', 'Writing', 'Coding', 'Business', 'Productivity'];

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('generate');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('general audience');
  const [targetModel, setTargetModel] = useState('GPT-4o');
  const [goal, setGoal] = useState('Help me produce high-quality responses.');
  const [category, setCategory] = useState('Marketing');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('prompt-writer-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('prompt-writer-history', JSON.stringify(history));
    } catch {
      // Ignore storage errors in private browsing or quota-limited scenarios.
    }
  }, [history]);

  const promptSummary = useMemo(() => {
    if (!prompt.trim()) return 'No prompt idea entered yet.';
    return prompt.trim().slice(0, 90) + (prompt.trim().length > 90 ? '...' : '');
  }, [prompt]);

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawPrompt: prompt,
          mode,
          tone,
          audience,
          targetModel,
          goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setResult(data.prompt || '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate prompt';
      setResult(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrompt = () => {
    if (!result.trim()) return;

    const item: PromptHistoryItem = {
      id: `${Date.now()}`,
      title: promptSummary || 'Untitled prompt',
      prompt: result,
      category,
      createdAt: new Date().toISOString(),
    };

    setHistory((current) => [item, ...current].slice(0, 8));
  };

  const handleCopy = async () => {
    if (!result.trim()) return;

    try {
      await navigator.clipboard.writeText(result);
    } catch {
      // no-op fallback
    }
  };

  const handleLoadHistory = (item: PromptHistoryItem) => {
    setPrompt(item.prompt);
    setCategory(item.category);
    setResult(item.prompt);
  };

  return (
    <main className="page-shell">
      <section className="panel hero-panel">
        <div className="title-row">
          <div>
            <p className="eyebrow">AI prompt studio</p>
            <h1>Prompt Writer</h1>
          </div>
          <div className="title-actions">
            <button className="secondary-button" type="button" onClick={() => setPrompt('')}>
              Clear
            </button>
            <button className="secondary-button" type="button" onClick={() => setHistory([])}>
              Reset history
            </button>
          </div>
        </div>

        <div className="status-bar">
          <span className="status-pill">{category}</span>
          <span className="status-copy">{promptSummary}</span>
        </div>

        <div className="template-grid">
          {templateIdeas.map((idea) => (
            <button key={idea} type="button" className="template-button" onClick={() => setPrompt(idea)}>
              {idea}
            </button>
          ))}
        </div>

        <div className="controls-grid">
          <label>
            <span>Mode</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="generate">Generate</option>
              <option value="improve">Improve</option>
              <option value="shorten">Shorten</option>
              <option value="expand">Expand</option>
              <option value="rewrite">Rewrite</option>
            </select>
          </label>

          <label>
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Tone</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="creative">Creative</option>
              <option value="technical">Technical</option>
              <option value="persuasive">Persuasive</option>
            </select>
          </label>

          <label>
            <span>Audience</span>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. startup founders" />
          </label>

          <label>
            <span>Target model</span>
            <input value={targetModel} onChange={(e) => setTargetModel(e.target.value)} placeholder="e.g. GPT-4o" />
          </label>
        </div>

        <label className="textarea-label">
          <span>Prompt idea</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want the AI to help you with..."
            rows={8}
          />
        </label>

        <label className="textarea-label">
          <span>Goal</span>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="What should the final output achieve?"
          />
        </label>

        <div className="action-row">
          <button className="primary-button" type="button" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Prompt'}
          </button>
          <button className="secondary-button" type="button" onClick={handleSavePrompt} disabled={!result.trim()}>
            Save to library
          </button>
        </div>
      </section>

      <section className="panel result-panel">
        <div className="result-header">
          <h2>Final prompt</h2>
          <button className="secondary-button" type="button" onClick={handleCopy} disabled={!result}>
            Copy
          </button>
        </div>

        <pre>{result || 'Your generated prompt will appear here.'}</pre>

        <div className="library-panel">
          <div className="library-header">
            <h3>Saved prompts</h3>
          </div>

          {history.length === 0 ? (
            <p className="empty-library">Your saved prompts will appear here.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <button key={item.id} type="button" className="history-item" onClick={() => handleLoadHistory(item)}>
                  <span className="history-category">{item.category}</span>
                  <strong>{item.title}</strong>
                  <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
