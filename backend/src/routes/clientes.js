const express = require("express");

const { authMiddleware } = require("../middleware/auth");
const { getClienteDashboardData } = require("../utils/dashboardData");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const data = await getClienteDashboardData(req.clienteId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
