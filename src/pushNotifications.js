import {
  onRegistered,
  register,
} from "firebase/messaging";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  getFirebaseMessaging,
} from "./firebase";

export async function enablePushNotifications(
  person
) {
  if (
    !person ||
    !auth.currentUser
  ) {
    throw new Error(
      "You must be signed in first."
    );
  }

  if (
    !("Notification" in window)
  ) {
    throw new Error(
      "Notifications are not supported on this device."
    );
  }

  if (
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Service workers are not supported on this device."
    );
  }

  const permission =
    await Notification.requestPermission();

  if (
    permission !== "granted"
  ) {
    throw new Error(
      "Notification permission was not granted."
    );
  }

  const messaging =
    await getFirebaseMessaging();

  if (!messaging) {
    throw new Error(
      "Firebase Messaging is not supported on this device."
    );
  }

  const vapidKey =
    import.meta.env
      .VITE_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error(
      "Missing Firebase VAPID key."
    );
  }

  const uid =
    auth.currentUser.uid;

  /*
    Use the SAME service worker
    as the PWA.

    This prevents Firebase from
    creating another worker at "/".
  */

  const serviceWorkerRegistration =
    await navigator.serviceWorker
      .register("/sw.js");

  await navigator.serviceWorker
    .ready;

  const unsubscribe =
    onRegistered(
      messaging,
      async (
        installationId
      ) => {
        console.log(
          "Push registered:",
          installationId
        );

        await setDoc(
          doc(
            db,
            "tokens",
            installationId
          ),
          {
            installationId,

            type:
              "fid",

            person,

            uid,

            enabled:
              true,

            updatedAt:
              serverTimestamp(),
          },

          {
            merge:
              true,
          }
        );
      }
    );

  try {
    await register(
      messaging,
      {
        vapidKey,

        serviceWorkerRegistration,
      }
    );
  } catch (error) {
    unsubscribe();

    throw error;
  }

  return unsubscribe;
}