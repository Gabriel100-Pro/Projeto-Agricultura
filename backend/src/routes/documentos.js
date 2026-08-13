const express = require("express");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const { pool } = require("../db");
const { authMiddleware } = require("../middleware/auth");
const { HttpError } = require("../middleware/errorHandler");
const { maskCpf, formatDate } = require("../utils/format");

const router = express.Router();

const LOGO_PATH = path.join(
  __dirname,
  "../../../assets/ChatGPT Image 30 de jul. de 2026, 22_24_22.png"
);

router.get("/historico-pdf", authMiddleware, async (req, res, next) => {
  try {
    const clienteResult = await pool.query(
      "SELECT id, nome, cpf, telefone, endereco FROM clientes WHERE id = $1",
      [req.clienteId]
    );
    const cliente = clienteResult.rows[0];

    if (!cliente) {
      throw new HttpError(404, "Cliente não encontrado.");
    }

    const jardimResult = await pool.query(
      "SELECT area_m2, tipo, data_inicio FROM jardins WHERE cliente_id = $1 ORDER BY data_inicio ASC LIMIT 1",
      [cliente.id]
    );
    const jardim = jardimResult.rows[0];

    const servicosResult = await pool.query(
      "SELECT id, tipo, descricao, data_servico, responsavel, valor, status FROM servicos WHERE cliente_id = $1 ORDER BY data_servico DESC",
      [cliente.id]
    );
    const servicos = servicosResult.rows;

    const servicoIds = servicos.map((servico) => servico.id);
    const fotosResult = servicoIds.length
      ? await pool.query(
          "SELECT servico_id, tipo, url FROM fotos_servico WHERE servico_id = ANY($1::int[])",
          [servicoIds]
        )
      : { rows: [] };

    const fotosPorServico = fotosResult.rows.reduce((acc, foto) => {
      acc[foto.servico_id] = acc[foto.servico_id] || [];
      acc[foto.servico_id].push(foto);
      return acc;
    }, {});

    const filename = `historico-raiz-silvestre-${cliente.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, 50, 45, { width: 60 });
    }

    doc
      .fontSize(20)
      .fillColor("#1f3a2a")
      .text("Raiz Silvestre", 125, 50)
      .fontSize(10)
      .fillColor("#5f6f61")
      .text("Jardinagem • Paisagismo • Manutenção", 125, 74);

    doc.moveDown(3);
    doc
      .fontSize(16)
      .fillColor("#1f3a2a")
      .text("Histórico de Serviços do Cliente");
    doc.moveDown(0.6);

    doc.fontSize(11).fillColor("#243126");
    doc.text(`Cliente: ${cliente.nome}`);
    doc.text(`CPF: ${maskCpf(cliente.cpf)}`);
    if (cliente.telefone) doc.text(`Telefone: ${cliente.telefone}`);
    if (cliente.endereco) doc.text(`Endereço do cliente: ${cliente.endereco}`);
    if (jardim) {
      const detalheJardim = [jardim.tipo, jardim.area_m2 ? `${jardim.area_m2} m²` : null]
        .filter(Boolean)
        .join(" — ");
      if (detalheJardim) doc.text(`Endereço/área do jardim: ${detalheJardim}`);
      if (jardim.data_inicio) doc.text(`Início do atendimento: ${formatDate(jardim.data_inicio)}`);
    }
    doc.text(`Data de emissão: ${formatDate(new Date())}`);
    doc.moveDown(1);

    doc.fontSize(14).fillColor("#1f3a2a").text("Visitas e Serviços");
    doc.moveDown(0.5);

    if (!servicos.length) {
      doc.fontSize(11).fillColor("#5f6f61").text("Nenhum serviço registrado até o momento.");
    }

    servicos.forEach((servico, index) => {
      if (doc.y > 660) {
        doc.addPage();
      }

      doc.fontSize(12).fillColor("#1f3a2a").text(`${index + 1}. ${servico.tipo}`);
      doc.fontSize(10).fillColor("#5f6f61");
      doc.text(`Data: ${formatDate(servico.data_servico)}    Status: ${servico.status}`);
      if (servico.responsavel) doc.text(`Responsável: ${servico.responsavel}`);
      if (servico.valor) doc.text(`Valor: R$ ${Number(servico.valor).toFixed(2)}`);
      if (servico.descricao) doc.text(`Descrição: ${servico.descricao}`);

      const fotos = fotosPorServico[servico.id] || [];
      fotos.forEach((foto) => {
        try {
          if (fs.existsSync(foto.url)) {
            if (doc.y > 600) {
              doc.addPage();
            }
            doc.moveDown(0.3);
            doc.image(foto.url, { width: 150 });
          }
        } catch (error) {
          // ignora foto que não pode ser carregada no PDF
        }
      });

      doc.moveDown(1);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
