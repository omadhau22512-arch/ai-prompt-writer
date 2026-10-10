import type { NextRequest } from 'next/server';

const localPromptBuilder = (payload: {
  rawPrompt: string;
  mode: string;
  tone: string;
  audience: string;
  targetModel: string;
  goal: string;
}) => {
  const raw = payload.rawPrompt?.trim();
  const focus = raw || 'Create a useful AI prompt for a general task.';
  const modeMap: Record<string, string> = {
    generate: 'Generate a strong, clear prompt that produces excellent output.',
    improve: 'Refine and improve the prompt for precision, clarity, and better results.',
    shorten: 'Compress the idea into a concise, efficient prompt without losing intent.',
    expand: 'Expand the idea into a detailed prompt with structure, instructions, and constraints.',
    rewrite: 'Rewrite the prompt so it is clearer, stronger, and better optimized for the target model.',
  };

  const goalText = payload.goal?.trim() || 'Produce the best possible output.';
  const audienceText = payload.audience?.trim() ? `Audience: ${payload.audience}.` : 'Audience: general audience.';
  const modelText = payload.targetModel?.trim() ? `Target model: ${payload.targetModel}.` : 'Target model: GPT-4o.';

  return [
    `You are an expert prompt engineer.`,
    `${modeMap[payload.mode] || modeMap.generate}`,
    `Task idea: ${focus}`,
    `Tone: ${payload.tone || 'professional'}.`,
    audienceText,
    modelText,
    `Goal: ${goalText}`,
    'Output only the final prompt text, with no explanation or additional commentary.',
  ].join('\n');
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const prompt = localPromptBuilder({
      rawPrompt: payload.rawPrompt,
      mode: payload.mode,
      tone: payload.tone,
      audience: payload.audience,
      targetModel: payload.targetModel,
      goal: payload.goal,
    });

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({ prompt }, { status: 200 });
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior prompt engineer. Rewrite the user request into a polished AI prompt that is clear, detailed, actionable, and optimized for the selected AI model. Return only the final prompt text.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              rawPrompt: payload.rawPrompt,
              mode: payload.mode,
              tone: payload.tone,
              audience: payload.audience,
              targetModel: payload.targetModel,
              goal: payload.goal,
            }),
          },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      return Response.json({ prompt }, { status: 200 });
    }

    const openAiData = await openAiResponse.json();
    const result = openAiData?.choices?.[0]?.message?.content;

    if (typeof result === 'string' && result.trim()) {
      return Response.json({ prompt: result.trim() }, { status: 200 });
    }

    return Response.json({ prompt }, { status: 200 });
  } catch (error) {
    console.error('Prompt generation failed:', error);
    return Response.json(
      { error: 'Unable to generate a prompt at the moment. Please try again.' },
      { status: 500 }
    );
  }
}
