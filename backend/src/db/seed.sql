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

-- CPF de teste para login no portal: 529.982.247-25
