import { NextRequest, NextResponse } from 'next/server';

const conversationStore: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { conversationId, message, role } = payload;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const cId = conversationId || `conv-${Date.now()}`;

    if (!conversationStore.has(cId)) {
      conversationStore.set(cId, {
        id: cId,
        createdAt: new Date().toISOString(),
        messages: [],
      });
    }

    const conversation = conversationStore.get(cId);

    conversation.messages.push({
      role: role || 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Simulate AI response
    const aiResponse = `Response to: ${message.substring(0, 50)}...`;
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    conversation.updatedAt = new Date().toISOString();

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (conversationId) {
      const conversation = conversationStore.get(conversationId);
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json(conversation, { status: 200 });
    }

    const conversations = Array.from(conversationStore.values());
    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
