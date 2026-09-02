const express = require("express");

const { authMiddleware } = require("../middleware/auth");
const { getServicoById, getServicosByCliente } = require("../controllers/servicoController");
const { getFotosByServico } = require("../controllers/fotoController");

const router = express.Router();

// GET /api/servicos — Todos os serviços do cliente autenticado
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { pool } = require("../db");
    const { rows } = await pool.query(
      `SELECT
        s.id, s.tipo, s.descricao, s.data_servico, s.responsavel, s.valor, s.status,
        COALESCE(
          json_agg(json_build_object('id', f.id, 'tipo', f.tipo, 'url', f.url, 'descricao', f.descricao))
          FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) AS fotos
      FROM servicos s
      LEFT JOIN fotos_servico f ON f.servico_id = s.id
      WHERE s.cliente_id = $1
      GROUP BY s.id
      ORDER BY s.data_servico DESC`,
      [req.clienteId]
    );

    res.json({ servicos: rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/servicos/:id — Obter um serviço específico
router.get("/:id", authMiddleware, getServicoById);

// GET /api/servicos/:id/fotos — Obter fotos de um serviço
router.get("/:id/fotos", authMiddleware, getFotosByServico);

module.exports = router;
