// Express application wiring: security middleware, API routes, and static
// serving of the built React client. Route handlers dispatch to feature
// services; errors funnel into the central error handler.
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { JSON_BODY_LIMIT } from './config/constants.js';
import { env } from './env.js';
import { assistantRoutes } from './features/assistant/routes.js';
import { operationsRoutes } from './features/operations/routes.js';
import { stadiumRoutes } from './features/stadium/routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { apiLimiter, assistantLimiter } from './middleware/rate-limit.js';
import {
  noStoreApi,
  permissionsPolicy,
  requireJsonPosts,
  securityHeaders,
  securityTxtHandler,
} from './middleware/security.js';
import { mountClient } from './middleware/static-client.js';

const PRODUCTION_ORIGIN = 'https://arenaiq.com';
const LOCAL_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (origin === undefined) {
    return true;
  }
  if (origin === PRODUCTION_ORIGIN) {
    return true;
  }
  if (env.NODE_ENV !== 'production' && LOCAL_ORIGINS.has(origin)) {
    return true;
  }
  return false;
}

/** Builds the fully-wired Express app (exported for supertest). */
export function buildApp(): express.Express {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(securityHeaders());
  app.use(permissionsPolicy);
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS policy'));
      },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  // Live operational data must never be stored by browsers or intermediaries,
  // and API POSTs only accept JSON (cross-site form posts are refused).
  app.use('/api', noStoreApi, requireJsonPosts);
  app.use('/api/assistant', assistantLimiter);

  // Coordinated-disclosure contact (RFC 9116). Registered before the SPA
  // fallback so it resolves to the file, not the client shell.
  app.get('/.well-known/security.txt', securityTxtHandler);

  // Liveness endpoint. Lives under /api because the Google Front End reserves
  // the bare /healthz path and answers it at the edge before Cloud Run. Placed
  // ahead of the rate limiter so health checks are never throttled.
  app.get('/api/health', (_req, res) => {
    // Status only — no version or build metadata on an unauthenticated route.
    res.json({ status: 'ok' });
  });

  app.use('/api', apiLimiter);
  app.use('/api/stadium', stadiumRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/operations', operationsRoutes);

  mountClient(app);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
