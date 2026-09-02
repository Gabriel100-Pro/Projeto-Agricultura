-- Schema completo do Portal do Cliente — Raiz Silvestre
-- Execute este arquivo uma única vez em um banco PostgreSQL vazio.

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  email VARCHAR(150),
  telefone VARCHAR(20),
  endereco VARCHAR(255),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes (cpf);

CREATE TABLE IF NOT EXISTS jardins (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  area_m2 NUMERIC(10,2),
  tipo VARCHAR(100),
  data_inicio DATE NOT NULL,
  observacoes TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jardins_cliente ON jardins (cliente_id);

CREATE TABLE IF NOT EXISTS servicos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(150) NOT NULL,
  descricao TEXT,
  data_servico DATE NOT NULL,
  responsavel VARCHAR(150),
  status VARCHAR(20) NOT NULL DEFAULT 'agendado', -- agendado | andamento | concluido
  valor NUMERIC(10,2),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON servicos (cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_data ON servicos (data_servico);

CREATE TABLE IF NOT EXISTS fotos_servico (
  id SERIAL PRIMARY KEY,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- 'antes' | 'depois' | 'geral'
  url TEXT NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_servico_servico ON fotos_servico (servico_id);

CREATE TABLE IF NOT EXISTS observacoes (
  id SERIAL PRIMARY KEY,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observacoes_servico ON observacoes (servico_id);

CREATE TABLE IF NOT EXISTS proximos_cuidados (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_prevista DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente | concluido | cancelado
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proximos_cuidados_cliente ON proximos_cuidados (cliente_id);
CREATE INDEX IF NOT EXISTS idx_proximos_cuidados_data ON proximos_cuidados (data_prevista);
