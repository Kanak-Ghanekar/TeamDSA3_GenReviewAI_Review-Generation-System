import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ratingId, feedbackText, contactInfo } = body;

    console.log('API POST /api/feedback/submit body received:', body);

    // 1. Save logs to private feedback table via Prisma ORM
    const feedback = await prisma.privateFeedback.create({
      data: {
        ratingId,
        feedbackText,
        contactInfo,
        status: 'new',
      },
      include: {
        rating: {
          include: {
            business: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    });

    const businessName = feedback.rating.business.name;
    const ownerName = feedback.rating.business.owner.name;
    const ownerEmail = feedback.rating.business.owner.email;
    const ownerPhone = feedback.rating.business.owner.phone || '+91 99999 99999';
    const stars = feedback.rating.stars;

    // 2. Create alert entries in the database for Dashboard, WhatsApp, and Email
    const alertPromises = [
      prisma.alert.create({
        data: {
          feedbackId: feedback.feedbackId,
          channel: 'dashboard'
        }
      }),
      prisma.alert.create({
        data: {
          feedbackId: feedback.feedbackId,
          channel: 'whatsapp'
        }
      }),
      prisma.alert.create({
        data: {
          feedbackId: feedback.feedbackId,
          channel: 'email'
        }
      })
    ];
    await Promise.all(alertPromises);

    // 3. Trigger WhatsApp alert simulation
    console.log(`
============================================================
📱 [WHATSAPP ALERT SIMULATION]
To Owner Phone: ${ownerPhone} (${ownerName})
Message: Alert! "${businessName}" received a negative review of ${stars} stars.
Feedback Details: "${feedbackText}"
Contact Info: ${contactInfo || 'Not provided'}
Status: Sent via Twilio Business API Sandbox.
============================================================
    `);

    // 4. Trigger Email alert simulation
    console.log(`
============================================================
✉️ [EMAIL ALERT SIMULATION]
From: alerts@graphura.com
To: ${ownerEmail}
Subject: [Urgent Alert] New Negative Feedback for ${businessName}
Dear ${ownerName},

Your location "${businessName}" just received a critical ${stars}-star rating from a customer.

Reviewer Feedback:
"${feedbackText}"

Contact Info left: ${contactInfo || 'No contact left.'}

Please log into your dashboard to address and resolve this ticket.

Best regards,
GenReview AI Alerts Router
============================================================
    `);

    return NextResponse.json({
      success: true,
      message: 'Private feedback and alerts logged successfully.',
      sandbox: false,
      feedbackId: feedback.feedbackId
    });
  } catch (error: any) {
    console.error('API submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
