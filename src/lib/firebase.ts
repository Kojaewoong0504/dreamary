import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};

export const requestNotificationPermission = async () => {
    try {
        const supported = await isSupported();
        if (!supported) {
            console.log("Firebase Messaging is not supported in this browser.");
            return null;
        }

        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });
            console.log("FCM Token:", token);
            return token;
        } else {
            console.log("Notification permission denied.");
            return null;
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return null;
    }
};
