const rateLimit =
  require("express-rate-limit");

const loginLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      error:
        "Too many login attempts. Please try again later."
    }
  });


const apiLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: true,

    legacyHeaders: false
  });


module.exports = {
  loginLimiter,
  apiLimiter
};