const { pool } = require("../db");
const { HttpError } = require("../middleware/errorHandler");
const path = require("path");
const fs = require("fs");

// Diretório para armazenamento de uploads (versão local)
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Garantir que o diretório exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Validações para upload
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file) {
  if (!file) {
    throw new HttpError(400, "Arquivo não fornecido.");
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new HttpError(400, "Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new HttpError(400, "Arquivo muito grande. Máximo 5MB.");
  }

  return true;
}

// POST /api/servicos/:servicoId/fotos — Upload de foto para um serviço
async function uploadFotoServico(req, res, next) {
  try {
    const servicoId = Number(req.params.servicoId);
    const clienteId = req.clienteId;
    const { tipo } = req.body;

    // Validar tipo
    if (!["antes", "depois", "geral"].includes(tipo)) {
      throw new HttpError(400, "Tipo de foto inválido. Use 'antes', 'depois' ou 'geral'.");
    }

    // Validar arquivo
    if (!req.file) {
      throw new HttpError(400, "Arquivo não fornecido.");
    }

    validateImageFile(req.file);

    // Verificar se o serviço pertence ao cliente autenticado (apenas para segurança)
    const servicoResult = await pool.query(
      "SELECT id FROM servicos WHERE id = $1 AND cliente_id = $2",
      [servicoId, clienteId]
    );

    if (!servicoResult.rows[0]) {
      throw new HttpError(404, "Serviço não encontrado ou acesso não autorizado.");
    }

    // Gerar URL da foto (em produção, seria URL do Cloudinary/S3/etc)
    const filename = `${servicoId}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Salvar arquivo localmente
    fs.writeFileSync(filepath, req.file.buffer);

    // Salvar informação de foto no banco
    const insertResult = await pool.query(
      `INSERT INTO fotos_servico (servico_id, tipo, url, descricao)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tipo, url, descricao`,
      [servicoId, tipo, `/uploads/${filename}`, req.body.descricao || null]
    );

    const foto = insertResult.rows[0];

    res.status(201).json({
      message: "Foto enviada com sucesso.",
      foto: {
        id: foto.id,
        tipo: foto.tipo,
        url: foto.url,
        descricao: foto.descricao,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/servicos/:servicoId/fotos — Obter fotos de um serviço
async function getFotosByServico(req, res, next) {
  try {
    const servicoId = Number(req.params.servicoId);
    const clienteId = req.clienteId;

    // Verificar se o serviço pertence ao cliente
    const servicoResult = await pool.query(
      "SELECT id FROM servicos WHERE id = $1 AND cliente_id = $2",
      [servicoId, clienteId]
    );

    if (!servicoResult.rows[0]) {
      throw new HttpError(404, "Serviço não encontrado.");
    }

    const fotosResult = await pool.query(
      "SELECT id, tipo, url, descricao FROM fotos_servico WHERE servico_id = $1 ORDER BY tipo, criado_em",
      [servicoId]
    );

    // Agrupar por tipo
    const fotosPorTipo = {
      antes: fotosResult.rows.filter((f) => f.tipo === "antes"),
      depois: fotosResult.rows.filter((f) => f.tipo === "depois"),
      geral: fotosResult.rows.filter((f) => f.tipo === "geral"),
    };

    res.json(fotosPorTipo);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/fotos/:fotoId — Deletar uma foto
async function deleteFoto(req, res, next) {
  try {
    const fotoId = Number(req.params.fotoId);
    const clienteId = req.clienteId;

    // Verificar se a foto pertence a um serviço do cliente
    const fotoResult = await pool.query(
      `SELECT f.id, f.url
       FROM fotos_servico f
       INNER JOIN servicos s ON f.servico_id = s.id
       WHERE f.id = $1 AND s.cliente_id = $2`,
      [fotoId, clienteId]
    );

    if (!fotoResult.rows[0]) {
      throw new HttpError(404, "Foto não encontrada ou acesso não autorizado.");
    }

    const foto = fotoResult.rows[0];

    // Deletar arquivo local se existir
    if (foto.url.startsWith("/uploads/")) {
      const filename = foto.url.replace("/uploads/", "");
      const filepath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Deletar do banco
    await pool.query("DELETE FROM fotos_servico WHERE id = $1", [fotoId]);

    res.json({ message: "Foto removida com sucesso." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFotoServico,
  getFotosByServico,
  deleteFoto,
};
