const { pool } = require("../db");
const { HttpError } = require("../middleware/errorHandler");

// GET /api/servicos/:id — Retorna um serviço específico com fotos e observações
async function getServicoById(req, res, next) {
  try {
    const servicoId = Number(req.params.id);
    const clienteId = req.clienteId;

    // Verificar se o serviço pertence ao cliente autenticado
    const servicoResult = await pool.query(
      "SELECT id, tipo, descricao, data_servico, responsavel, valor, status FROM servicos WHERE id = $1 AND cliente_id = $2",
      [servicoId, clienteId]
    );

    if (!servicoResult.rows[0]) {
      throw new HttpError(404, "Serviço não encontrado.");
    }

    const servico = servicoResult.rows[0];

    // Buscar fotos
    const fotosResult = await pool.query(
      "SELECT id, tipo, url, descricao FROM fotos_servico WHERE servico_id = $1 ORDER BY tipo, criado_em",
      [servicoId]
    );

    // Buscar observações
    const observacoesResult = await pool.query(
      "SELECT id, titulo, descricao FROM observacoes WHERE servico_id = $1 ORDER BY criado_em DESC",
      [servicoId]
    );

    res.json({
      id: servico.id,
      tipo: servico.tipo,
      descricao: servico.descricao,
      dataServico: servico.data_servico,
      responsavel: servico.responsavel,
      valor: servico.valor,
      status: servico.status,
      fotos: fotosResult.rows,
      observacoes: observacoesResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/clientes/:clienteId/servicos — Retorna todos os serviços de um cliente
async function getServicosByCliente(req, res, next) {
  try {
    const clienteId = Number(req.params.clienteId);
    const authClienteId = req.clienteId;

    // Verificar se o cliente autenticado é o mesmo
    if (clienteId !== authClienteId) {
      throw new HttpError(403, "Acesso não autorizado.");
    }

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
      [clienteId]
    );

    res.json({ servicos: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getServicoById,
  getServicosByCliente,
};
