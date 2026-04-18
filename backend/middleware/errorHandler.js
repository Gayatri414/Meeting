/**
 * Global error handler middleware.
 * Must be registered LAST in Express app.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
