import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:3001';

router.get('/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const url = `${AI_ENGINE_URL.replace(/\/$/, '')}/recommend/${address}`;
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ error: 'AI engine error', status: r.status });
    }
    const data = await r.json().catch(() => []);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
