CREATE TABLE IF NOT EXISTS fotos_servico (
  id SERIAL PRIMARY KEY,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL, -- 'antes' | 'depois'
  url TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_servico_servico ON fotos_servico (servico_id);
