import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// SMS Service using Firebase Extensions or third-party SMS provider
// You can use Firebase Extensions like "Send SMS with Twilio" or integrate directly

export const sendSMS = functions.https.onCall(async (data, context) => {
  try {
    const { to, message, templateId } = data;
    
    // Validate input
    if (!to || !message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Phone number and message are required'
      );
    }
    
    // Here you would integrate with your SMS provider
    // For example, using Firebase Extensions or direct API calls
    
    // Example using Firebase Extensions (Twilio SMS Extension)
    const smsData = {
      to: to,
      body: message,
    };
    
    // If using Firebase Extensions, you would write to a specific collection
    // that triggers the SMS extension
    const docRef = await admin.firestore().collection('sms').add({
      ...smsData,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      templateId: templateId || null
    });
    
    // Log the SMS for tracking
    await admin.firestore().collection('sms_logs').add({
      messageId: docRef.id,
      to: to,
      message: message,
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      templateId: templateId || null
    });
    
    return {
      success: true,
      messageId: docRef.id
    };
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send SMS',
      error
    );
  }
});

export const sendBulkSMS = functions.https.onCall(async (data, context) => {
  try {
    const { messages } = data;
    
    if (!messages || !Array.isArray(messages)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Messages array is required'
      );
    }
    
    const results = [];
    const batch = admin.firestore().batch();
    
    for (const msg of messages) {
      const { to, message, templateId } = msg;
      
      if (!to || !message) {
        results.push({
          success: false,
          error: 'Phone number and message are required'
        });
        continue;
      }
      
      // Add to SMS collection for processing
      const docRef = admin.firestore().collection('sms').doc();
      batch.set(docRef, {
        to: to,
        body: message,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        templateId: templateId || null
      });
      
      results.push({
        success: true,
        messageId: docRef.id
      });
    }
    
    await batch.commit();
    
    return { results };
    
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send bulk SMS',
      error
    );
  }
});

export const sendPushNotification = functions.https.onCall(async (data, context) => {
  try {
    const { token, title, body, data: notificationData } = data;
    
    if (!token || !title || !body) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Token, title, and body are required'
      );
    }
    
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: notificationData || {},
      token: token,
    };
    
    const response = await admin.messaging().send(message);
    
    // Log the notification
    await admin.firestore().collection('notification_logs').add({
      messageId: response,
      token: token,
      title: title,
      body: body,
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      data: notificationData || {}
    });
    
    return {
      success: true,
      messageId: response
    };
    
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send push notification',
      error
    );
  }
});

// Function to handle SMS status updates (if using extensions)
export const onSMSStatusUpdate = functions.firestore
  .document('sms/{messageId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // If status changed, log it
    if (before.status !== after.status) {
      await admin.firestore().collection('sms_logs').add({
        messageId: context.params.messageId,
        to: after.to,
        status: after.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: after.error || null
      });
    }
  });