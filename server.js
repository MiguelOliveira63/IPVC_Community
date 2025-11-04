// server.js (ESM)
import path from 'path';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';

import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

// __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB;
const PORT = process.env.PORT ?? 3000;

// Socket.IO: cria instância ligada ao servidor HTTP
// permite CORS com origem dinâmica (ajustar em produção)
const io = new SocketIOServer(server, { cors: { origin: true, credentials: true } });
app.locals.io = io; // disponibiliza o io nas rotas através de app.locals


// Middlewares globais
app.use(morgan('dev')); // registo de requests em modo de desenvolvimento
app.use(express.json()); // parse JSON do corpo das requests
app.use(cookieParser()); // popula req.cookies com cookies assinados/não assinados
app.use(cors({ origin: true, credentials: true })); // AJUSTAR ORIGENS EM PRODUÇÃO

// Rotas de autenticação (login, registo, refresh, etc.)
app.use('/api/auth', authRouter);

// Rotas REST protegidas: aplica requireAuth antes do router de items
app.use('/api/items', requireAuth, itemsRouter);

// Healthcheck básico para verificar que o servidor está vivo
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});


// Health do DB (ping + informação de estado da ligação)
// retorna estado da ligação Mongoose e resultado do ping admin()
app.get('/health/db', async (_req, res) => {
    const conn = mongoose.connection;
    const stateNames = ['desconectado', 'conectado', 'conectando', 'desconectando'];
    let ping = 'fail', error = null;
    try {
        await conn.db.admin().ping();
        ping = 'ok';
    } catch (e) { error = e.message; }
    res.json({
        state: stateNames[conn.readyState] ?? String(conn.readyState),
        db: conn.name,
        host: conn.host,
        port: conn.port,
        ping,
        error
    });
});

// Servir frontend estático a partir da pasta client
app.use(express.static(path.join(__dirname, 'client')));

// Autenticação no Socket.IO:
// verifica cookie JWT no handshake, extrai userId e coloca o socket na sala do utilizador
io.use((socket, next) => {
    try {
        const raw = socket.handshake.headers?.cookie || '';
        const { token } = cookie.parse(raw || '');
        if (!token) return next();
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.sub;
        socket.join(payload.sub); // sala privada do user
        return next();
    } catch {
        return next();
    }
});

// Eventos de Socket.IO: logging básico de conexões/desconexões
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id, 'userId:', socket.userId ?? 'anon');
    socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// Start
async function start() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI em falta no .env');
        if (!DB_NAME) throw new Error('MONGODB_DB em falta no .env (ex.: ipvc_com)');

        // conecta ao MongoDB com timeout de selecção de servidor
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            dbName: DB_NAME,
        });

        const conn = mongoose.connection;

        // logs de runtime
        const safeUri = String(MONGODB_URI)
            .replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@/i, '$1$2:***@');

        // tenta obter topologia e lista de servidores do cliente Mongo
        const topo = conn.client?.topology?.description?.type ?? 'desconhecida';
        const servers = conn.client?.topology?.description?.servers
            ? Object.keys(conn.client.topology.description.servers)
            : [`${conn.host ?? 'desconhecido'}:${conn.port ?? '??'}`];

        console.log('MongoDB ligado');
        console.log('   URI:', safeUri);
        console.log('   Topologia:', topo);
        console.log('   Servidores:', servers.join(', '));
        console.log('   Base de dados:', conn.name);

        // inicia o servidor HTTP
        await new Promise((resolve) => server.listen(PORT, resolve));
        console.log(`Servidor em http://localhost:${PORT}`);
    } catch (err) {
        console.error('Falha na inicialização:', err.message);
        process.exit(1);
    }
}

start();
