// Portal do Cliente — lógica de front-end (login por CPF + integração com /api).
const API_BASE_URL = "http://localhost:3001/api";

// ---------- Toasts de sucesso/erro ---------- 

function getToastContainer() {
  let container = document.getElementById("portalToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "portalToastContainer";
    container.className = "portal-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("role", "status");
    document.body.appendChild(container);
  }
  return container;
}

const TOAST_ICONS = {
  success:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8v5M12 16h.01M12 3 2 20h20L12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function showToast(message, type = "success") {
  const container = getToastContainer();
  const toast = document.createElement("div");
  toast.className = `portal-toast portal-toast-${type === "error" ? "error" : "success"}`;
  toast.innerHTML = `${TOAST_ICONS[type] || TOAST_ICONS.success}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("portal-toast-exit");
    setTimeout(() => toast.remove(), 220);
  }, 4200);
}

// ---------- Menu mobile do portal (sidebar off-canvas) ----------

const menuToggleBtn = document.getElementById("portalMenuToggle");
const portalSidebar = document.getElementById("portalSidebar");
const sidebarOverlay = document.getElementById("portalSidebarOverlay");

if (menuToggleBtn && portalSidebar && sidebarOverlay) {
  const closeSidebar = () => {
    portalSidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
    menuToggleBtn.setAttribute("aria-expanded", "false");
  };

  const toggleSidebar = () => {
    const isOpen = portalSidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("open", isOpen);
    menuToggleBtn.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggleBtn.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
  portalSidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });
}

// ---------- Sessão: leitura e validade do token JWT ----------

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return false;
  }
  return Date.now() >= payload.exp * 1000;
}

const pendingSessionMessage = sessionStorage.getItem("portalSessionMessage");
if (pendingSessionMessage) {
  sessionStorage.removeItem("portalSessionMessage");
  try {
    const { message, type } = JSON.parse(pendingSessionMessage);
    showToast(message, type);
  } catch (error) {
    showToast(pendingSessionMessage, "error");
  }
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCpf(rawCpf) {
  const cpf = rawCpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcDigit = (length) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
}

const loginForm = document.getElementById("portalLoginForm");

if (loginForm) {
  const cpfInput = document.getElementById("portalCpf");
  const cpfErrorEl = document.getElementById("portalCpfError");
  const cpfFieldEl = cpfInput.closest(".portal-field");
  const notFoundBox = document.getElementById("portalCpfNotFound");
  const notFoundText = document.getElementById("portalCpfNotFoundText");
  const messageEl = document.getElementById("portalLoginMessage");
  const submitButton = document.getElementById("portalLoginSubmit");
  const submitLabel = submitButton.querySelector(".portal-login-submit-label");
  const submitSpinner = submitButton.querySelector(".portal-login-spinner");

  const setFieldError = (message) => {
    cpfErrorEl.textContent = message || "";
    cpfFieldEl.classList.toggle("has-error", Boolean(message));
  };

  const setNotFound = (message) => {
    notFoundText.textContent = message || "";
    notFoundBox.hidden = !message;
  };

  const setLoading = (isLoading) => {
    submitButton.disabled = isLoading;
    submitSpinner.hidden = !isLoading;
    submitLabel.textContent = isLoading ? "Entrando..." : "Entrar";
  };

  const setMessage = (text, isError) => {
    messageEl.textContent = text || "";
    messageEl.classList.toggle("is-error", Boolean(isError));
  };

  cpfInput.addEventListener("input", () => {
    cpfInput.value = formatCpf(cpfInput.value);
    setFieldError("");
    setNotFound("");
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");
    setNotFound("");

    const cpf = cpfInput.value.replace(/\D/g, "");

    if (!isValidCpf(cpf)) {
      setFieldError("Digite um CPF válido.");
      return;
    }

    setFieldError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 404) {
        setNotFound(
          data.message ||
            "CPF não encontrado em nossa base de clientes. Verifique os dados ou entre em contato com a jardinagem."
        );
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Não foi possível entrar. Tente novamente.", true);
        showToast(data.message || "Não foi possível entrar. Tente novamente.", "error");
        return;
      }

      localStorage.setItem("portalToken", data.token);
      localStorage.setItem("portalCliente", JSON.stringify(data.cliente));
      showToast(`Bem-vindo(a), ${data.cliente?.nome || "cliente"}!`, "success");
      window.location.href = "../dashboard/index.html";
    } catch (error) {
      setMessage("Não foi possível conectar ao servidor. Tente novamente em instantes.", true);
      showToast("Não foi possível conectar ao servidor.", "error");
    } finally {
      setLoading(false);
    }
  });
}

// ---------- Páginas protegidas do portal (dashboard, histórico, fotos, visitas, documentos, meus dados) ----------

const portalPage = document.body.dataset.portalPage;

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABELS = {
  concluido: { label: "Concluído", className: "portal-status-concluido" },
  andamento: { label: "Em andamento", className: "portal-status-andamento" },
  agendado: { label: "Agendado", className: "portal-status-andamento" },
};

function renderStatusBadge(status) {
  const info = STATUS_LABELS[status] || { label: status, className: "portal-status-andamento" };
  return `<span class="portal-status ${info.className}">${info.label}</span>`;
}

function logout() {
  localStorage.removeItem("portalToken");
  localStorage.removeItem("portalCliente");
}

const logoutBtn = document.getElementById("portalLogoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
    sessionStorage.setItem(
      "portalSessionMessage",
      JSON.stringify({ message: "Você saiu do portal com segurança.", type: "success" })
    );
  });
}

if (portalPage) {
  const token = localStorage.getItem("portalToken");

  if (!token || isTokenExpired(token)) {
    logout();
    if (token) {
      sessionStorage.setItem(
        "portalSessionMessage",
        JSON.stringify({ message: "Sua sessão expirou. Faça login novamente.", type: "error" })
      );
    }
    window.location.href = "../../registro.html";
  } else {
    document.querySelectorAll(".portal-skeleton-target").forEach((el) => {
      el.classList.add("portal-skeleton");
    });

    const dataEndpoint =
      portalPage === "dashboard" ? `${API_BASE_URL}/dashboard/resumo` : `${API_BASE_URL}/clientes/me`;

    fetch(dataEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (response.status === 401) {
          logout();
          sessionStorage.setItem(
            "portalSessionMessage",
            JSON.stringify({ message: "Sua sessão expirou. Faça login novamente.", type: "error" })
          );
          window.location.href = "../../registro.html";
          return null;
        }
        if (!response.ok) {
          throw new Error("Falha ao carregar dados do cliente.");
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          return;
        }

        document.querySelectorAll(".portal-skeleton-target").forEach((el) => {
          el.classList.remove("portal-skeleton");
        });

        const greetingEl = document.getElementById("portalGreeting");
        if (greetingEl) {
          const primeiroNome = String(data.nome || "").split(" ")[0];
          greetingEl.textContent = primeiroNome || data.nome || "cliente";
        }

        const userNameEl = document.getElementById("portalUserName");
        if (userNameEl) {
          userNameEl.textContent = data.nome || "—";
        }

        const cardInicio = document.getElementById("portalCardInicio");
        if (cardInicio) {
          cardInicio.textContent = formatDate(data.resumoJardim?.inicioAtendimento);
        }

        const cardVisitas = document.getElementById("portalCardVisitas");
        if (cardVisitas) {
          cardVisitas.textContent = data.resumoJardim?.visitasRealizadas ?? "0";
        }

        const cardUltimaManutencao = document.getElementById("portalCardUltimaManutencao");
        if (cardUltimaManutencao) {
          cardUltimaManutencao.textContent = formatDate(data.resumoJardim?.ultimaManutencao);
        }

        const cardProximaVisita = document.getElementById("portalCardProximaVisita");
        if (cardProximaVisita) {
          cardProximaVisita.textContent = formatDate(data.resumoJardim?.proximaVisita);
        }

        const dadoNome = document.getElementById("portalDadoNome");
        if (dadoNome) {
          dadoNome.textContent = data.nome || "—";
        }

        const dadoCpf = document.getElementById("portalDadoCpf");
        if (dadoCpf) {
          dadoCpf.textContent = data.cpfMascarado || "—";
        }

        const dadoTelefone = document.getElementById("portalDadoTelefone");
        if (dadoTelefone) {
          dadoTelefone.textContent = data.telefone || "—";
        }

        const dadoEndereco = document.getElementById("portalDadoEndereco");
        if (dadoEndereco) {
          dadoEndereco.textContent = data.endereco || "—";
        }

        const historicoBody = document.getElementById("portalHistoricoRecenteBody");
        if (historicoBody) {
          const items = data.historicoRecente || [];
          historicoBody.innerHTML = items.length
            ? items
                .map(
                  (item) => `
              <tr>
                <td>${formatDate(item.data)}</td>
                <td>${item.servico}</td>
                <td>${item.descricao || "—"}</td>
                <td>${item.responsavel || "—"}</td>
                <td>${formatValor(item.valor) ? `R$ ${formatValor(item.valor)}` : "—"}</td>
              </tr>`
                )
                .join("")
            : `<tr><td colspan="5">Nenhum serviço encontrado.</td></tr>`;
        }
      })
      .catch(() => {
        const historicoBody = document.getElementById("portalHistoricoRecenteBody");
        if (historicoBody) {
          historicoBody.innerHTML = `<tr><td colspan="5">Não foi possível carregar o histórico.</td></tr>`;
        }
        showToast("Não foi possível carregar seus dados. Tente novamente.", "error");
      });

    const timelineEl = document.getElementById("portalTimeline");
    if (timelineEl) {
      loadTimeline(token, timelineEl);
    }
  }
}

// ---------- Linha do tempo de serviços (página Histórico) ----------

function formatValor(valor) {
  const numero = Number(valor);
  return Number.isNaN(numero) ? null : numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function renderServiceCard(servico) {
  const fotos = servico.fotos || [];
  const fotosHtml = fotos.length
    ? fotos
        .map(
          (foto) => `
        <button class="portal-photo-thumb" type="button" data-src="${foto.url}" data-label="${
            foto.tipo === "antes" ? "Antes" : "Depois"
          }">
          <img src="${foto.url}" alt="Foto ${foto.tipo} do serviço ${servico.tipo}" loading="lazy" />
          <span>${foto.tipo === "antes" ? "Antes" : "Depois"}</span>
        </button>`
        )
        .join("")
    : `<p class="portal-service-no-photos">Sem fotos registradas para este serviço.</p>`;

  const valorFormatado = formatValor(servico.valor);

  return `
    <div class="portal-timeline-item portal-fade-in">
      <span class="portal-timeline-dot"></span>
      <article class="portal-service-card">
        <div class="portal-service-card-head">
          <span class="portal-service-date">${formatDate(servico.data_servico)}</span>
          ${renderStatusBadge(servico.status)}
        </div>
        <h3>${servico.tipo}</h3>
        ${servico.descricao ? `<p class="portal-service-desc">${servico.descricao}</p>` : ""}
        <div class="portal-service-meta">
          ${servico.responsavel ? `<span><i class="fa-solid fa-user"></i> ${servico.responsavel}</span>` : ""}
          ${valorFormatado ? `<span><i class="fa-solid fa-sack-dollar"></i> R$ ${valorFormatado}</span>` : ""}
        </div>
        <div class="portal-service-photos">
          ${fotosHtml}
        </div>
      </article>
    </div>`;
}

function loadTimeline(token, timelineEl) {
  fetch(`${API_BASE_URL}/servicos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (response) => {
      if (response.status === 401) {
        logout();
        window.location.href = "../../registro.html";
        return null;
      }
      if (!response.ok) {
        throw new Error("Falha ao carregar histórico.");
      }
      return response.json();
    })
    .then((data) => {
      if (!data) {
        return;
      }
      const servicos = data.servicos || [];
      timelineEl.innerHTML = servicos.length
        ? servicos.map(renderServiceCard).join("")
        : `<p class="portal-timeline-loading">Nenhum serviço registrado até o momento.</p>`;
    })
    .catch(() => {
      timelineEl.innerHTML = `<p class="portal-timeline-loading">Não foi possível carregar o histórico.</p>`;
      showToast("Não foi possível carregar o histórico de serviços.", "error");
    });
}

// ---------- Modal de fotos (antes/depois) ----------

const photoModal = document.getElementById("portalPhotoModal");
if (photoModal) {
  const modalImg = document.getElementById("portalPhotoModalImg");
  const modalLabel = document.getElementById("portalPhotoModalLabel");
  const modalClose = document.getElementById("portalPhotoModalClose");
  const modalBackdrop = document.getElementById("portalPhotoModalBackdrop");

  const openModal = (src, label) => {
    modalImg.src = src;
    modalImg.alt = label;
    modalLabel.textContent = label;
    photoModal.hidden = false;
  };

  const closeModal = () => {
    photoModal.hidden = true;
    modalImg.src = "";
  };

  document.addEventListener("click", (event) => {
    const thumb = event.target.closest(".portal-photo-thumb");
    if (thumb) {
      openModal(thumb.dataset.src, thumb.dataset.label);
    }
  });

  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !photoModal.hidden) {
      closeModal();
    }
  });
}

// ---------- Download do histórico em PDF ----------

const pdfBtn = document.getElementById("portalPdfBtn");
if (pdfBtn) {
  const originalContent = pdfBtn.innerHTML;

  pdfBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("portalToken");
    if (!token) {
      window.location.href = "../../registro.html";
      return;
    }

    pdfBtn.disabled = true;
    pdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Gerando PDF...</span>';

    try {
      const response = await fetch(`${API_BASE_URL}/documentos/historico-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout();
        window.location.href = "../../registro.html";
        return;
      }

      if (!response.ok) {
        throw new Error("Falha ao gerar PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "historico-raiz-silvestre.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Histórico em PDF baixado com sucesso!", "success");
    } catch (error) {
      showToast("Não foi possível baixar o histórico em PDF. Tente novamente.", "error");
    } finally {
      pdfBtn.disabled = false;
      pdfBtn.innerHTML = originalContent;
    }
  });
}
