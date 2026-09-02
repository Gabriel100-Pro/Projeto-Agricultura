# 🚀 Quick Start - Raiz Silvestre Portal do Cliente

Guia rápido para colocar o sistema em funcionamento em 5 minutos.

## ⚡ Pré-requisitos

- **Node.js** v18+ ([Download](https://nodejs.org))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download))
- **curl** ou **Postman** para testar API (opcional)

## 📋 Setup Rápido

### 1️⃣ Preparar o Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE raiz_silvestre;

# Sair
\q
```

### 2️⃣ Executar Schema e Seed

```bash
# Executar schema (estrutura das tabelas)
psql -U postgres -d raiz_silvestre -f backend/src/db/schema.sql

# Executar seed (dados de teste)
psql -U postgres -d raiz_silvestre -f backend/src/db/seed.sql
```

### 3️⃣ Configurar Backend

```bash
# Entrar no diretório backend
cd backend

# Instalar dependências (primeira vez)
npm install

# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env e preencher:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/raiz_silvestre
# JWT_SECRET=seu_segredo_super_secreto_aleatorio_aqui
# CORS_ORIGIN=http://localhost:5500
# NODE_ENV=development
```

### 4️⃣ Iniciar Backend

```bash
# Desenvolvimento (auto-reload)
npm run dev

# Produção
npm start
```

✅ API rodando em: `http://localhost:3001`

### 5️⃣ Iniciar Frontend

```bash
# Em outro terminal, ir para raiz do projeto
cd ..

# Servir com Live Server do VS Code ou:
# python -m http.server 5500
# ou
# php -S localhost:5500
```

✅ Site rodando em: `http://localhost:5500`

---

## 🧪 Testar a API

### 1. Verificar Saúde da API

```bash
curl http://localhost:3001/api/health
```

**Resposta esperada:**
```json
{ "status": "ok" }
```

### 2. Fazer Login (CPF de Teste)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf": "52998224725"}'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cliente": {
    "id": 1,
    "nome": "João da Silva"
  }
}
```

### 3. Copiar o Token

Usar o valor de `token` nos próximos testes como `<token>`.

### 4. Obter Registro Completo

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/clientes/1/registro
```

**Verá:** Dados completos do cliente com serviços, fotos, cuidados, estatísticas.

### 5. Listar Serviços

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/servicos
```

### 6. Upload de Foto (Opcional)

```bash
curl -X POST http://localhost:3001/api/fotos/servicos/1 \
  -H "Authorization: Bearer <token>" \
  -F "foto=@/caminho/para/imagem.jpg" \
  -F "tipo=antes" \
  -F "descricao=Jardim antes da manutenção"
```

---

## 🎯 Acessar o Portal

### Via Navegador

1. Abra: `http://localhost:5500/registro.html`
2. Clique em "Entrar no Portal"
3. Digite o CPF de teste: **529.982.247-25**
4. Será redirecionado ao dashboard com os dados reais da API

### Dados de Teste

| Campo | Valor |
|-------|-------|
| CPF | 529.982.247-25 |
| Nome | João da Silva |
| Email | joao.silva@email.com |
| Telefone | (11) 91234-5678 |

---

## 🔍 Verificar Dados no Banco

```bash
# Conectar ao banco
psql -U postgres -d raiz_silvestre

# Ver clientes
SELECT * FROM clientes;

# Ver serviços
SELECT * FROM servicos;

# Ver próximos cuidados
SELECT * FROM proximos_cuidados;

# Sair
\q
```

---

## ⚙️ Troubleshooting

### ❌ "Database connection refused"

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Verificar DATABASE_URL em .env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/raiz_silvestre
```

### ❌ "Cannot find module"

**Solução:**
```bash
cd backend
npm install
```

### ❌ "CORS blocked"

**Solução:**
```bash
# Editar .env:
CORS_ORIGIN=http://localhost:5500
```

### ❌ Token inválido

**Solução:**
```bash
# Fazer login novamente
# Copiar novo token corretamente
# Verificar JWT_SECRET em .env
```

---

## 📚 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login via CPF |
| GET | `/api/clientes/:id/registro` | ⭐ Dados completos |
| GET | `/api/servicos` | Listar serviços |
| GET | `/api/clientes/me` | Dados do cliente autenticado |
| POST | `/api/fotos/servicos/:id` | Upload de foto |
| GET | `/api/proximos-cuidados/clientes/:id` | Próximos cuidados |
| GET | `/api/health` | Status da API |

---

## 📂 Estrutura Importante

```
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql        ← Estrutura do banco
│   │   │   └── seed.sql          ← Dados de teste
│   │   ├── controllers/          ← Lógica dos endpoints
│   │   ├── routes/               ← Definição das rotas
│   │   ├── middleware/           ← Autenticação, validação
│   │   └── server.js             ← Arquivo principal
│   ├── .env                      ← Variáveis de ambiente
│   ├── .env.example              ← Template de .env
│   ├── package.json              ← Dependências
│   └── README.md                 ← Documentação completa
├── portal/
│   ├── assets/
│   │   ├── portal.js             ← Scripts do portal
│   │   └── registro-api.js       ← Integração com API
│   ├── dashboard/
│   │   └── index.html            ← Dashboard do cliente
│   └── login/
│       └── index.html            ← Login
├── registro.html                 ← Página inicial do portal
└── IMPLEMENTACAO.md              ← Este arquivo
```

---

## 🎓 Próximos Passos

1. ✅ Testar endpoints com curl/Postman
2. ✅ Verificar dados no dashboard
3. ✅ Testar upload de fotos
4. ✅ Explorar páginas: Histórico, Fotos, Visitas, Meus Dados
5. ✅ Implementar admin dashboard (opcional)

---

## 💡 Dicas de Desenvolvimento

### Ver Logs da API

```bash
# Terminal com npm run dev mostra:
# - Requisições HTTP
# - Erros
# - Status das operações
```

### Testar com Postman

1. Importar coleção (criar com os endpoints)
2. Fazer login para pegar token
3. Usar token nos headers: `Authorization: Bearer <token>`

### Debugar Query SQL

```bash
# No psql, executar query manualmente
SELECT * FROM servicos WHERE cliente_id = 1;
```

### Limpar Dados de Teste

```bash
# Resetar banco (cuidado!)
psql -U postgres -d raiz_silvestre
DROP TABLE IF EXISTS proximos_cuidados CASCADE;
DROP TABLE IF EXISTS observacoes CASCADE;
DROP TABLE IF EXISTS fotos_servico CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS jardins CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
\q

# Executar schema e seed novamente
psql -U postgres -d raiz_silvestre -f backend/src/db/schema.sql
psql -U postgres -d raiz_silvestre -f backend/src/db/seed.sql
```

---

## 🚀 Deployment (Produção)

### Railway.app (Recomendado)

1. Fazer push para GitHub
2. Conectar repositório no Railway
3. Definir variáveis de ambiente
4. Deploy automático

### Variáveis Importantes

```env
NODE_ENV=production
JWT_SECRET=<segredo-aleatorio-forte>
DATABASE_URL=<url-do-banco-remoto>
CORS_ORIGIN=https://seu-dominio.com
```

---

## 📞 Suporte

- 📖 Ler [README.md](backend/README.md) para documentação completa
- 🐛 Verificar logs no terminal
- 🔍 Debugar com Network tab no navegador (F12)
- 💾 Fazer backup do banco antes de alterações

---

## ✅ Checklist de Setup

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `raiz_silvestre` criado
- [ ] schema.sql executado
- [ ] seed.sql executado
- [ ] .env configurado com DATABASE_URL
- [ ] JWT_SECRET definido em .env
- [ ] CORS_ORIGIN configurado em .env
- [ ] npm install executado
- [ ] Backend rodando em npm run dev
- [ ] Frontend acessível em localhost:5500
- [ ] Login funciona com CPF de teste
- [ ] Dashboard carrega dados da API

---

**Pronto para começar?** Execute os 5 passos acima e você terá o sistema rodando! 🎉

**Tempo estimado:** 5-10 minutos

---

*Última atualização: 31/08/2026*
