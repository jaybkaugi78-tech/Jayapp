module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { to, from, message } = req.body;

  try {
    // Get access token using service account
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

    // Get FCM token from Firestore REST API
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tokens/${to}`;
    
    const firestoreRes = await fetch(firestoreUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!firestoreRes.ok) return res.status(200).json({ sent: false, reason: 'no token' });
    
    const firestoreData = await firestoreRes.json();
    const firestoreData = await firestoreRes.json();
    console.log('Status:', firestoreRes.status);
    console.log('Firestore data:', JSON.stringify(firestoreData));
    console.log('Fields:', JSON.stringify(firestoreData.fields));
    const token = firestoreData.fields?.token?.stringValue;
    console.log('Token found:', token ? 'yes' : 'no');
    console.log('Firestore data:', JSON.stringify(firestoreData));
    const token = firestoreData.fields?.token?.stringValue;
    console.log('Token found:', token ? 'yes' : 'no');    
    if (!token) return res.status(200).json({ sent: false, reason: 'no token value' });

    // Send FCM notification
    const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          data: {
            title: `${from} 💜`,
            body: message || 'Sent you something'
          }
        }
      })
    });

    const fcmData = await fcmRes.json();
    res.status(200).json({ sent: true, fcm: fcmData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};