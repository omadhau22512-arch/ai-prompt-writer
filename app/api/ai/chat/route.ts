import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. AI features will not work.');
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'chat', conversationHistory = [] } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI backend not configured. Please set OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    const systemPrompts: Record<string, string> = {
      chat: `You are a helpful AI assistant specialized in prompt engineering and AI best practices. 
You help users refine, improve, and create effective prompts for AI models. 
Provide actionable advice and examples.`,
      improve: `You are an expert prompt engineer. The user will provide a prompt they want improved. 
Analyze it for clarity, specificity, and effectiveness. 
Return an improved version with explanations of the changes.`,
      generate: `You are a creative prompt writer. Generate a detailed, effective prompt based on the user's requirements. 
Make it specific, actionable, and optimized for the target AI model.`,
    };

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompts[mode] || systemPrompts.chat,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to process request with AI backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      return NextResponse.json({ error: 'No response from AI backend' }, { status: 500 });
    }

    return NextResponse.json({
      message: aiMessage,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
