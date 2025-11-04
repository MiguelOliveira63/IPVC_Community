// client/app.js (final)

// Elementos da UI
const listEl = document.getElementById('items');
const formEl = document.getElementById('create-form');
const titleEl = document.getElementById('title');

// --- Socket.IO (o cookie JWT é enviado automaticamente) ---
const socket = io();

socket.on('connect', () => console.log('WS conectado', socket.id));
socket.on('items:created', (item) => addOrReplace(item));
socket.on('items:updated', (item) => addOrReplace(item));
socket.on('items:deleted', ({ _id }) => removeItem(_id));

/*
// --- REST helpers (enviar sempre cookie de sessão) ---
async function fetchItems() {
    const res = await fetch('/api/items', { credentials: 'include' });
    if (res.status === 401) {
        // Sem sessão → manda para login
        location.href = '/login.html';
        return;
    }
    if (!res.ok) {
        alert('Erro ao carregar itens');
        return;
    }
    const data = await res.json();
    renderList(data);
}

async function createItem(title) {
    const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title })
    });
    if (!res.ok) {
        alert('Erro ao criar');
        return false;
    }
    // Se o Socket.IO não estiver ligado, atualiza por aqui
    try {
        const item = await res.json();
        addOrReplace(item);
    } catch (_) {}
    return true;
}

async function updateItem(id, update) {
    const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(update)
    });
    if (!res.ok) {
        alert('Erro ao atualizar');
        return false;
    }
    // Atualização de segurança se o evento em tempo real não chegar
    try {
        const item = await res.json();
        addOrReplace(item);
    } catch (_) {}
    return true;
}

async function deleteItem(id) {
    const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!res.ok && res.status !== 204) {
        alert('Erro ao remover');
        return false;
    }
    // Se não vier evento, remove localmente
    removeItem(id);
    return true;
}


// --- UI ---
function renderList(items) {
    listEl.innerHTML = '';
    items.forEach(addItemRow);
}

function addOrReplace(item) {
    const existing = document.querySelector(`[data-id="${item._id}"]`);
    if (existing) existing.remove();
    addItemRow(item, true);
}

function addItemRow(item, prepend = false) {
    const li = document.createElement('li');
    li.className = 'item' + (item.done ? ' done' : '');
    li.dataset.id = item._id;

    li.innerHTML = `
    <input type="checkbox" ${item.done ? 'checked' : ''} aria-label="Concluir" />
    <span class="title" contenteditable="true" spellcheck="false">${escapeHtml(item.title)}</span>
    <div class="actions">
      <button class="action save" title="Guardar alterações">Guardar</button>
      <button class="action danger delete" title="Apagar">Apagar</button>
    </div>
  `;

    // listeners
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async () => {
        // otimista: marca visualmente, mas reverte se falhar
        const prev = li.classList.contains('done');
        li.classList.toggle('done', checkbox.checked);
        const ok = await updateItem(item._id, { done: checkbox.checked });
        if (!ok) li.classList.toggle('done', prev);
    });

    const titleSpan = li.querySelector('.title');
    const saveBtn = li.querySelector('.save');
    saveBtn.addEventListener('click', async () => {
        const text = titleSpan.innerText.trim();
        if (!text) return;
        const ok = await updateItem(item._id, { title: text });
        if (!ok) titleSpan.focus();
    });

    // UX extra: Enter para guardar, Esc para desfocar
    titleSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveBtn.click();
        } else if (e.key === 'Escape') {
            titleSpan.blur();
        }
    });

    const delBtn = li.querySelector('.delete');
    delBtn.addEventListener('click', async () => {
        if (confirm('Apagar este item?')) {
            await deleteItem(item._id);
        }
    });

    if (prepend) listEl.prepend(li);
    else listEl.appendChild(li);
}

function removeItem(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
}

function escapeHtml(str) {
    return str.replace(/[&<>"]/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[c]));
}

// criar
formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleEl.value.trim();
    if (!title) return;
    const ok = await createItem(title);
    if (ok) {
        titleEl.value = '';
        titleEl.focus();
    }
});

// boot
fetchItems();
*/