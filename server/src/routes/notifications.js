import { Router } from 'express';
import { listEvents } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const offset = parseInt(req.query.offset || '0', 10);
  const rows = listEvents.all(limit, offset).map(e => ({
    ...e,
    data: safeParseJSON(e.data),
  }));
  res.json({ items: rows, limit, offset });
});

function safeParseJSON(s) {
  try { return JSON.parse(s); } catch { return null; }
}

export default router;
