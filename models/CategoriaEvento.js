import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CategoriaEventoSchema = new Schema(
    {
        nome: {
            type: String,
            required: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        descricao: {
            type: String
        },
        icone: {
            type: String
        },
        cor: {
            type: String
        },
        criado_em: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'categorias_evento'
    }
);

export default model('CategoriaEvento', CategoriaEventoSchema);
