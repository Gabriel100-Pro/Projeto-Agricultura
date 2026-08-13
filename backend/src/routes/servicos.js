const express = require("express");

const { pool } = require("../db");
const { authMiddleware } = require("../middleware/auth");
const { HttpError } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        s.id, s.tipo, s.descricao, s.data_servico, s.responsavel, s.valor, s.status,
        COALESCE(
          json_agg(json_build_object('id', f.id, 'tipo', f.tipo, 'url', f.url))
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

router.get("/:id/fotos", authMiddleware, async (req, res, next) => {
  try {
    const servicoId = Number(req.params.id);

    const servicoResult = await pool.query(
      "SELECT id FROM servicos WHERE id = $1 AND cliente_id = $2",
      [servicoId, req.clienteId]
    );

    if (!servicoResult.rows[0]) {
      throw new HttpError(404, "Serviço não encontrado.");
    }

    const fotosResult = await pool.query(
      "SELECT id, tipo, url FROM fotos_servico WHERE servico_id = $1 ORDER BY tipo",
      [servicoId]
    );

    res.json({
      antes: fotosResult.rows.filter((foto) => foto.tipo === "antes"),
      depois: fotosResult.rows.filter((foto) => foto.tipo === "depois"),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
