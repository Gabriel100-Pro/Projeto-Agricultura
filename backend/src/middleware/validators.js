const { HttpError } = require("./errorHandler");
const { isValidCpf } = require("../utils/cpf");

// Validar CPF
function validateCpf(cpf) {
  if (!cpf || typeof cpf !== "string") {
    throw new HttpError(400, "CPF deve ser uma string válida.");
  }

  if (!isValidCpf(cpf)) {
    throw new HttpError(400, "CPF inválido.");
  }

  return true;
}

// Validar email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new HttpError(400, "Email inválido.");
  }

  return true;
}

// Validar data (formato YYYY-MM-DD)
function validateDate(dateString) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new HttpError(400, "Data deve estar no formato YYYY-MM-DD.");
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, "Data inválida.");
  }

  return true;
}

// Validar campo obrigatório
function validateRequired(value, fieldName) {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    throw new HttpError(400, `${fieldName} é obrigatório.`);
  }

  return true;
}

// Validar telefone (basic)
function validateTelefone(telefone) {
  if (!telefone) return true; // campo opcional

  const phoneRegex = /^\d{10,15}$/;
  const cleanPhone = String(telefone).replace(/\D/g, "");

  if (!phoneRegex.test(cleanPhone)) {
    throw new HttpError(400, "Telefone inválido.");
  }

  return true;
}

// Middleware para validar corpo de requisição
function validateCliente(req, res, next) {
  try {
    const { nome, cpf, email, telefone } = req.body;

    if (nome) {
      validateRequired(nome, "Nome");
      if (typeof nome !== "string" || nome.length > 150) {
        throw new HttpError(400, "Nome deve ser uma string de até 150 caracteres.");
      }
    }

    if (cpf) {
      validateCpf(cpf);
    }

    if (email) {
      validateEmail(email);
    }

    if (telefone) {
      validateTelefone(telefone);
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateCpf,
  validateEmail,
  validateDate,
  validateRequired,
  validateTelefone,
  validateCliente,
};
