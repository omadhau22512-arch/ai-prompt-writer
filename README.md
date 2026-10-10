# AI Prompt Writer

A lightweight web app that helps users generate or improve prompts for AI tools.

Features:
- Generate prompts from a rough idea
- Improve, shorten, expand, or rewrite prompts
- Adjust tone, audience, and target AI model
- Copy final result to clipboard
- Optional OpenAI integration if an API key is configured

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

3. Open:
   ```bash
   http://localhost:3000
   ```

## Optional AI API setup

Create a `.env.local` file with:

```bash
OPENAI_API_KEY=your_key_here
```

If no API key is configured, the app still works in offline/local mode and generates a strong prompt using built-in logic.

## Project structure

- `app/page.tsx` — landing page
- `components/PromptWriter.tsx` — main UI
- `app/api/prompts/route.ts` — prompt generation API
- `app/globals.css` — styling
