import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, stars, selectedTags } = body;

    // Local sandbox fallback logs
    console.log('API POST /api/review/submit body received:', body);

    // Save session logs to database via Prisma ORM
    const session = await prisma.reviewSession.create({
      data: {
        businessId,
        funnelStage: stars >= 4 ? 'completed' : 'abandoned',
        ratings: {
          create: {
            businessId,
            stars,
            selectedTags,
            routedPath: stars >= 4 ? 'public' : 'private',
          }
        }
      },
      include: {
        ratings: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review session logged successfully.',
      sandbox: false,
      sessionId: session.sessionId,
      ratingId: session.ratings[0]?.ratingId
    });
  } catch (error: any) {
    console.error('API submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
