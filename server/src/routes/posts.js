import { Router } from 'express';
import { insertPost, updatePost, deletePost, getPostById, listPosts } from '../db.js';

const router = Router();

// List posts
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  const rows = listPosts.all(limit, offset);
  res.json({ items: rows, limit, offset });
});

// Get post by id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = getPostById.get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

// Create post (requires session cookie)
router.post('/', (req, res) => {
  const address = req.signedCookies?.sb_sess;
  if (!address) return res.status(401).json({ error: 'not logged in' });
  const { content = '', ipfsCid = '' } = req.body || {};
  const result = insertPost.run(address, content, ipfsCid);
  const row = getPostById.get(result.lastInsertRowid);
  res.status(201).json(row);
});

// Update post
router.put('/:id', (req, res) => {
  const address = req.signedCookies?.sb_sess;
  if (!address) return res.status(401).json({ error: 'not logged in' });
  const id = Number(req.params.id);
  const { content = '', ipfsCid = '' } = req.body || {};
  updatePost.run(content, ipfsCid, id);
  const row = getPostById.get(id);
  res.json(row);
});

// Delete post
router.delete('/:id', (req, res) => {
  const address = req.signedCookies?.sb_sess;
  if (!address) return res.status(401).json({ error: 'not logged in' });
  const id = Number(req.params.id);
  deletePost.run(id);
  res.json({ ok: true });
});

export default router;
