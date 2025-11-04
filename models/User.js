import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['estudante', 'docente', 'moderador', 'administrador'];
const PASSWORD_ALGOS = ['bcrypt', 'argon2id']; // suportamos bcrypt por agora

const UserSchema = new Schema(
    {
        nome: { type: String, required: true, trim: true, maxlength: 120 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'email inválido'],
        },
        tipo: { type: String, enum: ROLES, default: 'estudante' },

        // campos exigidos pelo validator
        password_hash: { type: String, required: true, select: false },
        password_algo: { type: String, enum: PASSWORD_ALGOS, default: 'bcrypt', required: true, select: false },
        password_atualizada_em: { type: Date, required: true, select: false },
        ultimo_login_em: { type: Date, default: null },
        ativo: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) {
                delete ret.password_hash;
                delete ret.password_algo;
                delete ret.password_atualizada_em;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

UserSchema.index({ email: 1 }, { unique: true });

// Utils para definir password
UserSchema.methods.setPassword = async function (plain) {
    const hash = await bcrypt.hash(plain, 10);
    this.password_hash = hash;
    this.password_algo = 'bcrypt';
    this.password_atualizada_em = new Date();
};

// Comparação segura
UserSchema.methods.comparePassword = async function (candidate) {
    if (this.password_algo === 'bcrypt') {
        return bcrypt.compare(candidate, this.password_hash);
    }
    // futuro: argon2id
    return false;
};

// exporta o modelo para a tabela "users"
export default model('User', UserSchema);
