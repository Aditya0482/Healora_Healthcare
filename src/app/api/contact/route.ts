import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const EXCEL_PATH = path.join(process.cwd(), 'data', 'contact-submissions.xlsx');

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
    const sanitizeForSheet = (val: string) => {
      const s = String(val || '').trim();
      return /^[-+=@]/.test(s) ? `'${s}` : s;
    };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // Load or create workbook
    let wb: XLSX.WorkBook;
    let ws: XLSX.WorkSheet;
    const headers = ['Submission Date', 'Name', 'Email', 'Phone', 'Subject', 'Message'];

    if (fs.existsSync(EXCEL_PATH)) {
      wb = XLSX.readFile(EXCEL_PATH);
      ws = wb.Sheets['Contact Submissions'] || XLSX.utils.aoa_to_sheet([headers]);
      if (!wb.Sheets['Contact Submissions']) XLSX.utils.book_append_sheet(wb, ws, 'Contact Submissions');
    } else {
      wb = XLSX.utils.book_new();
      ws = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(wb, ws, 'Contact Submissions');
    }

    // Append sanitized row
    const newRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      sanitizeForSheet(name),
      sanitizeForSheet(email),
      sanitizeForSheet(phone || ''),
      sanitizeForSheet(subject || ''),
      sanitizeForSheet(message),
    ];
    XLSX.utils.sheet_add_aoa(ws, [newRow], { origin: -1 });

    // Save workbook
    XLSX.writeFile(wb, EXCEL_PATH);

    return NextResponse.json({ success: true, message: 'Your message has been received. We will get back to you shortly.' });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}