import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Refinement will not work.');
}

export async function POST(request: NextRequest) {
  try {
    const { promptText, feedback, aspect = 'clarity' } = await request.json();

    if (!promptText || !feedback) {
      return NextResponse.json(
        { error: 'Both prompt text and feedback are required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI backend not configured' },
        { status: 500 }
      );
    }

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
            content: `You are an expert prompt engineer. Refine prompts based on feedback focusing on ${aspect}.
Provide the improved prompt only, with no explanations.`,
          },
          {
            role: 'user',
            content: `Original prompt:
"${promptText}"

Feedback: ${feedback}

Please refine the prompt.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'Refinement failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const refinedPrompt = data.choices[0]?.message?.content?.trim();

    return NextResponse.json({
      refinedPrompt,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    });
  } catch (error) {
    console.error('Error refining prompt:', error);
    return NextResponse.json(
      { error: 'Failed to refine prompt' },
      { status: 500 }
    );
  }
}
