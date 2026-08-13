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
  tipo VARCHAR(10) NOT NULL, -- 'antes' | 'depois'
  url TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_servico_servico ON fotos_servico (servico_id);
