import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './api/routes';
import { llmProviderInstance } from './agent/llmProvider';

// Load environment variables from backend or root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'OpsPilot Backend',
    timestamp: new Date().toISOString(),
    llmProvider: llmProviderInstance.getModelName()
  });
});

// Serve frontend build if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const server = app.listen(port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 OpsPilot — Autonomous Enterprise Operations Worker`);
  console.log(`📡 Backend API listening on http://localhost:${port}`);
  console.log(`🧠 LLM Provider: ${llmProviderInstance.getModelName()}`);
  console.log(`🏢 Sandbox Environment: Acme Global Enterprise initialized`);
  console.log(`=======================================================`);
});

export { app, server };
