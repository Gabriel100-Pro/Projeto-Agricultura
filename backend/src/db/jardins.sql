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
