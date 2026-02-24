export function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      message: 'Route not found',
      status: 404,
      method: req.method,
      path: req.originalUrl,
    },
  });
}
