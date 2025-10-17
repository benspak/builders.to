import { NextRequest, NextResponse } from 'next/server';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    let name: string;
    let email: string;
    let message: string;
    let file: File | null = null;
    let source = 'contact-form';

    // Check if request is JSON (for email capture) or form data
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      // Handle JSON requests (for email capture)
      const jsonData = await request.json();
      name = jsonData.name;
      email = jsonData.email;
      message = jsonData.message;
      source = jsonData.source || 'email-capture';
    } else {
      // Handle form data requests
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      message = formData.get('message') as string;
      file = formData.get('file') as File | null;
      source = formData.get('source') as string || 'contact-form';
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let fileUrl = '';

    // Upload file to Firebase Storage if provided
    if (file && file.size > 0) {
      try {
        const storageRef = ref(storage, `leads/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);
        console.log('File uploaded to Firebase Storage:', fileUrl);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return NextResponse.json(
          { error: 'File upload failed' },
          { status: 500 }
        );
      }
    }

    // Store in Firebase Firestore (if configured)
    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'Leads'), {
          name: name || 'Anonymous',
          email: email.toLowerCase().trim(),
          message: message || '',
          source: source,
          fileUrl: fileUrl || '',
          timestamp: serverTimestamp(),
          createdAt: new Date(),
          status: 'active'
        });
        console.log('Lead stored in Firebase with ID:', docRef.id);
      } else {
        console.warn('Firebase not configured, skipping database storage');
      }
    } catch (firebaseError) {
      console.error('Firebase storage error:', firebaseError);
      // Don't fail the request if Firebase fails
    }

    // Send to Google Sheets via webhook (server-side, no CORS issues)
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            message,
            source,
            fileUrl: fileUrl || 'No file uploaded',
            timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          console.warn('Google Sheets webhook failed:', response.status);
        } else {
          console.log('Data sent to Google Sheets successfully');
        }
      } catch (webhookError) {
        console.warn('Google Sheets webhook error:', webhookError);
        // Don't fail the request if Google Sheets fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      fileUrl: fileUrl || null
    });

  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
