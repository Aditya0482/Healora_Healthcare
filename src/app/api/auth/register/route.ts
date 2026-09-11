import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: 'Full name, email, and mobile number are required' }, { status: 400 });
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please provide a valid Gmail address ending with @gmail.com' }, { status: 400 });
    }

    // Phone validation (10 digits standard)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please provide a valid 10-digit mobile number' }, { status: 400 });
    }

    // Check existing
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: cleanPhone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or mobile number already exists' },
        { status: 400 }
      );
    }

    const defaultPassword = password || 'Medicare@123';
    const passwordHash = await hashPassword(defaultPassword);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        phone: cleanPhone,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal error creating account' }, { status: 500 });
  }
}
