const form = document.getElementById('register-form');
const errEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) errEl.hidden = true;

    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ nome, email, password })
        });

        if (res.ok) {
            location.href = '/';
        } else {
            const data = await res.json().catch(() => ({}));
            if (errEl) {
                errEl.textContent = data.error || 'Falha no registo';
                errEl.hidden = false;
            } else {
                alert(data.error || 'Falha no registo');
            }
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

    // troca os ícones do Font Awesome
    icon.classList.toggle('fa-eye-slash', isHidden);
    icon.classList.toggle('fa-eye', !isHidden);

    // (opcional) acessibilidade/UX
    btn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
    btn.setAttribute('title', isHidden ? 'Esconder palavra-passe' : 'Mostrar palavra-passe');
}
