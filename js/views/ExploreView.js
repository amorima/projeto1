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
    background: "#ffffff",
    transition: "width 0.3s ease",
    boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
    zIndex: "1000",
  });

  /**
   * Preenche o painel com os dados da viagem e anima a sua aparição.
   * @param {Object} trip  – objeto viagem
   */
  function showPanel(trip) {
    panel.innerHTML = `
      <button id="close-panel" style="position:absolute; top:1rem; right:1rem;">✕</button>
      <div style="padding:1rem; margin-top:2rem;">
        <img src="${trip.imagem}" alt="${trip.destino}" style="width:100%; height:auto;"/>
        <h2>${trip.destino}</h2>
        <p>Ida: ${trip.partida}</p>
        <p>Volta: ${trip.dataVolta}</p>
        <div id="rating" style="display:flex; gap:0.25rem; margin-top:0.5rem;"></div>
      </div>
    `;
    // Geração de estrelas de avaliação (0 a 5)
    const ratingDiv = panel.querySelector("#rating");
    const stars = trip.avaliacao || 0;
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("span");
      star.className = "material-symbols-outlined";
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
