// Função para carregar HTML de um ficheiro para um elemento
const loadComponent = async (url, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with ID "${placeholderId}" not found.`);
        return;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log(`Component ${url} loaded into #${placeholderId}`);

    } catch (error) {
        console.error(`Error loading component ${url}:`, error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading component.</p>`;
    }
};

// Carregar os componentes quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('_header.html', 'header-placeholder');
    loadComponent('_footer.html', 'footer-placeholder');
    loadComponent('_menu.html', 'menu-placeholder');
});