function maskCpf(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");
  if (digits.length !== 11) {
    return cpf;
  }
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

module.exports = { maskCpf, formatDate };
