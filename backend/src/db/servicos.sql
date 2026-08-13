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
