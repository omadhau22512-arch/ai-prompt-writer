import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Prompt generation will not work.');
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, category, tone, targetModel, mode = 'generate' } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      // Fallback local generation
      return generateLocalPrompt({ prompt, category, tone, targetModel, mode });
    }

    const systemMessage = buildSystemMessage(mode, tone, targetModel, category);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: `${mode.toUpperCase()}: ${prompt}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to generate prompt' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0]?.message?.content?.trim();

    if (!generatedPrompt) {
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
    }

    return NextResponse.json({
      prompt: generatedPrompt,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    });
  } catch (error) {
    console.error('Error in prompt generation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}

function buildSystemMessage(
  mode: string,
  tone: string,
  targetModel: string,
  category: string
): string {
  const modeInstructions: Record<string, string> = {
    generate: 'Create a comprehensive, well-structured prompt',
    improve: 'Refine and enhance the given prompt for better clarity and effectiveness',
    shorten: 'Compress the prompt while maintaining all key information',
    expand: 'Elaborate on the prompt with more detailed instructions and context',
    rewrite: 'Rewrite the prompt with improved structure and clarity',
  };

  return `You are an expert prompt engineer specializing in ${category} content.

Task: ${modeInstructions[mode] || modeInstructions.generate}

Requirements:
- Tone: ${tone || 'professional'}
- Target Model: ${targetModel || 'GPT-4'}
- Category: ${category || 'General'}
- Output ONLY the improved prompt, no explanations or commentary
- Make the prompt clear, specific, and actionable
- Include examples where helpful
- Optimize for the target model's strengths`;
}

function generateLocalPrompt({
  prompt,
  category,
  tone,
  targetModel,
  mode,
}: {
  prompt: string;
  category?: string;
  tone?: string;
  targetModel?: string;
  mode?: string;
}): NextResponse {
  const templates: Record<string, string> = {
    generate: `You are an expert AI prompt engineer for ${category || 'general'} tasks.

User Request: ${prompt}

Create a detailed, professional prompt in ${tone || 'professional'} tone for ${targetModel || 'GPT-4'}.
Include:
- Clear objective
- Specific instructions
- Expected output format
- Examples if relevant`,

    improve: `Analyze and improve this prompt:
"${prompt}"

Make it clearer and more effective for ${targetModel || 'GPT-4'}.
Use a ${tone || 'professional'} tone.
Return only the improved prompt.`,

    shorten: `Condense this prompt while keeping all important details:
"${prompt}"

Target: ${targetModel || 'GPT-4'} | Tone: ${tone || 'professional'}`,

    expand: `Expand this prompt with more detail and structure:
"${prompt}"

For: ${targetModel || 'GPT-4'} | Tone: ${tone || 'professional'} | Category: ${category || 'General'}`,

    rewrite: `Rewrite this prompt for better clarity:
"${prompt}"

Model: ${targetModel || 'GPT-4'} | Tone: ${tone || 'professional'}`,
  };

  const generatedPrompt = templates[mode as string] || templates.generate;

  return NextResponse.json({
    prompt: generatedPrompt,
    source: 'local',
    message: 'Generated using local template. For better results, configure OPENAI_API_KEY.',
  });
}
