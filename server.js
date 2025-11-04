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

// Socket.IO
const io = new SocketIOServer(server, { cors: { origin: true, credentials: true } });
app.locals.io = io; // disponível nas rotas

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true })); // AJUSTAR ORIGENS EM PRODUÇÃO

// Rotas de Auth
app.use('/api/auth', authRouter);

// Rotas REST protegidas
app.use('/api/items', requireAuth, itemsRouter);

// Healthcheck básico
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Health do DB (ping + info)
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

// Frontend estático
app.use(express.static(path.join(__dirname, 'client')));

// Auth no Socket.IO: coloca o socket na sala do utilizador se houver cookie JWT
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
        return next(); // prossegue sem sessão
    }
});

// Socket events (globais, se necessário)
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id, 'userId:', socket.userId ?? 'anon');
    socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// Start (usa async/await corretamente)
async function start() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI em falta no .env');
        if (!DB_NAME) throw new Error('MONGODB_DB em falta no .env (ex.: ipvc_com)');

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            dbName: DB_NAME, // força a base de dados pretendida
        });

        const conn = mongoose.connection;

        // logs de runtime (sem expor password)
        const safeUri = String(MONGODB_URI)
            // mascara user:pass em URIs com credenciais
            .replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@/i, '$1$2:***@');

        const topo = conn.client?.topology?.description?.type ?? 'desconhecida';
        const servers = conn.client?.topology?.description?.servers
            ? Object.keys(conn.client.topology.description.servers)
            : [`${conn.host ?? 'desconhecido'}:${conn.port ?? '??'}`];

        console.log('MongoDB ligado');
        console.log('   URI:', safeUri);
        console.log('   Topologia:', topo);            // ex.: ReplicaSetWithPrimary
        console.log('   Servidores:', servers.join(', '));
        console.log('   Base de dados:', conn.name);   // deve ser o valor de MONGODB_DB

        await new Promise((resolve) => server.listen(PORT, resolve));
        console.log(`Servidor em http://localhost:${PORT}`);
    } catch (err) {
        console.error('Falha na inicialização:', err.message);
        process.exit(1);
    }
}

start();
