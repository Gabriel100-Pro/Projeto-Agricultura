// Remove espaços extras e caracteres de controle de todas as strings recebidas no corpo da requisição.
function sanitizeValue(value) {
  if (typeof value === "string") {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)])
    );
  }

  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
}

module.exports = { sanitizeInput };
