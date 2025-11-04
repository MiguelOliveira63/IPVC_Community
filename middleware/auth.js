// middleware/auth.js
import jwt from 'jsonwebtoken';

/**
 * Cria um JWT com subject = userId.
 * Usa JWT_EXPIRES_IN (ex: "7d") ou 7 dias por defeito.
 */
export function signToken(userId, options = {}) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não definido no ambiente (.env)');
    }
    return jwt.sign(
        { sub: userId },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d', ...options }
    );
}

/**
 * Define o cookie httpOnly com o token.
 */
export function setAuthCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        // 7 dias (mantém o cookie alinhado com o default do token)
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
}

/**
 * Remove o cookie de sessão.
 */
export function clearAuthCookie(res) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
    });
}

/**
 * Extrai token do cookie ou do header Authorization: Bearer <token>.
 */
function tokenFromRequest(req) {
    const header = req.get('authorization') || req.get('Authorization');
    const bearer = header && header.startsWith('Bearer ')
        ? header.slice(7)
        : null;
    return req.cookies?.token || bearer || null;
}

/**
 * Middleware que exige sessão válida.
 * Define req.userId quando válido.
 */
export function requireAuth(req, res, next) {
    const token = tokenFromRequest(req);
    if (!token) return res.status(401).json({ error: 'Não autenticado' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub;
        req.token = token;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

/**
 * Middleware opcional: tenta autenticar mas não falha a request se não houver/for inválido.
 */
export function optionalAuth(req, _res, next) {
    const token = tokenFromRequest(req);
    if (!token) return next();

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub;
        req.token = token;
    } catch (_err) {
        // Ignora token inválido
    }
    return next();
}
