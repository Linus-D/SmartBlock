import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { initSchema } from './db.js';

import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import notificationsRouter from './routes/notifications.js';
import recommendationsRouter from './routes/recommendations.js';
import ipfsRouter from './routes/ipfs.js';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000','http://localhost:5173','http://localhost:5174','http://localhost:5175'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'));

// DB
initSchema();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/ipfs', ipfsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// no-op change to trigger reload
