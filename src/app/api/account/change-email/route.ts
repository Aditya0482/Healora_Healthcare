import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, signToken } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/mail';
import crypto from 'crypto';

interface EmailChangeOtpRecord {
  newEmail: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

const globalForEmailChange = globalThis as unknown as {
  emailChangeOtpStore?: Map<string, EmailChangeOtpRecord>;
};

const emailChangeStore =
  globalForEmailChange.emailChangeOtpStore || new Map<string, EmailChangeOtpRecord>();
globalForEmailChange.emailChangeOtpStore = emailChangeStore;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const { action, newEmail, otp } = await req.json();

    // Step 1: Request OTP for new email
    if (action === 'REQUEST_OTP') {
      if (!newEmail || typeof newEmail !== 'string') {
        return NextResponse.json(
          { error: 'Kripya naya email address enter karein.' },
          { status: 400 }
        );
      }

      const trimmedEmail = newEmail.trim().toLowerCase();

      // Check standard email format and @gmail.com domain
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail) || !trimmedEmail.endsWith('@gmail.com')) {
        return NextResponse.json(
          { error: 'Please enter a valid Gmail address ending with @gmail.com' },
          { status: 400 }
        );
      }

      // Check if same as current email
      if (trimmedEmail === user.email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Naya email aapke vartaman email se alag hona chahiye.' },
          { status: 400 }
        );
      }

      // Check if another user already has this email
      const existingUser = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Yeh email address pehle se kisi doosre account ke sath linked hai.' },
          { status: 400 }
        );
      }

      // Generate 6-digit OTP
      const dynamicOtp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

      emailChangeStore.set(user.id, {
        newEmail: trimmedEmail,
        otp: dynamicOtp,
        expiresAt,
        attempts: 0,
      });

      // Dispatch OTP email to the NEW email address
      const mailResult = await sendOtpEmail({
        to: trimmedEmail,
        name: user.fullName,
        otp: dynamicOtp,
        purpose: 'Email Change',
        subject: `Your Healora Email Verification Code: ${dynamicOtp}`,
      });

      return NextResponse.json({
        success: true,
        emailSent: mailResult.success,
        message: mailResult.success
          ? `Verification OTP sent to ${trimmedEmail}!`
          : `OTP generated! Verification code: ${dynamicOtp}`,
      });
    }

    // Step 2: Verify OTP and update Email in Database
    if (action === 'VERIFY_OTP') {
      if (!otp || typeof otp !== 'string') {
        return NextResponse.json(
          { error: 'Kripya 6-digit verification code enter karein.' },
          { status: 400 }
        );
      }

      const stored = emailChangeStore.get(user.id);
      if (!stored) {
        return NextResponse.json(
          { error: 'Koi active email verification request nahi mili. Kripya naya OTP send karein.' },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expiresAt) {
        emailChangeStore.delete(user.id);
        return NextResponse.json(
          { error: 'OTP expire ho gaya hai. Kripya naya OTP send karein.' },
          { status: 400 }
        );
      }

      if (stored.attempts >= 3) {
        emailChangeStore.delete(user.id);
        return NextResponse.json(
          { error: 'Bahut saare galat attempts. Kripya naya OTP send karein.' },
          { status: 429 }
        );
      }

      if (stored.otp !== otp.trim()) {
        stored.attempts += 1;
        const remaining = 3 - stored.attempts;
        return NextResponse.json(
          { error: `Galat OTP. ${remaining} attempts bache hain.` },
          { status: 400 }
        );
      }

      // Final check if someone claimed the email in the meantime
      const finalCheck = await prisma.user.findFirst({
        where: {
          email: stored.newEmail,
          NOT: { id: user.id },
        },
      });

      if (finalCheck) {
        emailChangeStore.delete(user.id);
        return NextResponse.json(
          { error: 'Yeh email address kisi doosre account me register ho chuka hai.' },
          { status: 400 }
        );
      }

      // Update User email in SQLite Database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { email: stored.newEmail },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          profession: true,
          organization: true,
          designation: true,
          gender: true,
          dateOfBirth: true,
          bio: true,
        },
      });

      // Clear the OTP
      emailChangeStore.delete(user.id);

      // Create updated JWT token so current session remains authenticated with new email
      const newToken = signToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Aapka email address safalta-purvak update ho gaya hai!',
        user: updatedUser,
      });

      // Set cookie
      response.cookies.set('auth_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    console.error('Email change error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error occurred while changing email.' },
      { status: 500 }
    );
  }
}
