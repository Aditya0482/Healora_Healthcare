import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const CSV_PATH = path.join(process.cwd(), 'data', 'contact-submissions.csv');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
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

    // Formula Injection neutralization (cells starting with =, +, -, @ can execute arbitrary formulas)
    const sanitizeForCsv = (val: string) => {
      let s = String(val || '').trim();
      if (/^[-+=@]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // Initialize CSV headers if file does not exist
    if (!fs.existsSync(CSV_PATH)) {
      const headers = ['Submission Date', 'Name', 'Email', 'Phone', 'Subject', 'Message'];
      fs.writeFileSync(CSV_PATH, headers.join(',') + '\n', 'utf8');
    }

    // Append row
    const newRow = [
      `"${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`,
      sanitizeForCsv(name),
      sanitizeForCsv(email),
      sanitizeForCsv(phone || ''),
      sanitizeForCsv(subject || ''),
      sanitizeForCsv(message),
    ].join(',') + '\n';

    fs.appendFileSync(CSV_PATH, newRow, 'utf8');

    return NextResponse.json({ success: true, message: 'Your message has been received. We will get back to you shortly.' });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}