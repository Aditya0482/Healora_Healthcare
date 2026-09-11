import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/mail';

// In-memory OTP storage: email -> { otp: string, expiresAt: number, attempts: number }
interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpRecord>();

export async function POST(req: NextRequest) {
  try {
    const { action, email, otp, newPassword, confirmPassword } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Kripya apna registered Email enter karein' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@gmail.com') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid Gmail address ending with @gmail.com' },
        { status: 400 }
      );
    }

    // Look for user by email (Customer or Admin)
    const user = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Is Email se koi account nahi mila. Kripya sahi email enter karein.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Aapka account deactivate hai. Kripya support se contact karein.' },
        { status: 403 }
      );
    }

    // Step 1: Send Dynamic OTP to Email
    if (action === 'SEND_OTP') {
      const crypto = require('crypto');
      const dynamicOtp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

      otpStore.set(trimmedEmail, {
        otp: dynamicOtp,
        expiresAt,
        attempts: 0,
      });

      // Dispatch real email via Resend
      const mailResult = await sendOtpEmail({
        to: trimmedEmail,
        name: user.fullName,
        otp: dynamicOtp,
      });

      return NextResponse.json({
        success: true,
        otp: dynamicOtp,
        emailSent: mailResult.success,
        message: mailResult.success
          ? `Verification OTP sent to ${trimmedEmail}!`
          : `OTP generated! Verification code: ${dynamicOtp}`,
        userRole: user.role === 'SUPER_ADMIN' ? 'Admin' : 'Customer',
      });
    }

    // Step 2: Reset Password
    if (action === 'RESET_PASSWORD') {
      if (!otp) {
        return NextResponse.json({ error: 'Kripya 6-digit OTP enter karein' }, { status: 400 });
      }

      const stored = otpStore.get(trimmedEmail);
      if (!stored) {
        return NextResponse.json(
          { error: 'Koi active OTP request nahi mili. Kripya naya OTP generate karein.' },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(trimmedEmail);
        return NextResponse.json(
          { error: 'OTP expire ho chuka hai. Kripya naya OTP generate karein.' },
          { status: 400 }
        );
      }

      if (stored.attempts >= 3) {
        otpStore.delete(trimmedEmail);
        return NextResponse.json(
          { error: 'Adhik galat attempts. Kripya naya OTP request karein.' },
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

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Naya password kam se kam 6 characters ka hona chahiye.' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'New password aur Confirm password match nahi ho rahe hain.' },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      // Invalidate OTP immediately upon successful reset
      otpStore.delete(trimmedEmail);

      return NextResponse.json({
        success: true,
        message: 'Password safalta-purvak change ho gaya hai! Ab aap naye password se Sign In kar sakte hain.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error aayi. Kripya punah prayas karein.' },
      { status: 500 }
    );
  }
}
