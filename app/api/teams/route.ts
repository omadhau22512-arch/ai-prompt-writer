import { NextRequest, NextResponse } from 'next/server';
import { getAsync, runAsync } from '@/lib/db';
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

    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const teamId = `team-${Date.now()}`;
    const now = new Date().toISOString();

    await runAsync(
      'INSERT INTO teams (id, name, description, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [teamId, name, description || null, decoded.userId, now, now]
    );

    // Add owner as team member
    const memberId = `member-${Date.now()}`;
    await runAsync(
      'INSERT INTO team_members (id, teamId, userId, role, joinedAt) VALUES (?, ?, ?, ?, ?)',
      [memberId, teamId, decoded.userId, 'owner', now]
    );

    return NextResponse.json({ team: { id: teamId, name, description } }, { status: 201 });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
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

    const teams = await getAsync<any[]>(
      `SELECT t.* FROM teams t
       JOIN team_members tm ON t.id = tm.teamId
       WHERE tm.userId = ?`,
      [decoded.userId]
    );

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
