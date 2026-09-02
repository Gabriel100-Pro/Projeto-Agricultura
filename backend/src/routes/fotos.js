const express = require("express");
const multer = require("multer");

const { authMiddleware } = require("../middleware/auth");
const { uploadFotoServico, getFotosByServico, deleteFoto } = require("../controllers/fotoController");

const router = express.Router();

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /api/fotos/servicos/:servicoId — Upload de foto para um serviço
router.post("/servicos/:servicoId", authMiddleware, upload.single("foto"), uploadFotoServico);

// GET /api/fotos/servicos/:servicoId — Obter fotos de um serviço
router.get("/servicos/:servicoId", authMiddleware, getFotosByServico);

// DELETE /api/fotos/:fotoId — Deletar uma foto
router.delete("/:fotoId", authMiddleware, deleteFoto);

module.exports = router;
