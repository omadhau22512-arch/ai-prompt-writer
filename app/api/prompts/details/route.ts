import { NextRequest, NextResponse } from 'next/server';
import { queryAsync, getAsync, runAsync } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');
    const teamId = searchParams.get('teamId');

    let query = 'SELECT * FROM prompts WHERE id = ?';
    let params: any[] = [promptId];

    if (teamId) {
      query = 'SELECT * FROM prompts WHERE id = ? AND teamId = ?';
      params = [promptId, teamId];
    }

    const prompt = await getAsync<any>(query, params);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Get analytics for this prompt
    const analytics = await queryAsync<any>(
      'SELECT action, COUNT(*) as count FROM analytics WHERE promptId = ? GROUP BY action',
      [promptId]
    );

    // Get ratings
    const ratings = await queryAsync<any>(
      'SELECT AVG(rating) as avgRating, COUNT(*) as ratingCount FROM prompt_ratings WHERE promptId = ?',
      [promptId]
    );

    return NextResponse.json({
      prompt,
      analytics,
      ratings: ratings[0] || { avgRating: 0, ratingCount: 0 },
    });
  } catch (error) {
    console.error('Error fetching prompt details:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const promptId = searchParams.get('id');
    const { title, content, category, tags, isPublic } = await request.json();

    // Verify ownership
    const prompt = await getAsync<any>('SELECT userId FROM prompts WHERE id = ?', [promptId]);
    if (!prompt || prompt.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const now = new Date().toISOString();
    await runAsync(
      `UPDATE prompts SET title = ?, content = ?, category = ?, tags = ?, isPublic = ?, updatedAt = ? WHERE id = ?`,
      [title, content, category, tags ? JSON.stringify(tags) : null, isPublic ? 1 : 0, now, promptId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}
