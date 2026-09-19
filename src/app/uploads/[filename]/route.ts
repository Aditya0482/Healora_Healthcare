import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File Not Found', { status: 404 });
  }

  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();

    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.avif') contentType = 'image/avif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
