"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.onGuestUpdate = exports.onSMSStatusUpdate = exports.sendPushNotification = exports.sendBulkSMS = exports.sendSMS = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// SMS Service Function
exports.sendSMS = functions.https.onCall(async (data, context) => {
    try {
        const { to, message, templateId } = data;
        // Log the SMS request
        const smsLog = {
            to: to,
            message: message,
            templateId: templateId || null,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };
        const logRef = await admin.firestore().collection('sms_logs').add(smsLog);
        // Here you would integrate with your SMS provider (Twilio, AWS SNS, etc.)
        // For now, we'll simulate success
        console.log(`SMS to ${to}: ${message}`);
        // Update log with success
        await logRef.update({
            status: 'sent',
            messageId: `sms_${Date.now()}`
        });
        return {
            success: true,
            messageId: `sms_${Date.now()}`,
            logId: logRef.id
        };
    }
    catch (error) {
        console.error('Error sending SMS:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send SMS');
    }
});
// Bulk SMS Service Function
exports.sendBulkSMS = functions.https.onCall(async (data, context) => {
    try {
        const { messages } = data;
        const results = [];
        for (const smsData of messages) {
            try {
                const { to, message, templateId } = smsData;
                // Log the SMS request
                const smsLog = {
                    to: to,
                    message: message,
                    templateId: templateId || null,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'pending'
                };
                const logRef = await admin.firestore().collection('sms_logs').add(smsLog);
                // Simulate SMS sending
                console.log(`Bulk SMS to ${to}: ${message}`);
                // Update log with success
                await logRef.update({
                    status: 'sent',
                    messageId: `bulk_sms_${Date.now()}_${Math.random()}`
                });
                results.push({
                    success: true,
                    messageId: `bulk_sms_${Date.now()}_${Math.random()}`,
                    to: to
                });
            }
            catch (error) {
                console.error(`Error sending SMS to ${smsData.to}:`, error);
                results.push({
                    success: false,
                    error: error.message,
                    to: smsData.to
                });
            }
        }
        return { results };
    }
    catch (error) {
        console.error('Error sending bulk SMS:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send bulk SMS');
    }
});
// Push Notification Service Function
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
    try {
        const { token, title, body, data: notificationData } = data;
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: notificationData || {},
            token: token
        };
        // Log the push notification request
        const pushLog = {
            token: token,
            title: title,
            body: body,
            data: notificationData || {},
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };
        const logRef = await admin.firestore().collection('notification_logs').add(pushLog);
        // Send the push notification
        const response = await admin.messaging().send(message);
        // Update log with success
        await logRef.update({
            status: 'sent',
            messageId: response
        });
        console.log('Push notification sent successfully:', response);
        return {
            success: true,
            messageId: response,
            logId: logRef.id
        };
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send push notification');
    }
});
// SMS Status Update Trigger
exports.onSMSStatusUpdate = functions.firestore
    .document('sms_logs/{logId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // If status changed to 'sent', log it
    if (before.status !== 'sent' && after.status === 'sent') {
        console.log(`SMS ${context.params.logId} was successfully sent to ${after.to}`);
    }
    // If status changed to 'failed', log the error
    if (before.status !== 'failed' && after.status === 'failed') {
        console.error(`SMS ${context.params.logId} failed to send to ${after.to}`);
    }
    return null;
});
// Guest Notification Trigger
exports.onGuestUpdate = functions.firestore
    .document('guests/{guestId}')
    .onCreate(async (snap, context) => {
    const guestData = snap.data();
    // Send admin notification when new guest confirms
    if (guestData.status === 'confirmed') {
        console.log(`New guest confirmation: ${guestData.fullName}`);
        // Here you could trigger admin notifications
        // This would integrate with your admin contacts from Supabase
    }
    return null;
});
// Health Check Function
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        functions: [
            'sendSMS',
            'sendBulkSMS',
            'sendPushNotification',
            'onSMSStatusUpdate',
            'onGuestUpdate'
        ]
    });
});
//# sourceMappingURL=index.js.map