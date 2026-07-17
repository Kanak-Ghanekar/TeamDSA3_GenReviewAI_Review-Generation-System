import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    if (role === 'admin') {
      if (email === 'admin@graphura.com' && password === 'admin2026') {
        return NextResponse.json({
          success: true,
          email,
          role: 'graphura_admin',
          name: 'Platform Administrator'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid administrator credentials.' },
          { status: 401 }
        );
      }
    }

    // Default Owner Login: check if user exists in db
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businesses: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `Owner account with email "${email}" not found. Please register first.` },
        { status: 404 }
      );
    }

    if (user.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Account does not have merchant owner permissions.' },
        { status: 403 }
      );
    }

    const business = user.businesses[0];

    return NextResponse.json({
      success: true,
      email: user.email,
      role: 'owner',
      name: user.name,
      businessId: business?.businessId || 'test-restaurant',
      businessName: business?.name || 'Spice Garden Bistro'
    });

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
