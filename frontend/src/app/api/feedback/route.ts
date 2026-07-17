import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId is required.' },
        { status: 400 }
      );
    }

    // Fetch all ratings for this business that scanned the QR from the platform
    const ratings = await prisma.rating.findMany({
      where: {
        businessId: businessId
      },
      include: {
        feedbacks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = ratings.map(r => {
      // Determine NLP sentiment given by the star rating
      let sentiment = 'positive';
      if (r.stars <= 2) {
        sentiment = 'negative';
      } else if (r.stars === 3) {
        sentiment = 'neutral';
      }

      let tags: string[] = [];
      try {
        if (r.selectedTags) {
          tags = typeof r.selectedTags === 'string' ? JSON.parse(r.selectedTags) : (r.selectedTags as string[]);
        }
      } catch (e) {
        console.warn('Failed to parse selectedTags JSON:', e);
      }

      // If they left text feedback, use it. Otherwise, show their selected keywords
      const feedbackText = r.feedbacks?.feedbackText 
        || (tags.length > 0 ? `Feedback keywords: ${tags.join(', ')}` : 'No written feedback left.');

      return {
        id: r.ratingId,
        stars: r.stars,
        feedbackText: feedbackText,
        contactInfo: r.feedbacks?.contactInfo || 'Anonymous',
        status: r.feedbacks?.status || 'completed',
        sentiment: sentiment,
        createdAt: new Date(r.createdAt).toLocaleDateString()
      };
    });

    return NextResponse.json({
      success: true,
      feedbacks: formatted
    });

  } catch (error: any) {
    console.error('Fetch feedback error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch feedback.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { feedbackId, status } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, error: 'feedbackId is required.' },
        { status: 400 }
      );
    }

    // Update feedback ticket
    const updatedFeedback = await prisma.privateFeedback.update({
      where: { feedbackId },
      data: {
        status: status || 'resolved',
        resolvedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback
    });

  } catch (error: any) {
    console.error('Update feedback error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update feedback.' },
      { status: 500 }
    );
  }
}
