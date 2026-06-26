importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDig5IqgBD1vj8godQYd5bzMErESkePCwI",
  authDomain: "jay-and-millie.firebaseapp.com",
  projectId: "jay-and-millie",
  storageBucket: "jay-and-millie.firebasestorage.app",
  messagingSenderId: "458162909286",
  appId: "1:458162909286:web:90814571d8c82e8f93fda7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png'
  });
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});