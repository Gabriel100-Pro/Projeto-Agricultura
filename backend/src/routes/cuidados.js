const express = require("express");

const { authMiddleware } = require("../middleware/auth");
const {
  getProximosCuidados,
  getProximoCuidadoById,
  createProximoCuidado,
  updateProximoCuidado,
  deleteProximoCuidado,
} = require("../controllers/cuidadoController");

const router = express.Router();

// GET /api/proximos-cuidados/me — Obter os próximos cuidados do cliente autenticado
router.get("/me", authMiddleware, getProximosCuidados);

// GET /api/proximos-cuidados/clientes/:clienteId — Obter próximos cuidados de um cliente
router.get("/clientes/:clienteId", authMiddleware, getProximosCuidados);

// GET /api/proximos-cuidados/:id — Obter um próximo cuidado específico
router.get("/:id", authMiddleware, getProximoCuidadoById);

// POST /api/proximos-cuidados/clientes/:clienteId — Criar próximo cuidado (Admin)
router.post("/clientes/:clienteId", authMiddleware, createProximoCuidado);

// PUT /api/proximos-cuidados/:id — Atualizar próximo cuidado (Admin)
router.put("/:id", authMiddleware, updateProximoCuidado);

// DELETE /api/proximos-cuidados/:id — Deletar próximo cuidado (Admin)
router.delete("/:id", authMiddleware, deleteProximoCuidado);

module.exports = router;
