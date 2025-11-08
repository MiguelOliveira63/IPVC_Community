// models/Evento.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const EventoSchema = new Schema(
    {
        titulo: { type: String, required: true },
        descricao: { type: String },

        categoria_ids: [
            {
                type: Schema.Types.ObjectId,
                ref: 'CategoriaEvento',
                required: true,
            },
        ],

        inicio_em: { type: Date, required: true },
        fim_em: { type: Date, required: true },

        local_id: { type: Schema.Types.ObjectId, ref: 'Local' },
        organizador_id: { type: Schema.Types.ObjectId, ref: 'Organizador' },

        lotacao: { type: Number },
        preco: { type: Number, required: true },

        visibilidade: {
            type: String,
            enum: ['campus', 'publico', 'privado'],
            default: 'campus',
        },

        estado: {
            type: String,
            enum: ['pendente', 'aprovado', 'cancelado', 'recusado', 'rascunho'],
            default: 'pendente',
        },

        criado_por: { type: Schema.Types.ObjectId, ref: 'User' },

        capa_imagem_id: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        // opcional: URL direta da capa (enquanto não tens o sistema de imagens feito)
        capa_url: { type: String },

        criado_em: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'eventos',
    }
);

const Evento = mongoose.model('Evento', EventoSchema);
export default Evento;
