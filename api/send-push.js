import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

import {
  getFirestore,
} from "firebase-admin/firestore";

import {
  getMessaging,
} from "firebase-admin/messaging";

// ============================
// FIREBASE ADMIN
// ============================

function getAdminApp() {
  if (
    getApps().length > 0
  ) {
    return getApps()[0];
  }

  const projectId =
    process.env
      .FIREBASE_ADMIN_PROJECT_ID;

  const clientEmail =
    process.env
      .FIREBASE_ADMIN_CLIENT_EMAIL;

  const privateKey =
    process.env
      .FIREBASE_ADMIN_PRIVATE_KEY
      ?.replace(
        /\\n/g,
        "\n"
      );

  if (
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    throw new Error(
      "Missing Firebase Admin environment variables."
    );
  }

  return initializeApp({
    credential:
      cert({
        projectId,
        clientEmail,
        privateKey,
      }),
  });
}

// ============================
// API HANDLER
// ============================

export default async function handler(
  req,
  res
) {
  if (
    req.method !== "POST"
  ) {
    return res
      .status(405)
      .json({
        error:
          "Method not allowed.",
      });
  }

  try {
    // ============================
    // VERIFY FIREBASE USER
    // ============================

    const authorization =
      req.headers
        .authorization ||
      "";

    if (
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res
        .status(401)
        .json({
          error:
            "Missing authentication.",
        });
    }

    const idToken =
      authorization.slice(
        7
      );

    const app =
      getAdminApp();

    const decoded =
      await getAuth(
        app
      ).verifyIdToken(
        idToken
      );

    // ============================
    // IDENTIFY SENDER
    // ============================

    let senderPerson =
      null;

    if (
      decoded.uid ===
      process.env
        .JAY_FIREBASE_UID
    ) {
      senderPerson =
        "Jay";
    }

    if (
      decoded.uid ===
      process.env
        .MILLIE_FIREBASE_UID
    ) {
      senderPerson =
        "Millie";
    }

    if (
      !senderPerson
    ) {
      return res
        .status(403)
        .json({
          error:
            "User not allowed.",
        });
    }

    // ============================
    // REQUEST BODY
    // ============================

    const {
      to,
      title,
      text,
    } = req.body || {};

    if (
      ![
        "Jay",
        "Millie",
      ].includes(to)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid recipient.",
        });
    }

    if (
      senderPerson ===
      to
    ) {
      return res
        .status(400)
        .json({
          error:
            "Cannot send a push notification to yourself.",
        });
    }

    // ============================
    // GET RECIPIENT FIDS
    // ============================

    const db =
      getFirestore(
        app
      );

    const snapshot =
      await db
        .collection(
          "tokens"
        )
        .where(
          "person",
          "==",
          to
        )
        .where(
          "enabled",
          "==",
          true
        )
        .get();

    const fids =
      snapshot.docs
        .map(
          (item) =>
            item.data()
              .installationId
        )
        .filter(
          Boolean
        );

    if (
      fids.length === 0
    ) {
      return res
        .status(200)
        .json({
          success:
            true,

          sent:
            0,

          message:
            "Recipient has no registered devices.",
        });
    }

    // ============================
    // NOTIFICATION CONTENT
    // ============================

    const safeTitle =
      String(
        title ||
          `New message from ${senderPerson}`
      ).slice(
        0,
        100
      );

    /*
      Keep the lock-screen
      notification private.

      We are deliberately not
      showing the full message
      text here.
    */

    const safeBody =
      `New message from ${senderPerson}`;

    // ============================
    // SEND FCM
    // ============================

    const response =
      await getMessaging(
        app
      ).sendEachForMulticast({
        fids,

        notification: {
          title:
            safeTitle,

          body:
            safeBody,
        },

        data: {
          sender:
            senderPerson,

          recipient:
            to,

          type:
            "message",
        },

        webpush: {
          notification: {
            icon:
              "/icon-192.png",

            badge:
              "/icon-192.png",
          },
        },
      });

    console.log(
      "FCM push result:",
      {
        successCount:
          response.successCount,

        failureCount:
          response.failureCount,
      }
    );

    return res
      .status(200)
      .json({
        success:
          true,

        sent:
          response.successCount,

        failed:
          response.failureCount,
      });
  } catch (error) {
    console.error(
      "Push send error:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to send notification.",
      });
  }
}