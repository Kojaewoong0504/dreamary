importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyA2cyPwM7IY5Evw7tFXQugsfvBgMYbaqj0",
    authDomain: "dreamary-c13bb.firebaseapp.com",
    projectId: "dreamary-c13bb",
    storageBucket: "dreamary-c13bb.firebasestorage.app",
    messagingSenderId: "387218532140",
    appId: "1:387218532140:web:b69a9be920bba23ce06e89",
    measurementId: "G-8MKVNCJS1D"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
