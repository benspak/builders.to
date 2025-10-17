import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      'name', 'email', 'role', 'projectDuration', 'targetMarket', 'hasCustomers',
      'timeline', 'whoBuilt', 'techStack',
      'biggestProblem', 'isLive', 'crashFrequency', 'budgetRange', 'decisionMakers'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate client qualification score
    let score = 0;
    const highValueIndicators = [];
    const redFlags = [];

    // Urgency indicators
    if (data.timeline === 'asap' || data.timeline === 'within-2-weeks') {
      score += 10;
      highValueIndicators.push('High urgency');
    }

    // Budget indicators
    if (data.budgetRange === '2500-5000' || data.budgetRange === '5000-10000' || data.budgetRange === '10000-plus') {
      score += 15;
      highValueIndicators.push('Good budget range');
    }

    // Technical debt indicators (technical debt red flags)
    if (data.constantBugs === 'yes' || data.constantBugs === 'sometimes') {
      score += 5;
      highValueIndicators.push('Has technical issues');
    }

    if (data.afraidToChange === 'yes' || data.afraidToChange === 'somewhat') {
      score += 5;
      redFlags.push('Fragile codebase');
    }

    // Business impact indicators
    if (data.lostCustomers === 'yes-many' || data.lostCustomers === 'yes-some') {
      score += 10;
      highValueIndicators.push('Lost customers due to issues');
    }

    // Previous attempts
    if (data.triedOthers === 'yes-multiple' || data.triedOthers === 'yes-one') {
      score += 5;
      highValueIndicators.push('Has tried other solutions');
    }

    // Determine qualification level
    let qualificationLevel = 'Low';
    if (score >= 60) qualificationLevel = 'High';
    else if (score >= 40) qualificationLevel = 'Medium';

    // Store in Firebase Firestore (if configured)
    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'clientIntakes'), {
          ...data,
          qualificationScore: score,
          qualificationLevel,
          highValueIndicators: highValueIndicators.join(', '),
          redFlags: redFlags.join(', '),
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
          source: 'client-intake-form'
        });
        console.log('Client intake data stored in Firebase with ID:', docRef.id);
      } else {
        console.warn('Firebase not configured, skipping database storage');
      }
    } catch (firebaseError) {
      console.error('Firebase storage error:', firebaseError);
      // Don't fail the request if Firebase fails
    }

    // Send to Google Sheets via webhook
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            source: 'client-intake-form',
            qualificationScore: score,
            qualificationLevel,
            highValueIndicators: highValueIndicators.join(', '),
            redFlags: redFlags.join(', '),
            timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          console.warn('Google Sheets webhook failed:', response.status);
        } else {
          console.log('Client intake data sent to Google Sheets successfully');
        }
      } catch (webhookError) {
        console.error('Google Sheets webhook error:', webhookError);
      }
    }

    // Log the submission for debugging
    console.log('Client intake submission:', {
      name: data.name,
      email: data.email,
      qualificationScore: score,
      qualificationLevel,
      highValueIndicators,
      redFlags
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      qualificationScore: score,
      qualificationLevel
    });

  } catch (error) {
    console.error('Client intake API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
