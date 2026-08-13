require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const clientesRoutes = require("./routes/clientes");
const servicosRoutes = require("./routes/servicos");
const documentosRoutes = require("./routes/documentos");
const dashboardRoutes = require("./routes/dashboard");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { sanitizeInput } = require("./middleware/sanitize");
const { loginLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(sanitizeInput);

app.use("/api", healthRoutes);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/servicos", servicosRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
