import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAsync, runAsync } from '@/lib/db';

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

    const { promptId, rating, feedback } = await request.json();

    if (!promptId || !rating) {
      return NextResponse.json(
        { error: 'Prompt ID and rating are required' },
        { status: 400 }
      );
    }

    const ratingId = `rating-${Date.now()}`;
    const now = new Date().toISOString();

    await runAsync(
      `INSERT OR REPLACE INTO prompt_ratings (id, promptId, userId, rating, feedback, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ratingId, promptId, decoded.userId, rating, feedback || null, now]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error rating prompt:', error);
    return NextResponse.json({ error: 'Failed to rate prompt' }, { status: 500 });
  }
}
