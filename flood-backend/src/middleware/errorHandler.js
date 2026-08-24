const errorHandler = (err, req, res, next) => {
  console.error("\n========== GLOBAL ERROR ==========");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("==================================\n");

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",

    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;