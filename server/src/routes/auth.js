import { Router } from 'express';
import { upsertUser, getUser } from '../db.js';

const router = Router();

// Simple session with signed cookie
router.post('/login', (req, res) => {
  const { address, username } = req.body || {};
  if (!address) return res.status(400).json({ error: 'address required' });

  if (username) upsertUser.run(address.toLowerCase(), username);

  res.cookie('sb_sess', address.toLowerCase(), {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true, address: address.toLowerCase() });
});

router.post('/logout', (req, res) => {
  res.clearCookie('sb_sess');
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const address = req.signedCookies?.sb_sess;
  if (!address) return res.status(401).json({ error: 'not logged in' });
  const user = getUser.get(address);
  res.json({ address, user: user || null });
});

export default router;
