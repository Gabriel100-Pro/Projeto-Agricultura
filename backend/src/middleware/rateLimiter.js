const rateLimit = require("express-rate-limit");

// Limita tentativas de login por IP para mitigar força bruta sobre CPFs.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

module.exports = { loginLimiter };
