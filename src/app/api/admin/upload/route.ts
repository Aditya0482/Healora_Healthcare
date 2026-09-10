import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator access required.' },
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    // Handle multipart/form-data upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file was provided in the request' },
          { status: 400 }
        );
      }

      // Validate file type (SVG strictly forbidden to prevent stored script execution)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are allowed.' },
          { status: 400 }
        );
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image file is too large. Maximum allowed size is 5MB.' },
          { status: 400 }
        );
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Determine file extension
      const origName = file.name || 'image.jpg';
      let ext = path.extname(origName).toLowerCase();
      if (!ext || ext.length > 5) {
        if (file.type === 'image/png') ext = '.png';
        else if (file.type === 'image/webp') ext = '.webp';
        else if (file.type === 'image/gif') ext = '.gif';
        else ext = '.jpg';
      }

      const safeBase = origName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'product';
      const filename = `prod-${Date.now()}-${safeBase}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.promises.writeFile(filepath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
      });
    }

    // Handle base64 JSON upload fallback
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { base64Data } = body;

      if (!base64Data) {
        return NextResponse.json(
          { error: 'Missing base64Data in request body' },
          { status: 400 }
        );
      }

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { error: 'Invalid base64 image data string' },
          { status: 400 }
        );
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      let ext = '.jpg';
      if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('gif')) ext = '.gif';

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filepath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        filename,
      });
    }

    return NextResponse.json(
      { error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling image upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process and save image' },
      { status: 500 }
    );
  }
}
