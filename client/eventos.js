const futurosContainer = document.getElementById('events-futuros');
const ipvcContainer = document.getElementById('events-ipvc');
const searchInput = document.getElementById('global-search');

const DEFAULT_EVENT_IMG =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=300&fit=crop';

// estado em memória
let allFuturos = [];
let allIpvc = [];
let activeCategorySlug = 'all';
let activeSearchTerm = '';

// formata data para dia + mês (pt)
function formatDateParts(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
        return { day: '--', month: '--' };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = d
        .toLocaleString('pt-PT', { month: 'short' })
        .replace('.', '');
    return { day, month };
}

function createEventCard(evento) {
    const { day, month } = formatDateParts(evento.inicio_em);
    const preco =
        typeof evento.preco === 'number'
            ? `€${evento.preco.toFixed(2)}`
            : 'Grátis';

    const categorias = Array.isArray(evento.categoria_ids)
        ? evento.categoria_ids
        : [];

    const categoriasHtml = categorias.length
        ? categorias.map(c => `<span class="event-category-pill">${c.nome}</span>`).join('')
        : '';

    const localTexto =
        evento.local_nome || evento.local || 'Local a definir';

    const imgSrc = evento.capa_url || DEFAULT_EVENT_IMG;

    const tituloCaps = (evento.titulo || '').toUpperCase();

    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.id = evento._id;

    card.innerHTML = `
    <div class="event-image">
        <img src="${imgSrc}" alt="${tituloCaps}">
        <div class="event-date">
            <span class="date-day">${day}</span>
            <span class="date-month">${month}</span>
        </div>
        <button class="event-like" aria-label="Favoritar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28
                         2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81
                         4.5 2.09C13.09 3.81 14.76 3 16.5 3
                         19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55
                         11.54L12 21.35z"/>
            </svg>
        </button>
    </div>
    <div class="event-content">
        <div class="event-header">
            <h3 class="event-title">${tituloCaps}</h3>   <!-- usa sempre CAPS -->
            <div class="event-categories">
                ${categoriasHtml}
            </div>
        </div>
        <div class="event-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75
                         7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5
                         s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill="currentColor"/>
            </svg>
            <span>${localTexto}</span>
        </div>
        <div class="event-footer">
            <div class="event-attendees">
                <div class="attendee-avatars">
                    <span class="avatar-sm"></span>
                    <span class="avatar-sm"></span>
                    <span class="avatar-sm"></span>
                    <span class="avatar-count">+0</span>
                </div>
            </div>
            <div class="event-price">
                <span class="price-value">${preco}</span>
                <span class="price-unit">/pessoa</span>
            </div>
        </div>
        <button class="event-cta" data-id="${evento._id}">Read more</button>
    </div>
  `;

    const cta = card.querySelector('.event-cta');
    if (cta) {
        cta.addEventListener('click', () => {
            window.location.href = `/item.html?id=${encodeURIComponent(evento._id)}`;
        });
    }

    return card;
}


function matchesCategory(ev, slug) {
    if (!slug || slug === 'all') return true;
    return Array.isArray(ev.categoria_ids) &&
        ev.categoria_ids.some(c => c.slug === slug);
}

function matchesSearch(ev, term) {
    if (!term) return true;
    const t = term.toLowerCase();

    const titulo = (ev.titulo || '').toLowerCase();
    const desc = (ev.descricao || '').toLowerCase();
    const local = (ev.local_nome || ev.local || '').toLowerCase();
    const categoriasNome = Array.isArray(ev.categoria_ids)
        ? ev.categoria_ids.map(c => c.nome || '').join(' ').toLowerCase()
        : '';

    const haystack = [titulo, desc, local, categoriasNome].join(' ');
    return haystack.includes(t);
}

function filterEvents(eventos) {
    return eventos.filter(ev =>
        matchesCategory(ev, activeCategorySlug) &&
        matchesSearch(ev, activeSearchTerm)
    );
}

function renderHomeEvents() {
    if (futurosContainer) {
        const futurosFiltrados = filterEvents(allFuturos);
        futurosContainer.innerHTML = '';

        if (!futurosFiltrados.length) {
            futurosContainer.innerHTML = '<div class="events-empty">Sem eventos</div>';
        } else {
            futurosFiltrados.forEach(ev => {
                futurosContainer.appendChild(createEventCard(ev));
            });
        }
    }

    if (ipvcContainer) {
        const ipvcFiltrados = filterEvents(allIpvc);
        ipvcContainer.innerHTML = '';

        if (!ipvcFiltrados.length) {
            ipvcContainer.innerHTML = '<div class="events-empty">Sem eventos</div>';
        } else {
            ipvcFiltrados.forEach(ev => {
                ipvcContainer.appendChild(createEventCard(ev));
            });
        }
    }
}




async function loadHomeEvents() {
    if (!futurosContainer && !ipvcContainer) return;

    try {
        const res = await fetch('/api/eventos');
        if (!res.ok) throw new Error('Falha ao carregar eventos: ' + res.status);

        const { futuros = [], ipvc = [] } = await res.json();

        allFuturos = futuros;
        allIpvc = ipvc;

        renderHomeEvents();
    } catch (err) {
        console.error(err);
    }
}


loadHomeEvents();

// pesquisa na barra de topo
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        activeSearchTerm = (e.target.value || '').trim().toLowerCase();
        renderHomeEvents();
    });
}

// clique nas categorias do slide
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-block');
    if (!btn) return;

    const slug = btn.dataset.slug || 'all';
    activeCategorySlug = slug;

    document.querySelectorAll('.category-block').forEach(b => {
        b.classList.toggle('active', b === btn);
    });

    renderHomeEvents();
});
