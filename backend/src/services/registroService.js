const { pool } = require("../db");
const { HttpError } = require("../middleware/errorHandler");
const { maskCpf, formatDate } = require("../utils/format");

/**
 * Retorna o registro completo de um cliente com todos os dados
 * Inclui: cliente, jardins, serviços, observações, fotos, próximos cuidados, estatísticas
 */
async function getRegistroCompleto(clienteId) {
  // 1. Buscar dados do cliente
  const clienteResult = await pool.query(
    "SELECT id, nome, cpf, email, telefone, endereco, criado_em FROM clientes WHERE id = $1",
    [clienteId]
  );

  if (!clienteResult.rows[0]) {
    throw new HttpError(404, "Cliente não encontrado.");
  }

  const cliente = clienteResult.rows[0];

  // 2. Buscar jardins
  const jardinsResult = await pool.query(
    `SELECT id, area_m2, tipo, data_inicio, observacoes, criado_em
     FROM jardins
     WHERE cliente_id = $1
     ORDER BY data_inicio ASC`,
    [clienteId]
  );

  // 3. Buscar serviços com fotos
  const servicosResult = await pool.query(
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

  // 4. Buscar observações para cada serviço
  const observacoesResult = await pool.query(
    `SELECT servico_id, id, titulo, descricao, criado_em
     FROM observacoes
     WHERE servico_id = ANY($1::int[])
     ORDER BY servico_id, criado_em DESC`,
    [servicosResult.rows.map((s) => s.id)]
  );

  const observacoesPorServico = {};
  observacoesResult.rows.forEach((obs) => {
    if (!observacoesPorServico[obs.servico_id]) {
      observacoesPorServico[obs.servico_id] = [];
    }
    observacoesPorServico[obs.servico_id].push({
      id: obs.id,
      titulo: obs.titulo,
      descricao: obs.descricao,
      criadoEm: obs.criado_em,
    });
  });

  // Adicionar observações aos serviços
  const servicosComObservacoes = servicosResult.rows.map((s) => ({
    id: s.id,
    tipo: s.tipo,
    descricao: s.descricao,
    dataServico: s.data_servico,
    responsavel: s.responsavel,
    valor: s.valor,
    status: s.status,
    fotos: s.fotos,
    observacoes: observacoesPorServico[s.id] || [],
  }));

  // 5. Buscar próximos cuidados
  const cuidadosResult = await pool.query(
    `SELECT id, titulo, descricao, data_prevista, status, criado_em
     FROM proximos_cuidados
     WHERE cliente_id = $1
     ORDER BY data_prevista ASC NULLS LAST`,
    [clienteId]
  );

  // 6. Calcular estatísticas
  const estatisticasResult = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'concluido') AS total_servicos,
      MAX(data_servico) FILTER (WHERE status = 'concluido') AS ultima_visita,
      MIN(data_servico) FILTER (WHERE status = 'agendado' AND data_servico >= CURRENT_DATE) AS proxima_manutencao,
      SUM(valor) FILTER (WHERE status = 'concluido') AS valor_total_servicos
    FROM servicos
    WHERE cliente_id = $1`,
    [clienteId]
  );

  const stats = estatisticasResult.rows[0] || {};

  // 7. Montar resposta completa
  return {
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      cpf: maskCpf(cliente.cpf),
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      criadoEm: cliente.criado_em,
    },
    jardins: jardinsResult.rows.map((j) => ({
      id: j.id,
      areaMeter2: j.area_m2,
      tipo: j.tipo,
      dataInicio: j.data_inicio,
      observacoes: j.observacoes,
      criadoEm: j.criado_em,
    })),
    servicos: servicosComObservacoes,
    proximosCuidados: cuidadosResult.rows.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      descricao: c.descricao,
      dataPrevista: c.data_prevista,
      status: c.status,
      criadoEm: c.criado_em,
    })),
    estatisticas: {
      totalServicos: Number(stats.total_servicos || 0),
      ultimaVisita: stats.ultima_visita || null,
      proximaManutencao: stats.proxima_manutencao || null,
      valorTotalServicos: stats.valor_total_servicos || 0,
    },
  };
}

module.exports = {
  getRegistroCompleto,
};
