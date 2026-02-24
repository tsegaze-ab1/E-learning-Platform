import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';
import { requestLogger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { coursesRouter } from './routes/courses.js';
import { contentRouter } from './routes/content.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

const corsOrigin = env.corsOrigins.includes('*') ? true : env.corsOrigins;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

app.use(
  requestLogger({
    enabled: env.nodeEnv !== 'test',
  }),
);

// Public routes
app.use('/', healthRouter);

// Versioned API base (placeholder)
app.get('/api/v1', (req, res) => {
  res.json({ ok: true, name: 'e-learning-api', version: 'v1' });
});

app.use('/api/v1', authRouter);

// REST API (per project requirements)
app.use('/api', coursesRouter);
app.use('/api', contentRouter);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught exception:', err);
  process.exit(1);
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.port}`);
});
