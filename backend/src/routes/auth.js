const express = require("express");
const jwt = require("jsonwebtoken");

const { pool } = require("../db");
const { isValidCpf, onlyDigits } = require("../utils/cpf");
const { HttpError } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const cpf = onlyDigits(req.body.cpf);

    if (!isValidCpf(cpf)) {
      throw new HttpError(400, "CPF inválido.");
    }

    const { rows } = await pool.query(
      "SELECT id, nome FROM clientes WHERE cpf = $1 LIMIT 1",
      [cpf]
    );

    const cliente = rows[0];

    if (!cliente) {
      throw new HttpError(
        404,
        "CPF não encontrado em nossa base de clientes. Verifique os dados ou entre em contato com a jardinagem."
      );
    }

    const token = jwt.sign(
      { sub: cliente.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
