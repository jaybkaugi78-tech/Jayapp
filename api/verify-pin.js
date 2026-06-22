export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { user, pin } = req.body;
  
  const PINS = {
    Jay: process.env.PIN_JAY,
    Millie: process.env.PIN_MILLIE
  };
  
  if (PINS[user] && pin === PINS[user]) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
}