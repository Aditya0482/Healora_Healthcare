import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Name, email, phone number, and message are required' }, { status: 400 });
    }

    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please provide a valid 10-digit mobile number' }, { status: 400 });
    }

    // Input length & format validation
    if (typeof name !== 'string' || name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 120) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    if (typeof message !== 'string' || message.trim().length > 2500) {
      return NextResponse.json({ error: 'Message must be 2500 characters or less' }, { status: 400 });
    }

    // Save directly to Database
    const savedInquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        subject: subject?.trim() || null,
        message: message.trim(),
        status: 'UNREAD',
      },
    });

    return NextResponse.json({
      success: true,
      inquiryId: savedInquiry.id,
      message: 'Your message has been received. We will get back to you shortly.',
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}