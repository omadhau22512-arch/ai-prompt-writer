import { NextRequest, NextResponse } from 'next/server';
import { getAsync, runAsync } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await getAsync<any>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const userId = `user-${Date.now()}`;
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString();

    await runAsync(
      'INSERT INTO users (id, email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, now, now]
    );

    const token = createToken(userId);

    return NextResponse.json(
      {
        token,
        user: { id: userId, email, name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
