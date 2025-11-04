// routes/auth.js
import express from 'express';
import User from '../models/User.js';
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const rawNome = (req.body.nome ?? req.body.name ?? '').trim();
        const { email, password } = req.body;

        if (!rawNome || !email || !password) {
            return res.status(400).json({ error: 'nome/name, email e password são obrigatórios' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ error: 'password deve ter pelo menos 6 caracteres' });
        }

        const normalized = String(email).toLowerCase().trim();
        const exists = await User.findOne({ email: normalized });
        if (exists) return res.status(409).json({ error: 'Email já registado' });

        // cria utilizador e define password conforme o schema real
        const user = new User({
            nome: rawNome,
            email: normalized,
            tipo: 'estudante',
            // valores placeholder para satisfazer requisitos antes do setPassword (serão sobrescritos)
            password_hash: 'x'.repeat(60),
            password_algo: 'bcrypt',
            password_atualizada_em: new Date(),
        });
        await user.setPassword(password);
        await user.save();

        const token = signToken(user._id.toString());
        setAuthCookie(res, token);

        return res.status(201).json({ id: user._id, email: user.email, nome: user.nome, tipo: user.tipo });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ error: 'Email já registado' });
        }
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios' });

        const normalized = String(email).toLowerCase().trim();

        // precisamos dos campos de password para comparar
        const user = await User.findOne({ email: normalized })
            .select('+password_hash +password_algo');
        if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

        const token = signToken(user._id.toString());
        setAuthCookie(res, token);

        // atualizar último login (não obrigatório pelo validator)
        user.ultimo_login_em = new Date();
        await user.save();

        return res.json({ id: user._id, email: user.email, nome: user.nome, tipo: user.tipo });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/logout
router.post('/logout', async (_req, res) => {
    clearAuthCookie(res);
    return res.status(204).end();
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
        return res.json({ id: user._id, email: user.email, nome: user.nome, tipo: user.tipo });
    } catch (err) {
        next(err);
    }
});

// Handler simples de erro
router.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
});

export default router;
