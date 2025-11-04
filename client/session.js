// client/session.js
const emailEl = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout');

async function ensureSession() {
    try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 401) {
            // se estiver numa página protegida (index) envia para login
            if (location.pathname === '/' || location.pathname === '/index.html') {
                location.href = '/login.html';
            }
            return null;
        }
        const me = await res.json();
        if (emailEl) emailEl.textContent = me.email;
        return me;
    } catch (e) {
        console.error('Falha ao obter sessão:', e);
        return null;
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            // mesmo que falhe, força redirect para limpar UI
            if (!res.ok && res.status !== 204) {
                console.warn('Logout não retornou 204:', res.status);
            }
        } catch (e) {
            console.warn('Erro no logout:', e);
        } finally {
            location.href = '/login.html';
        }
    });
}

ensureSession();
