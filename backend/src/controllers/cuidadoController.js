const { pool } = require("../db");
const { HttpError } = require("../middleware/errorHandler");

// GET /api/clientes/:clienteId/proximos-cuidados — Obter próximos cuidados
async function getProximosCuidados(req, res, next) {
  try {
    const clienteId = Number(req.params.clienteId || req.clienteId);
    const authClienteId = Number(req.clienteId);

    // Verificar se o cliente autenticado é o mesmo
    if (clienteId !== authClienteId) {
      throw new HttpError(403, "Acesso não autorizado.");
    }

    const result = await pool.query(
      `SELECT id, titulo, descricao, data_prevista, status
       FROM proximos_cuidados
       WHERE cliente_id = $1
       ORDER BY data_prevista ASC NULLS LAST, criado_em DESC`,
      [clienteId]
    );

    res.json({ proximosCuidados: result.rows });
  } catch (error) {
    next(error);
  }
}

// GET /api/proximos-cuidados/:id — Obter um próximo cuidado específico
async function getProximoCuidadoById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const clienteId = req.clienteId;

    const result = await pool.query(
      `SELECT id, titulo, descricao, data_prevista, status
       FROM proximos_cuidados
       WHERE id = $1 AND cliente_id = $2`,
      [id, clienteId]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "Próximo cuidado não encontrado.");
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// POST /api/clientes/:clienteId/proximos-cuidados — Criar próximo cuidado
// (Admin endpoint, para ser usado pela área de administração)
async function createProximoCuidado(req, res, next) {
  try {
    const clienteId = Number(req.params.clienteId);
    const authClienteId = Number(req.clienteId);
    const { titulo, descricao, data_prevista } = req.body;

    if (clienteId !== authClienteId) {
      throw new HttpError(403, "Acesso não autorizado.");
    }

    // Validações
    if (!titulo || titulo.trim() === "") {
      throw new HttpError(400, "Título é obrigatório.");
    }

    if (!descricao || descricao.trim() === "") {
      throw new HttpError(400, "Descrição é obrigatória.");
    }

    // Verificar se o cliente existe
    const clienteResult = await pool.query(
      "SELECT id FROM clientes WHERE id = $1",
      [clienteId]
    );

    if (!clienteResult.rows[0]) {
      throw new HttpError(404, "Cliente não encontrado.");
    }

    const result = await pool.query(
      `INSERT INTO proximos_cuidados (cliente_id, titulo, descricao, data_prevista)
       VALUES ($1, $2, $3, $4)
       RETURNING id, titulo, descricao, data_prevista, status, criado_em`,
      [clienteId, titulo.trim(), descricao.trim(), data_prevista || null]
    );

    const cuidado = result.rows[0];

    res.status(201).json({
      message: "Próximo cuidado criado com sucesso.",
      cuidado,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/proximos-cuidados/:id — Atualizar próximo cuidado
// (Admin endpoint)
async function updateProximoCuidado(req, res, next) {
  try {
    const id = Number(req.params.id);
    const clienteId = Number(req.clienteId);
    const { titulo, descricao, data_prevista, status } = req.body;

    // Validações
    if (status && !["pendente", "concluido", "cancelado"].includes(status)) {
      throw new HttpError(400, "Status inválido.");
    }

    const result = await pool.query(
      `UPDATE proximos_cuidados
       SET titulo = COALESCE($2, titulo),
           descricao = COALESCE($3, descricao),
           data_prevista = COALESCE($4, data_prevista),
           status = COALESCE($5, status),
           atualizado_em = NOW()
      WHERE id = $1 AND cliente_id = $6
       RETURNING id, titulo, descricao, data_prevista, status, atualizado_em`,
          [id, titulo || null, descricao || null, data_prevista || null, status || null, clienteId]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "Próximo cuidado não encontrado.");
    }

    res.json({
      message: "Próximo cuidado atualizado com sucesso.",
      cuidado: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/proximos-cuidados/:id — Deletar próximo cuidado
// (Admin endpoint)
async function deleteProximoCuidado(req, res, next) {
  try {
    const id = Number(req.params.id);
    const clienteId = Number(req.clienteId);

    const result = await pool.query(
      "DELETE FROM proximos_cuidados WHERE id = $1 AND cliente_id = $2 RETURNING id",
      [id, clienteId]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "Próximo cuidado não encontrado.");
    }

    res.json({ message: "Próximo cuidado removido com sucesso." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProximosCuidados,
  getProximoCuidadoById,
  createProximoCuidado,
  updateProximoCuidado,
  deleteProximoCuidado,
};
