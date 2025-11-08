const emailEl = document.getElementById('user-email');   // se existir noutras páginas
const userNameEl = document.getElementById('user-name'); // NAVBAR
const logoutBtn = document.getElementById('logout');

function formatNameFromEmail(email) {
    if (!email) return 'Utilizador';
    const local = email.split('@')[0] || 'Utilizador';
    return local
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
}

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

        // mostra email
        if (emailEl && me.email) {
            emailEl.textContent = me.email;
        }

        // mostra nome na NAVBAR
        if (userNameEl) {
            if (me.name) {
                // se o backend já devolver "name"
                userNameEl.textContent = me.name;
            } else if (me.email) {
                // senão, gera nome bonito a partir do email
                userNameEl.textContent = formatNameFromEmail(me.email);
            } else {
                userNameEl.textContent = 'Utilizador';
            }
        }

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

// CTA dos eventos
document.querySelectorAll('.event-cta').forEach(btn => {
    btn.addEventListener('click', () => {
        window.location.href = '/item.html';
    });
});

ensureSession();