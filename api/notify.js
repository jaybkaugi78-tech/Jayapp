import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { to, from, message } = req.body;
  try {
    const db = admin.firestore();
    const tokenDoc = await db.collection('tokens').doc(to).get();
    if (!tokenDoc.exists) return res.status(200).json({ sent: false });
    const { token } = tokenDoc.data();
    await admin.messaging().send({
      token,
      notification: {
        title: `${from} 💜`,
        body: message || 'Sent you something'
      }
    });
    res.status(200).json({ sent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}