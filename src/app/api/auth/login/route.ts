import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { emailOrPhone, password, otp } = await req.json();

    if (!emailOrPhone) {
      return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 });
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone.toLowerCase() },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email or phone number' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account has been deactivated. Please contact support.' }, { status: 403 });
    }

    // Check password
    if (!password) {
      return NextResponse.json({ error: 'Password is required to sign in' }, { status: 400 });
    }
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect email/phone or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: (user as any).avatar || null,
        profession: (user as any).profession || null,
        organization: (user as any).organization || null,
        designation: (user as any).designation || null,
        gender: (user as any).gender || null,
        dateOfBirth: (user as any).dateOfBirth || null,
        bio: (user as any).bio || null,
      },
    });

    // Set HTTP-only secure cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
