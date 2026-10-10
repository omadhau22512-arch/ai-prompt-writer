import { NextRequest, NextResponse } from 'next/server';
import { getAsync, runAsync, queryAsync } from '@/lib/db';
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

    const { teamId, email, role = 'member' } = await request.json();
    if (!teamId || !email) {
      return NextResponse.json(
        { error: 'Team ID and email are required' },
        { status: 400 }
      );
    }

    // Verify user is team owner
    const team = await getAsync<any>('SELECT ownerId FROM teams WHERE id = ?', [teamId]);
    if (!team || team.ownerId !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Find user by email
    const user = await getAsync<any>('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const memberId = `member-${Date.now()}`;
    const now = new Date().toISOString();

    await runAsync(
      'INSERT INTO team_members (id, teamId, userId, role, joinedAt) VALUES (?, ?, ?, ?, ?)',
      [memberId, teamId, user.id, role, now]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}
