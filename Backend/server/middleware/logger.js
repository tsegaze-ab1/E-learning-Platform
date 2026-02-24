import morgan from 'morgan';

export function requestLogger({ enabled }) {
  if (!enabled) {
    return (req, res, next) => next();
  }

  return morgan(':method :url :status :res[content-length] - :response-time ms', {
    skip: (req) => req.path === '/health',
  });
}
