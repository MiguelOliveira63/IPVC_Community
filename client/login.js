const form = document.getElementById('login-form');
const errEl = document.getElementById('error');

async function checkSession() {
    try {
        const me = await fetch('/api/auth/me', { credentials: 'include' });
        if (me.ok) {
            // já está autenticado
            location.href = '/';
        }
    } catch {}
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) errEl.hidden = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            location.href = '/';
            return;
        }

        const data = await res.json().catch(() => ({}));
        const msg = data.error || 'Falha no login';
        if (errEl) {
            errEl.textContent = msg;
            errEl.hidden = false;
        } else {
            alert(msg);
        }
    } catch (err) {
        if (errEl) {
            errEl.textContent = 'Erro de rede. Tenta novamente.';
            errEl.hidden = false;
        } else {
            alert('Erro de rede. Tenta novamente.');
        }
    }
});

function togglePassword() {
    const input = document.getElementById('password');
    const btn = document.querySelector('.toggle-password');
    const icon = btn.querySelector('i');

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';

    // troca os ícones visivel e nao visivel
    icon.classList.toggle('fa-eye-slash', isHidden);
    icon.classList.toggle('fa-eye', !isHidden);

    // acessibilidade/UX
    btn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
    btn.setAttribute('title', isHidden ? 'Esconder palavra-passe' : 'Mostrar palavra-passe');
}


// se já tiver sessão válida, salta o login
checkSession();
