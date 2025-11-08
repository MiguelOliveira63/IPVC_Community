import express from 'express';
import Evento from '../models/Evento.js';

const router = express.Router();

// eventos para a homepage: futuros + IPVC (visibilidade campus) + Cidade (visibilidade público)
router.get('/', async (_req, res, next) => {
    try {
        const now = new Date();

        // Eventos futuros (qualquer visibilidade)
        const futuros = await Evento.find({
            inicio_em: { $gte: now },
            estado: 'aprovado',
        })
            .sort({ inicio_em: 1 })
            .limit(20)
            .populate('categoria_ids', 'nome slug');

        // Eventos IPVC = visibilidade 'campus'
        const ipvc = await Evento.find({
            inicio_em: { $gte: now },
            visibilidade: 'campus',
            estado: 'aprovado',
        })
            .sort({ inicio_em: 1 })
            .limit(20)
            .populate('categoria_ids', 'nome slug');

        res.json({ futuros, ipvc });
    } catch (err) {
        next(err);
    }
});


// handler de erro simples
router.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao obter eventos' });
});

export default router;
