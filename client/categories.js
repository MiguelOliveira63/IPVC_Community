async function carregarCategorias() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    // Botão "View all"
    const allBtn = document.createElement('button');
    allBtn.className = 'category-block active';
    allBtn.textContent = 'View all';
    allBtn.dataset.slug = 'all';
    container.appendChild(allBtn);

    try {
        const res = await fetch('/api/categorias', {
            credentials: 'include' // se a rota não for protegida, podes remover
        });

        if (!res.ok) {
            console.error('Falha ao carregar categorias:', res.status);
            return;
        }

        const categorias = await res.json();

        categorias.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-block';
            btn.textContent = cat.nome;
            btn.dataset.slug = cat.slug;
            container.appendChild(btn);
        });

    } catch (e) {
        console.error('Erro ao carregar categorias:', e);
    }
}

document.addEventListener('DOMContentLoaded', carregarCategorias);
