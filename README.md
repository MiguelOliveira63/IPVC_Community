# IPVC_Community

> Express + MongoDB + Socket.IO + HTML/CSS/JS (ESM)  
> Auth com JWT (cookie httpOnly) · REST + WebSockets · Pronto para Atlas ou Mongo local

---

## ✨ Funcionalidades

- API **RESTful** em **Express**
- **Autenticação** com JWT em **cookie httpOnly** (`/api/auth/*`)
- **CRUD** de itens por utilizador (com **Socket.IO** para atualização em tempo real)
- **MongoDB** (Atlas ou local) via **Mongoose**
- **ESM** (imports nativos) + middlewares (CORS, morgan, cookie-parser)
- **Páginas estáticas** (login/registo/home) em `client/`
- Endpoints de **health** (`/health` e `/health/db`)
- Logs de ligação ao cluster + **verificação de DB** em runtime

---

## 📁 Estrutura

```txt
.
├── server.js
├── package.json
├── .env
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Item.js
│   ├── CategoriaEvento.js
│   └── Evento.js
├── routes/
│   ├── auth.js
│   ├── items.js
│   ├── categories.js
│   └── eventos.js
├── client/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── styles.css
│   ├── app.js
│   ├── login.js
│   └── session.js
└── docker-compose.yml
```

---

## 🚀 Começar

### 1) Pré-requisitos
- Node.js
- npm
- MongoDB

### 2) Instalar dependências
```bash
npm install
```

### 3) Criar variáveis de ambiente (.env)
```env
MONGODB_URI="mongodb+srv://<password>:PASSWORD@<clustername>.abcd123.mongodb.net/?retryWrites=true&w=majority&appName=<ClusterName>"
MONGODB_DB="<db-name>"
PORT=3000
JWT_SECRET=<troque-esta-string-super-secreta>
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 🔐 Autenticação

- JWT assinado com **JWT_SECRET**, enviado num cookie httpOnly token
- Sessão consultada em **/api/auth/me**
- Rotas protegidas usam **requireAuth** (ver middleware/auth.js)

## 🔌 Socket.IO

- Cada sessão junta-se a uma sala privada por utilizador (ID do JWT)

- Eventos por item:
  - items: created, items:updated, items:deleted
  - O frontend (client/app.js) atualiza a UI em tempo real

## 🌐 Endpoints

### Health
- **GET /health → { status, time }**
- **GET /health/db → { state, db, host, port, ping }**

### Auth
- **POST /api/auth/register** → cria utilizador e define cookie token
    - body: **{ username, password }**
- **POST /api/auth/login** → valida credenciais e define cookie token
  - body: **{ email, password }**
- **GET /api/auth/me** → devolve dados do utilizador autenticado
- **POST /api/auth/logout** → limpa cookie

### Categorias (protegido)

- **GET /api/categorias** → lista todas as categorias, ordenadas por nome

### Eventos (protegido)

- **GET /api/eventos** → devolve eventos para homepage
    - Resposta: **{"futuros": [...], "ipvc": [...]}**