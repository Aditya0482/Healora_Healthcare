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

      // Validate file type (allow JPG, PNG, WEBP, GIF, AVIF, JFIF, BMP; strictly block SVG for security)
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/pjpeg',
        'image/jfif',
        'image/png',
        'image/x-png',
        'image/webp',
        'image/gif',
        'image/avif',
        'image/bmp',
      ];
      const origName = file.name || 'image.jpg';
      let ext = path.extname(origName).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.jfif', '.bmp'];

      const isMimeAllowed = allowedMimes.includes(file.type) || file.type.startsWith('image/');
      const isExtAllowed = allowedExts.includes(ext);

      // Block SVGs explicitly
      if (ext === '.svg' || file.type === 'image/svg+xml') {
        return NextResponse.json(
          { error: 'SVG images are not allowed for security reasons. Please use JPG, PNG, or WEBP.' },
          { status: 400 }
        );
      }

      if (!isMimeAllowed && !isExtAllowed) {
        return NextResponse.json(
          { error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are allowed.' },
          { status: 400 }
        );
      }

      // Max size: 25MB (gives plenty of headroom for high-res camera photos)
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image file is too large. Maximum allowed size is 25MB.' },
          { status: 400 }
        );
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Determine clean file extension
      if (!ext || ext.length > 6 || !allowedExts.includes(ext)) {
        if (file.type.includes('png')) ext = '.png';
        else if (file.type.includes('webp')) ext = '.webp';
        else if (file.type.includes('gif')) ext = '.gif';
        else if (file.type.includes('avif')) ext = '.avif';
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
