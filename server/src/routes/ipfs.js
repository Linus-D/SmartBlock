import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Pin text or JSON by posting raw content (JSON preferred)
router.post('/pin', async (req, res) => {
  try {
    const PINATA_JWT = process.env.PINATA_JWT;
    if (!PINATA_JWT) {
      console.warn('PINATA_JWT missing from environment');
      return res.status(500).json({ error: 'PINATA_JWT not configured on server' });
    }

    const { content, filename = 'data.json', contentType = 'application/json' } = req.body || {};
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'content (string) is required' });
    }

    const form = new FormData();
    // Create a Blob from content
    const blob = new Blob([content], { type: contentType });
    form.append('file', blob, filename);

    const r = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: form,
    });
    if (!r.ok) {
      return res.status(502).json({ error: 'Pinata upload failed', status: r.status, text: await r.text() });
    }
    const data = await r.json();
    return res.json({ cid: data.IpfsHash });
  } catch (e) {
    console.error('IPFS pin error', e);
    return res.status(500).json({ error: 'Failed to pin' });
  }
});

export default router;
