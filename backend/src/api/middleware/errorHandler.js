/**
 * Umumiy xato handler middleware
 */
export function errorHandler(err, req, res, _next) {
  console.error('❌ API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ichki server xatosi';

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: true,
    message: `${req.method} ${req.path} topilmadi`,
  });
}

export default { errorHandler, notFoundHandler };
