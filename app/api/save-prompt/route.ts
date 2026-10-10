import { NextRequest, NextResponse } from 'next/server';

const STORAGE_KEY = 'prompts-storage';

// In-memory storage for demo purposes
// In production, use a real database
const promptsStore: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { id, title, content, category, tags, isPublic } = payload;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const promptId = id || `prompt-${Date.now()}`;

    const promptData = {
      id: promptId,
      title,
      content,
      category: category || 'General',
      tags: tags || [],
      isPublic: isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    promptsStore.set(promptId, promptData);

    return NextResponse.json(promptData, { status: 200 });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const prompts = Array.from(promptsStore.values());
    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    promptsStore.delete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
