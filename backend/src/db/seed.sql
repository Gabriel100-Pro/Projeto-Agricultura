-- Dados de teste: cliente fictício para validar o Portal do Cliente.
-- Execute após o schema.sql.

INSERT INTO clientes (nome, cpf, email, telefone, endereco)
VALUES (
  'João da Silva',
  '52998224725',
  'joao.silva@email.com',
  '(11) 91234-5678',
  'Rua das Palmeiras, 120 — Jundiaí/SP'
)
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO jardins (cliente_id, area_m2, tipo, data_inicio, observacoes)
SELECT id, 85.5, 'Jardim residencial', '2026-03-15', 'Gramado, canteiros e cerca viva.'
FROM clientes WHERE cpf = '52998224725';

INSERT INTO servicos (cliente_id, tipo, descricao, data_servico, responsavel, status, valor)
SELECT id, 'Implantação de jardim residencial', 'Plantio de gramado e canteiros na frente da casa.', '2026-03-15', 'Juliano Silvestre Diogo', 'concluido', 3200.00
FROM clientes WHERE cpf = '52998224725';

INSERT INTO servicos (cliente_id, tipo, descricao, data_servico, responsavel, status, valor)
SELECT id, 'Adubação e tratamento de solo', 'Reposição de nutrientes e correção do solo.', '2026-05-22', 'Juliano Silvestre Diogo', 'concluido', 480.00
FROM clientes WHERE cpf = '52998224725';

INSERT INTO servicos (cliente_id, tipo, descricao, data_servico, responsavel, status, valor)
SELECT id, 'Poda de cerca viva', 'Poda de formatação da cerca viva lateral.', '2026-08-02', 'Equipe Raiz Silvestre', 'concluido', 350.00
FROM clientes WHERE cpf = '52998224725';

INSERT INTO servicos (cliente_id, tipo, descricao, data_servico, responsavel, status, valor)
SELECT id, 'Manutenção de jardim', 'Manutenção mensal: poda, adubação e limpeza.', '2026-08-10', 'Equipe Raiz Silvestre', 'andamento', 420.00
FROM clientes WHERE cpf = '52998224725';

INSERT INTO servicos (cliente_id, tipo, descricao, data_servico, responsavel, status, valor)
SELECT id, 'Visita técnica de acompanhamento', 'Visita de rotina para avaliação do jardim.', '2026-09-05', 'Juliano Silvestre Diogo', 'agendado', NULL
FROM clientes WHERE cpf = '52998224725';

-- Observações para os serviços
INSERT INTO observacoes (servico_id, titulo, descricao)
SELECT s.id, 'Plantio realizado com sucesso', 'Todos os canteiros foram preparados e plantados. Plantas se adaptando bem ao solo.'
FROM servicos s
JOIN clientes c ON s.cliente_id = c.id
WHERE c.cpf = '52998224725' AND s.tipo = 'Implantação de jardim residencial';

INSERT INTO observacoes (servico_id, titulo, descricao)
SELECT s.id, 'Solo corrigido', 'pH ajustado para 6.5. Solo agora adequado para plantas ornamentais.'
FROM servicos s
JOIN clientes c ON s.cliente_id = c.id
WHERE c.cpf = '52998224725' AND s.tipo = 'Adubação e tratamento de solo';

-- Próximos cuidados
INSERT INTO proximos_cuidados (cliente_id, titulo, descricao, data_prevista, status)
SELECT c.id, 'Aplicação de pesticida natural', 'Aplicar tratamento preventivo contra pragas no gramado e canteiros.', '2026-09-20', 'pendente'
FROM clientes c WHERE c.cpf = '52998224725';

INSERT INTO proximos_cuidados (cliente_id, titulo, descricao, data_prevista, status)
SELECT c.id, 'Poda de verão', 'Poda de formatação de arbustos e árvores para manter forma adequada.', '2026-10-15', 'pendente'
FROM clientes c WHERE c.cpf = '52998224725';

INSERT INTO proximos_cuidados (cliente_id, titulo, descricao, data_prevista, status)
SELECT c.id, 'Adubação de manutenção', 'Reposição de nutrientes do solo para manter qualidade.', '2026-09-30', 'pendente'
FROM clientes c WHERE c.cpf = '52998224725';

-- CPF de teste para login no portal: 529.982.247-25
