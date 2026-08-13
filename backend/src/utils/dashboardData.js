const { pool } = require("../db");
const { HttpError } = require("../middleware/errorHandler");
const { maskCpf } = require("./format");

// Reúne todos os dados exibidos no dashboard/perfil do cliente autenticado.
async function getClienteDashboardData(clienteId) {
  const clienteResult = await pool.query(
    "SELECT id, nome, cpf, telefone, endereco FROM clientes WHERE id = $1",
    [clienteId]
  );

  const cliente = clienteResult.rows[0];

  if (!cliente) {
    throw new HttpError(404, "Cliente não encontrado.");
  }

  const jardimResult = await pool.query(
    "SELECT data_inicio FROM jardins WHERE cliente_id = $1 ORDER BY data_inicio ASC LIMIT 1",
    [cliente.id]
  );

  const resumoResult = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'concluido') AS visitas_realizadas,
      MAX(data_servico) FILTER (WHERE status = 'concluido') AS ultima_manutencao,
      MIN(data_servico) FILTER (WHERE status = 'agendado' AND data_servico >= CURRENT_DATE) AS proxima_visita
    FROM servicos
    WHERE cliente_id = $1`,
    [cliente.id]
  );

  const historicoResult = await pool.query(
    `SELECT tipo, descricao, data_servico, responsavel, valor, status
     FROM servicos
     WHERE cliente_id = $1
     ORDER BY data_servico DESC
     LIMIT 5`,
    [cliente.id]
  );

  const resumo = resumoResult.rows[0] || {};

  return {
    nome: cliente.nome,
    cpfMascarado: maskCpf(cliente.cpf),
    telefone: cliente.telefone,
    endereco: cliente.endereco,
    resumoJardim: {
      inicioAtendimento: jardimResult.rows[0]?.data_inicio || null,
      visitasRealizadas: Number(resumo.visitas_realizadas || 0),
      ultimaManutencao: resumo.ultima_manutencao || null,
      proximaVisita: resumo.proxima_visita || null,
    },
    historicoRecente: historicoResult.rows.map((row) => ({
      servico: row.tipo,
      descricao: row.descricao,
      responsavel: row.responsavel,
      valor: row.valor,
      data: row.data_servico,
      status: row.status,
    })),
  };
}

module.exports = { getClienteDashboardData };
