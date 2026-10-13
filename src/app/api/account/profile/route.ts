import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, comparePassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
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
        createdAt: true,
      },
    });

    return NextResponse.json({ user: fullUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      fullName,
      phone,
      avatar,
      profession,
      organization,
      designation,
      gender,
      dateOfBirth,
      bio,
      currentPassword,
      newPassword,
    } = body;

    let updatedPasswordHash: string | undefined = undefined;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set new password' }, { status: 400 });
      }
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const isMatch = await comparePassword(currentPassword, dbUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      updatedPasswordHash = await hashPassword(newPassword);
    }

    if (phone && phone !== user.phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone, NOT: { id: user.id } },
      });
      if (existingPhone) {
        return NextResponse.json({ error: 'Phone number is already associated with another account' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName !== undefined ? fullName : undefined,
        phone: phone !== undefined ? phone.replace(/[^0-9]/g, '') : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        profession: profession !== undefined ? profession : undefined,
        organization: organization !== undefined ? organization : undefined,
        designation: designation !== undefined ? designation : undefined,
        gender: gender !== undefined ? gender : undefined,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
        bio: bio !== undefined ? bio : undefined,
        ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
      },
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
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
