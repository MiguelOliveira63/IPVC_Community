import express from 'express';
import CategoriaEvento from '../models/CategoriaEvento.js';

const router = express.Router();

// Lista todas as categorias (público)
router.get('/', async (_req, res, next) => {
    try {
        const categorias = await CategoriaEvento.find().sort({ nome: 1 });
        res.json(categorias);
    } catch (err) {
        next(err);
    }
});

// Handler de erro simples
router.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
});

export default router;
