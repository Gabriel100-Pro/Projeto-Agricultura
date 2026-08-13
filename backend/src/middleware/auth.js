const jwt = require("jsonwebtoken");
const { HttpError } = require("./errorHandler");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Token de autenticação ausente."));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.clienteId = payload.sub;
    next();
  } catch (error) {
    next(new HttpError(401, "Token inválido ou expirado."));
  }
}

module.exports = { authMiddleware };
