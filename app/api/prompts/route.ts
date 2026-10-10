import { NextRequest, NextResponse } from 'next/server';
import { queryAsync, runAsync, getAsync } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, content, category, tags, isPublic, teamId } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // If teamId provided, verify user is member
    if (teamId) {
      const member = await getAsync<any>(
        'SELECT id FROM team_members WHERE teamId = ? AND userId = ?',
        [teamId, decoded.userId]
      );
      if (!member) {
        return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
      }
    }

    const promptId = `prompt-${Date.now()}`;
    const now = new Date().toISOString();

    await runAsync(
      `INSERT INTO prompts (id, title, content, category, tags, isPublic, userId, teamId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        promptId,
        title,
        content,
        category || null,
        tags ? JSON.stringify(tags) : null,
        isPublic ? 1 : 0,
        decoded.userId,
        teamId || null,
        now,
        now,
      ]
    );

    // Log analytics
    const analyticsId = `analytics-${Date.now()}`;
    await runAsync(
      'INSERT INTO analytics (id, promptId, userId, action, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [analyticsId, promptId, decoded.userId, 'created', now, JSON.stringify({ title })]
    );

    return NextResponse.json(
      { prompt: { id: promptId, title, content, category } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let query = 'SELECT * FROM prompts WHERE userId = ? OR isPublic = 1';
    let params: any[] = [decoded.userId];

    if (teamId) {
      query = 'SELECT * FROM prompts WHERE teamId = ?';
      params = [teamId];
    }

    const prompts = await queryAsync<any>(query, params);

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}
