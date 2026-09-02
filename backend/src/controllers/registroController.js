const { getRegistroCompleto } = require("../services/registroService");

// GET /api/clientes/:clienteId/registro — Retorna registro completo do cliente
async function getRegistro(req, res, next) {
  try {
    const clienteId = Number(req.params.clienteId);
    const authClienteId = req.clienteId;

    // Verificar se o cliente autenticado é o mesmo
    if (clienteId !== authClienteId) {
      return res.status(403).json({ message: "Acesso não autorizado." });
    }

    const registro = await getRegistroCompleto(clienteId);
    res.json(registro);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRegistro,
};
