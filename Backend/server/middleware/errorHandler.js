import { env } from '../config/env.js';

function normalizeStatusCode(value) {
  const status = Number(value);
  if (!Number.isFinite(status)) return 500;
  if (status < 400 || status > 599) return 500;
  return status;
}

function isJsonBodyParseError(err) {
  // express.json() uses body-parser under the hood.
  // Typical shape: SyntaxError + type: 'entity.parse.failed' + status: 400
  return err && err.type === 'entity.parse.failed';
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = isJsonBodyParseError(err)
    ? 400
    : normalizeStatusCode(err?.statusCode ?? err?.status);

  const message = isJsonBodyParseError(err)
    ? 'Invalid JSON body'
    : (err?.message ?? 'Internal Server Error');

  const payload = {
    ok: false,
    error: {
      message,
      status,
    },
  };

  if (err?.details !== undefined) {
    payload.error.details = err.details;
  }

  if (!env.isProd) {
    if (err?.name) payload.error.name = err.name;
    if (err?.stack) payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
}
