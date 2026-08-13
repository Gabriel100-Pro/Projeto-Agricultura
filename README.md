# Raiz Silvestre — Site + Portal do Cliente

Site institucional (front-end estático) da Raiz Silvestre com um Portal do Cliente
integrado (login por CPF, dashboard, histórico de serviços com fotos e PDF) e uma
API Node.js/Express separada.

## Estrutura final de pastas

```
Projeto Agricultura/
├── index.html                # Site institucional (não alterado em design)
├── registro.html              # Landing "Seu Registro" (entrada do portal)
├── 404.html                   # Página 404 personalizada
├── style.css                  # Estilos do site principal
├── script.js                  # Scripts do site principal
├── assets/                    # Imagens/vídeos do site
├── portal/                    # Portal do Cliente (front-end estático)
│   ├── login/index.html
│   ├── dashboard/index.html
│   ├── historico/index.html
│   ├── fotos/index.html
│   ├── visitas/index.html
│   ├── documentos/index.html
│   ├── meus-dados/index.html
│   └── assets/
│       ├── portal.css
│       └── portal.js
└── backend/                   # API Node.js/Express (deploy separado)
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── db.js
        ├── db/
        │   ├── schema.sql     # Schema completo (todas as tabelas)
        │   ├── seed.sql       # Dados de teste (cliente fictício)
        │   ├── clientes.sql
        │   ├── jardins.sql
        │   ├── servicos.sql
        │   └── fotos_servico.sql
        ├── middleware/
        │   ├── auth.js        # authMiddleware (valida JWT)
        │   ├── errorHandler.js
        │   ├── rateLimiter.js # rate limit no login
        │   └── sanitize.js    # sanitização de entrada
        ├── routes/
        │   ├── health.js
        │   ├── auth.js        # POST /api/auth/login
        │   ├── clientes.js    # GET /api/clientes/me
        │   ├── servicos.js    # GET /api/servicos, /:id/fotos
        │   └── documentos.js  # GET /api/documentos/historico-pdf
        └── utils/
            ├── cpf.js
            └── format.js
```

## Scripts npm (backend)

```bash
cd backend
npm install        # instala dependências
npm run dev        # desenvolvimento (node --watch, recarrega ao salvar)
npm start          # produção (node src/server.js)
```

O front-end não possui build: são arquivos estáticos (HTML/CSS/JS puro).

## Variáveis de ambiente (`backend/.env`)

Copie `backend/.env.example` para `backend/.env` e preencha:

| Variável        | Descrição                                                         |
| --------------- | ------------------------------------------------------------------ |
| `PORT`          | Porta da API (padrão `3001`).                                      |
| `DATABASE_URL`  | String de conexão PostgreSQL.                                       |
| `JWT_SECRET`    | Segredo para assinar os tokens JWT (7 dias de validade).            |
| `CORS_ORIGIN`   | URL do front-end publicado (ou `*` em desenvolvimento).             |
| `NODE_ENV`      | `development` ou `production` (ativa logs de acesso detalhados).    |

## Banco de dados

Execute, em um banco PostgreSQL vazio, nesta ordem:

```bash
psql "$DATABASE_URL" -f backend/src/db/schema.sql
psql "$DATABASE_URL" -f backend/src/db/seed.sql   # opcional: dados de teste
```

`schema.sql` cria `clientes`, `jardins`, `servicos` e `fotos_servico` com os
relacionamentos (`ON DELETE CASCADE`) entre elas.

### Cliente fictício de teste (via `seed.sql`)

- **Nome:** João da Silva
- **CPF de login:** `529.982.247-25`
- Jardim, 4 serviços (concluídos/andamento/agendado) e histórico já populados.

## Deploy do back-end (Render)

1. Suba o repositório no GitHub (a pasta `backend/` deve estar na raiz do repo
   ou configure "Root Directory" = `backend` no Render).
2. No Render, crie um **Web Service** apontando para o repositório.
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Crie um banco **PostgreSQL** no Render (ou use outro provedor) e copie a
   `Internal/External Database URL`.
4. Em "Environment", configure as variáveis: `DATABASE_URL`, `JWT_SECRET`,
   `CORS_ORIGIN` (URL do front-end publicado), `NODE_ENV=production`.
5. Rode `schema.sql` (e opcionalmente `seed.sql`) contra o banco criado, via
   `psql` local ou o console SQL do provedor.
6. Após o deploy, teste `GET https://<seu-servico>.onrender.com/api/health`.

## Deploy do front-end (Netlify ou Vercel)

1. Suba o repositório no GitHub.
2. **Netlify:** "Add new site" → "Import from Git" → selecione o repositório.
   - Build command: (vazio, é estático)
   - Publish directory: `.` (raiz do projeto, onde está `index.html`)
   - O arquivo `404.html` na raiz já é reconhecido automaticamente.
3. **Vercel:** "New Project" → importe o repositório → Framework Preset:
   "Other" → Output Directory: `.`.
4. Após publicar, atualize `API_BASE_URL` em `portal/assets/portal.js` para a
   URL pública da API no Render (ex.: `https://raiz-silvestre-api.onrender.com/api`).
5. Atualize `CORS_ORIGIN` no backend para a URL final do front-end publicado.

## Checklist final de funcionamento

- [ ] `GET /api/health` responde `{ "status": "ok" }`.
- [ ] Login em `/portal/login` com o CPF de teste redireciona ao dashboard.
- [ ] CPF inválido exibe erro amigável abaixo do campo (sem chamar a API).
- [ ] CPF válido, mas inexistente, retorna 404 com mensagem amigável (toast vermelho).
- [ ] Token expirado ou ausente redireciona automaticamente para `/registro.html`.
- [ ] Dashboard mostra saudação, cards de resumo, dados do cliente e histórico recente.
- [ ] Histórico exibe a linha do tempo verde com cards e fotos antes/depois (modal ao clicar).
- [ ] Botão "Baixar histórico em PDF" faz o download automático do arquivo.
- [ ] Menu mobile do portal abre/fecha corretamente (sidebar off-canvas).
- [ ] Botão "Sair" limpa o token e retorna à tela de login.
- [ ] Página 404 personalizada aparece em rotas inexistentes.
- [ ] Layout do site principal (`index.html`) permanece inalterado.
- [ ] Rate limit bloqueia após 10 tentativas de login em 15 minutos (`429`).
