export function notFound(req, res, _next) {
  return res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error("[error]", err);
  const status = err.statusCode || 500;

  return res.status(status).json({
    error: err.name || "InternalServerError",
    message: err.message || "Unexpected error",
  });
}
