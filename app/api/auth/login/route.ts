import { NextRequest, NextResponse } from 'next/server';
import { getAsync } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await getAsync<any>('SELECT id, email, password, name FROM users WHERE email = ?', [email]);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(user.id);

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
