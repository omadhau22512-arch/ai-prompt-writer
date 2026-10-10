export default function PromptWriter() {
  const templateIdeas = [
    'Write a product launch email for a fitness app.',
    'Create a short, friendly customer support reply for delayed shipping.',
    'Generate an assistant that explains code clearly to beginners.',
    'Draft a blog post outline about AI productivity for marketing teams.'
  ];

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('generate');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('general audience');
  const [targetModel, setTargetModel] = useState('GPT-4o');
  const [goal, setGoal] = useState('Help me produce high-quality responses.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <main className="page-shell">
      <section className="panel hero-panel">
        <div className="title-row">
          <div>
            <p className="eyebrow">AI assistant tool</p>
            <h1>Prompt Writer</h1>
          </div>
          <button className="secondary-button" type="button" onClick={() => setPrompt('')}>
            Clear
          </button>
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

        <button className="primary-button" type="button" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Prompt'}
        </button>
      </section>

      <section className="panel result-panel">
        <div className="result-header">
          <h2>Final prompt</h2>
          <button
            className="secondary-button"
            type="button"
            onClick={() => navigator.clipboard.writeText(result)}
            disabled={!result}
          >
            Copy
          </button>
        </div>

        <pre>{result || 'Your generated prompt will appear here.'}</pre>
      </section>
    </main>
  );
}
