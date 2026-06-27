module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { to, from, message } = req.body;

  try {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.split('\\n').join('\n'),
      },
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tokens/${to}`;
    const firestoreRes = await fetch(firestoreUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!firestoreRes.ok) return res.status(200).json({ sent: false, reason: 'no token' });
    if (!firestoreRes.ok) {
  const errText = await firestoreRes.text();
  return res.status(200).json({ sent: false, reason: 'no token', status: firestoreRes.status, error: errText });
}
    const firestoreData = await firestoreRes.json();
    console.log('Firestore data:', JSON.stringify(firestoreData));
    const fcmToken = firestoreData.fields?.token?.stringValue;
    console.log('FCM token found:', fcmToken ? 'yes' : 'no');

    if (!fcmToken) return res.status(200).json({ sent: false, reason: 'no token value' });

    const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          data: {
            title: `${from} 💜`,
            body: message || 'Sent you something'
          }
        }
      })
    });

    const fcmData = await fcmRes.json();
    console.log('FCM response:', JSON.stringify(fcmData));
    res.status(200).json({ sent: true, fcm: fcmData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};