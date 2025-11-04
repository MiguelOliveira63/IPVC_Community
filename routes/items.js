import express from 'express';
import Event from '../models/Item.js';


const router = express.Router();


// Todas as rotas assumem req.userId preenchido pelo requireAuth


// Listar (apenas do utilizador)
router.get('/', async (req, res, next) => {
    try {
        const events = await Event.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(events);
    } catch (err) { next(err); }
});


// Criar
router.post('/', async (req, res, next) => {
    try {
        const { title } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: 'title é obrigatório' });


        const event = await Event.create({ title: title.trim(), user: req.userId });


// broadcast apenas para a sala do utilizador
        req.app.locals.io.to(req.userId).emit('events:created', event);


        res.status(201).json(event);
    } catch (err) { next(err); }
});


// Atualizar
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const update = {};
        if (typeof req.body.title === 'string') update.title = req.body.title.trim();
        if (typeof req.body.done === 'boolean') update.done = req.body.done;


        const event = await Event.findOneAndUpdate({ _id: id, user: req.userId }, update, { new: true });
        if (!event) return res.status(404).json({ error: 'Event não encontrado' });


        req.app.locals.io.to(req.userId).emit('events:updated', event);


        res.json(event);
    } catch (err) { next(err); }
});


// Remover
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await Event.findOneAndDelete({ _id: id, user: req.userId });
        if (!event) return res.status(404).json({ error: 'Event não encontrado' });


        req.app.locals.io.to(req.userId).emit('events:deleted', { _id: id });


        res.status(204).end();
    } catch (err) { next(err); }
});


// Handler de erro
router.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
});


export default router;