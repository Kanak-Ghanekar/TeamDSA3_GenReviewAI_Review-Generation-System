import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    // 1. Single Business Fetch by ID (for Customer review page /r/[id])
    if (id) {
      const business = await prisma.business.findUnique({
        where: { businessId: id },
        include: { ratings: true }
      });

      if (!business) {
        return NextResponse.json(
          { success: false, error: 'Business not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        business: {
          id: business.businessId,
          name: business.name,
          category: business.category,
          googlePlaceId: business.googlePlaceId,
          threshold: Number(business.ratingThreshold)
        }
      });
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email query parameter is required.' },
        { status: 400 }
      );
    }

    if (email === 'admin@graphura.com') {
      // Retrieve all businesses for admin portal
      const allBusinesses = await prisma.business.findMany({
        include: {
          owner: true,
          ratings: true,
          reviewSessions: true
        }
      });

      const formatted = allBusinesses.map(b => ({
        id: b.businessId,
        name: b.name,
        category: b.category,
        ownerName: b.owner.name,
        ownerEmail: b.owner.email,
        threshold: Number(b.ratingThreshold),
        scans: b.reviewSessions.length,
        rating: b.ratings.length > 0 
          ? Number((b.ratings.reduce((acc, r) => acc + r.stars, 0) / b.ratings.length).toFixed(1))
          : 5.0,
        completions: b.ratings.filter(r => r.routedPath === 'public').length,
        allowNegative: false,
        permissions: {
          canChangeThreshold: b.canChangeThreshold,
          canViewAnalytics: b.canViewAnalytics,
          canExportData: b.canExportData
        }
      }));

      return NextResponse.json({
        success: true,
        businesses: formatted
      });
    }

    // Owner Login: retrieve user businesses
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businesses: {
          include: {
            ratings: true,
            reviewSessions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const formatted = user.businesses.map(b => ({
      id: b.businessId,
      name: b.name,
      category: b.category,
      threshold: b.ratingThreshold,
      scans: b.reviewSessions.length,
      rating: b.ratings.length > 0 
        ? Number((b.ratings.reduce((acc, r) => acc + r.stars, 0) / b.ratings.length).toFixed(1))
        : 5.0,
      completions: b.ratings.filter(r => r.routedPath === 'public').length,
      ratingsCount: b.ratings.length
    }));

    return NextResponse.json({
      success: true,
      businesses: formatted
    });

  } catch (error: any) {
    console.error('Fetch businesses error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch businesses.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required.' },
        { status: 400 }
      );
    }

    // Delete the business record (Prisma will cascade delete linked sessions, ratings, feedback, etc.)
    await prisma.business.delete({
      where: { businessId: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully.'
    });

  } catch (error: any) {
    console.error('Delete business API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete business.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, threshold, permissions } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (threshold !== undefined) {
      updateData.ratingThreshold = threshold;
    }
    if (permissions !== undefined) {
      if (permissions.canChangeThreshold !== undefined) {
        updateData.canChangeThreshold = permissions.canChangeThreshold;
      }
      if (permissions.canViewAnalytics !== undefined) {
        updateData.canViewAnalytics = permissions.canViewAnalytics;
      }
      if (permissions.canExportData !== undefined) {
        updateData.canExportData = permissions.canExportData;
      }
    }

    const updated = await prisma.business.update({
      where: { businessId: id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Business updated successfully.',
      business: {
        id: updated.businessId,
        name: updated.name,
        category: updated.category,
        threshold: Number(updated.ratingThreshold),
        permissions: {
          canChangeThreshold: updated.canChangeThreshold,
          canViewAnalytics: updated.canViewAnalytics,
          canExportData: updated.canExportData
        }
      }
    });

  } catch (error: any) {
    console.error('Update business error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update business.' },
      { status: 500 }
    );
  }
}

