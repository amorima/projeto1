import { init, getTripsWithCoordinates } from "../models/FlightModel.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicialização do modelo de viagens
  init();

  const enriched = getTripsWithCoordinates();

  // URLs para tile layers claro e escuro
  const lightTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTileUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Criação do mapa centrado na Europa e layer inicial conforme o tema
  const map = L.map("map").setView([47.526, 8.2551], 5);
  const baseLayer = L.tileLayer(
    document.documentElement.classList.contains("dark")
      ? darkTileUrl
      : lightTileUrl,
    { attribution: "&copy; OpenStreetMap contributors" }
  ).addTo(map);

  // Observa alterações na classe 'dark' para alternar o tile layer
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "class") {
        const isDark = document.documentElement.classList.contains("dark");
        baseLayer.setUrl(isDark ? darkTileUrl : lightTileUrl);
      }
    }
  }).observe(document.documentElement, { attributes: true });

  // Configuração do painel deslizante
  const panel = document.getElementById("slide-panel");
  Object.assign(panel.style, {
    position: "fixed",
    top: "6rem",
    left: "0",
    bottom: "0",
    width: "0",
    overflow: "auto",
    transition: "width 0.3s ease",
    boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
    zIndex: "1000",
  });
  // classes Tailwind para cores e tipografia
  panel.classList.add(
    "bg-white",
    "dark:bg-gray-800",
    "text-gray-900",
    "dark:text-gray-100",
    "font-sans"
  );

  /**
   * Preenche o painel com os dados da viagem e anima a sua aparição.
   */
  function showPanel(trip) {
    panel.innerHTML = `
      <div class="relative">
        <img src="${trip.imagem}" alt="${trip.destino}" class="w-full h-48 object-cover"/>
        <button id="close-panel" class="absolute top-2 right-2 text-2xl bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center">✕</button>
      </div>
      <div class="p-4">
        <h2 class="text-2xl font-bold">${trip.destino}</h2>
        <p class="mt-2">Ida: ${trip.partida}</p>
        <p>Volta: ${trip.dataVolta}</p>
        <div id="rating" class="flex gap-1 mt-2"></div>
      </div>
    `;
    // Geração de estrelas de avaliação (0 a 5)
    const ratingDiv = panel.querySelector("#rating");
    const stars = trip.avaliacao || 0;
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("span");
      star.className = "material-symbols-outlined text-yellow-400";
      star.textContent = i < stars ? "star" : "star_border";
      ratingDiv.appendChild(star);
    }
    // Fechar painel ao clicar no botão
    panel.querySelector("#close-panel").onclick = () => {
      panel.style.width = "0";
    };
    // Animação de abertura
    panel.style.width = "25%";
  }

  // Criação dos marcadores para cada viagem com coords
  enriched.forEach(({ trip, coords }) => {
    const { latitude, longitude } = coords;
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.on("click", () => showPanel(trip));
  });
});
