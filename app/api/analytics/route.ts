import { NextRequest, NextResponse } from 'next/server';
import { queryAsync, runAsync, getAsync } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const period = searchParams.get('period') || '7d';

    let whereClause = '';
    let params: any[] = [];

    if (userId) {
      whereClause = 'WHERE a.userId = ?';
      params.push(userId);
    } else if (teamId) {
      whereClause = 'WHERE p.teamId = ?';
      params.push(teamId);
    }

    // Get analytics summary
    const analytics = await queryAsync<any>(
      `SELECT 
        COUNT(DISTINCT a.promptId) as totalPrompts,
        COUNT(DISTINCT a.userId) as uniqueUsers,
        COUNT(*) as totalActions,
        a.action,
        COUNT(*) as actionCount
      FROM analytics a
      JOIN prompts p ON a.promptId = p.id
      ${whereClause}
      GROUP BY a.action`,
      params
    );

    // Get top prompts by usage
    const topPrompts = await queryAsync<any>(
      `SELECT p.id, p.title, COUNT(a.id) as usageCount, AVG(pr.rating) as avgRating
       FROM prompts p
       LEFT JOIN analytics a ON p.id = a.promptId AND a.action = 'used'
       LEFT JOIN prompt_ratings pr ON p.id = pr.promptId
       ${whereClause}
       GROUP BY p.id
       ORDER BY usageCount DESC
       LIMIT 10`,
      params
    );

    return NextResponse.json({ analytics, topPrompts });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

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

    const { promptId, action, metadata } = await request.json();

    if (!promptId || !action) {
      return NextResponse.json(
        { error: 'Prompt ID and action are required' },
        { status: 400 }
      );
    }

    const analyticsId = `analytics-${Date.now()}`;
    const now = new Date().toISOString();

    await runAsync(
      'INSERT INTO analytics (id, promptId, userId, action, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [analyticsId, promptId, decoded.userId, action, now, metadata ? JSON.stringify(metadata) : null]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}
