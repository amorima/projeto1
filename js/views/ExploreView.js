import { init, getAll } from "../models/FlightModel.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicialização do modelo de viagens
  init();
  const trips = getAll();
  // Carregamento dos aeroportos existentes para obter coordenadas
  const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];

  // Criação do mapa centrado na Europa
  const map = L.map("map").setView([54.526, 15.2551], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

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
      <button id="close-panel" class="absolute top-4 right-4 text-2xl">✕</button>
      <div class="p-4 mt-8">
        <img src="${trip.imagem}" alt="${trip.destino}" class="w-full h-auto rounded"/>
        <h2 class="mt-4 text-2xl font-bold">${trip.destino}</h2>
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

  // Criação dos marcadores para cada viagem
  trips.forEach((trip) => {
    // Encontrar coordenadas do destino pelo nome de cidade
    const aeroport = aeroportos.find(
      (a) => a.cidade.toLowerCase() === trip.destino.toLowerCase()
    );
    if (aeroport?.location) {
      const { latitude, longitude } = aeroport.location;
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.on("click", () => showPanel(trip));
    }
  });
});
