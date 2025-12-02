import { firebaseAdmin } from './firebase-admin';
import { supabase } from './supabase';

export const sendNotification = async (userId: string, title: string, body: string, link?: string) => {
    try {
        // 1. Get user's FCM token from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (error || !user || !user.fcm_token) {
            console.log(`No FCM token found for user ${userId}`);
            return;
        }
        console.log(`Sending to Token: ${user.fcm_token.substring(0, 20)}...`);

        // 2. Send notification via Firebase Admin
        const message = {
            token: user.fcm_token,
            notification: {
                title,
                body,
            },
            data: {
                title,
                body,
                link: link || '/',
            },
            webpush: {
                fcmOptions: {
                    link: link || '/',
                },
            },
        };

        const response = await firebaseAdmin.messaging().send(message);
        console.log(`Notification sent to user ${userId}, Message ID: ${response}`);
        return { success: true, messageId: response };

    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message || error };
    }
};
