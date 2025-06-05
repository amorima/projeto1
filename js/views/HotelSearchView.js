import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
} from "./ViewHelpers.js";

// --- Função principal ---
document.addEventListener("DOMContentLoaded", () => {
  showCookieBanner();
  renderHotelCards();
  setupFilters();
});

function getHotels() {
  return JSON.parse(localStorage.getItem("hoteis")) || [];
}

// Mapeamento simples de acessibilidade para ícones Material Symbols
const acessibilidadeIcons = {
  "Elevadores Disponíveis": "elevator",
  "Acesso Sem Degraus": "stairs",
  "Acesso Sem Degraus (limitado)": "stairs",
  "Acesso Sem Degraus (variável)": "stairs",
  "Acesso Sem Degraus (desafiador)": "stairs",
  "Acesso Sem Degraus (com assistência)": "stairs",
  "Acesso Sem Degraus (parcial)": "stairs",
  "Acesso Sem Degraus (muito limitado)": "stairs",
  "Casas de Banho Adaptadas": "accessible",
  "Quartos Adaptados": "hotel_class",
  "Transporte Acessível": "directions_bus",
  "Transporte Acessível (Metro)": "subway",
  "Transporte Acessível (comboio)": "train",
  "Transporte Acessível (comboio/bus)": "train",
  "Transporte Acessível (DLR)": "tram",
  "Transporte Acessível (Orlyval/Bus)": "directions_bus",
  "Transporte Acessível (Bus)": "directions_bus",
  "Transporte Acessível (excelente)": "directions_bus",
  "Aluguer de Equipamento de Mobilidade": "wheelchair_pickup",
  "Aceita Cães-Guia/Assistência": "pets",
  "Ambiente Acolhedor LGBTQIA+": "diversity_3",
  "Spa Acessível": "spa",
  "Piscina Acessível": "pool",
  "Pátio Acessível": "yard",
  // fallback
  default: "accessibility_new",
};

function getAcessibilidadeIcon(label) {
  return acessibilidadeIcons[label] || acessibilidadeIcons["default"];
}

function renderHotelCards(filteredHotels = null) {
  const hotels = filteredHotels || getHotels();
  const container = document.querySelector(".card-hoteis");
  if (!container) return;
  container.innerHTML = "";

  hotels.forEach((hotel) => {
    const quarto = hotel.quartos && hotel.quartos[0];
    if (!quarto) return;

    const acessibilidadeArr = Array.isArray(quarto.acessibilidade)
      ? quarto.acessibilidade
      : quarto.acessibilidade
      ? [quarto.acessibilidade]
      : [];

    const imagem = quarto.foto || hotel.foto || "https://placehold.co/413x327";
    const preco = quarto.precoNoite ? quarto.precoNoite + " €" : "-";
    const nome = hotel.nome || hotel.titulo || "Hotel";
    const localizacao = hotel.cidade || "Localização";
    const numeroNoites = quarto.numeroNoites || 1;
    const capacidade = quarto.capacidade || 1;
    const id = quarto.id || hotel.id || 1;

    // Pills de acessibilidade (padding igual em toda a volta, alinhados à direita, pill ajusta à altura do conteúdo)
    let pillsHTML = "";
    if (acessibilidadeArr.length) {
      pillsHTML = `
        <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;z-index:2;">
          ${acessibilidadeArr
            .map(
              (a) => `
              <span class="flex items-center px-2 py-1 bg-Main-Primary text-white rounded-full text-xs font-semibold shadow break-words whitespace-normal"
                style="backdrop-filter: blur(2px); max-width: 100%; word-break: break-word;">
                <span class="material-symbols-outlined text-white text-base mr-1" style="font-size:16px;">
                  ${getAcessibilidadeIcon(a)}
                </span>
                ${a}
              </span>
            `
            )
            .join("")}
        </div>
      `;
    }

    container.innerHTML += `
      <div class="bg-white dark:bg-gray-800 w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div class="relative w-full h-80">
          <img class="w-full h-80 object-cover" src="${imagem}" alt="Imagem do hotel">
          ${pillsHTML}
        </div>
        <div class="flex flex-col flex-1 p-4 pb-0">
          <p class="text-Text-Body dark:text-gray-100 text-2xl font-bold font-['Space_Mono'] mb-2">${nome}</p>
          <div class="flex flex-row items-center mb-2 gap-6 flex-wrap">
            <div class="inline-flex items-center">
              <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300">location_on</span>
              <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans'] ml-2">${localizacao}</p>
            </div>
            <div class="inline-flex items-center">
              <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300 mr-2" style="margin-left:2px;margin-right:6px;">calendar_month</span>
              <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans']">${numeroNoites} noite${
      numeroNoites > 1 ? "s" : ""
    }</p>
            </div>
            <div class="inline-flex items-center">
              <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300 mr-2" style="margin-left:2px;margin-right:6px;">group</span>
              <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans']">${capacidade}</p>
            </div>
          </div>
          <div class="flex-1"></div>
          <div class="flex items-end justify-between mt-2 pb-4">
            <div>
              <p class="text-Button-Main dark:text-cyan-400 text-3xl font-bold font-['IBM_Plex_Sans']">${preco}</p>
              <p class="justify-start text-Text-Subtitles dark:text-gray-300 text-xs font-light font-['IBM_Plex_Sans'] leading-none">Preço por noite</p>
            </div>
            <a href="hotel.html?id=${id}" class="h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
          </div>
          <span 
            class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon"
            data-favorito="false" 
          >favorite</span>
        </div>
      </div>
    `;
  });

  // Ativar toggle de favorito
  container.querySelectorAll(".favorite-icon").forEach((icon) => {
    const initialIsFav = icon.getAttribute("data-favorito") === "true";
    icon.style.fontVariationSettings = initialIsFav ? "'FILL' 1" : "'FILL' 0";
    icon.addEventListener("click", function () {
      const currentIsFav = this.getAttribute("data-favorito") === "true";
      const newIsFav = !currentIsFav;
      this.setAttribute("data-favorito", String(newIsFav));
      this.style.fontVariationSettings = newIsFav ? "'FILL' 1" : "'FILL' 0";
      this.classList.add("scale-110");
      setTimeout(() => this.classList.remove("scale-110"), 150);
    });
  });
}

// --- Filtros e Ordenação ---
function setupFilters() {
  const sortDate = document.getElementById("sort-date");
  const sortPrice = document.getElementById("sort-price");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  const searchName = document.getElementById("search-name");
  const filterAcessibilidade = document.getElementById("filter-acessibilidade");
  const filterCapacidade = document.getElementById("filter-capacidade");
  const clearBtn = document.getElementById("clear-filters-btn");

  function applyFilters() {
    let hotels = getHotels();

    // Filtro por nome (hotel ou quarto)
    const nameValue = (searchName?.value || "").toLowerCase();
    if (nameValue) {
      hotels = hotels.filter((h) => {
        const nomeHotel = (h.nome || "").toLowerCase();
        const nomeQuarto =
          (h.quartos && h.quartos[0]?.tipo?.toLowerCase()) || "";
        return nomeHotel.includes(nameValue) || nomeQuarto.includes(nameValue);
      });
    }

    // Filtro por acessibilidade
    const acessValue = filterAcessibilidade?.value;
    if (acessValue) {
      hotels = hotels.filter((h) => {
        const quarto = h.quartos && h.quartos[0];
        if (!quarto) return false;
        const acc = quarto.acessibilidade || [];
        if (Array.isArray(acc)) {
          return acc.includes(acessValue);
        }
        return acc === acessValue;
      });
    }

    // Filtro por capacidade
    const capValue = filterCapacidade?.value;
    if (capValue) {
      hotels = hotels.filter((h) => {
        const quarto = h.quartos && h.quartos[0];
        return quarto && String(quarto.capacidade) === capValue;
      });
    }

    // Filtro por preço (usa precoNoite do primeiro quarto)
    const min = parseFloat(minPrice?.value) || 0;
    const max = parseFloat(maxPrice?.value) || Infinity;
    hotels = hotels.filter((h) => {
      const quarto = h.quartos && h.quartos[0];
      const preco = quarto ? parseFloat(quarto.precoNoite) || 0 : 0;
      return preco >= min && preco <= max;
    });

    // Ordenação por dataCheckin do primeiro quarto
    if (sortDate && sortDate.value === "recent") {
      hotels.sort(
        (a, b) =>
          new Date(b.quartos?.[0]?.dataCheckin || 0) -
          new Date(a.quartos?.[0]?.dataCheckin || 0)
      );
    } else if (sortDate && sortDate.value === "oldest") {
      hotels.sort(
        (a, b) =>
          new Date(a.quartos?.[0]?.dataCheckin || 0) -
          new Date(b.quartos?.[0]?.dataCheckin || 0)
      );
    }

    // Ordenação por precoNoite do primeiro quarto
    if (sortPrice && sortPrice.value === "price-asc") {
      hotels.sort(
        (a, b) =>
          (parseFloat(a.quartos?.[0]?.precoNoite) || 0) -
          (parseFloat(b.quartos?.[0]?.precoNoite) || 0)
      );
    } else if (sortPrice && sortPrice.value === "price-desc") {
      hotels.sort(
        (a, b) =>
          (parseFloat(b.quartos?.[0]?.precoNoite) || 0) -
          (parseFloat(a.quartos?.[0]?.precoNoite) || 0)
      );
    }

    renderHotelCards(hotels);
  }

  function clearFilters() {
    if (searchName) searchName.value = "";
    if (filterAcessibilidade) filterAcessibilidade.value = "";
    if (filterCapacidade) filterCapacidade.value = "";
    if (minPrice) minPrice.value = "";
    if (maxPrice) maxPrice.value = "";
    if (sortDate) sortDate.value = "";
    if (sortPrice) sortPrice.value = "";
    applyFilters();
  }

  if (clearBtn)
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearFilters();
    });
  if (sortDate) sortDate.addEventListener("change", applyFilters);
  if (sortPrice) sortPrice.addEventListener("change", applyFilters);
  if (minPrice) minPrice.addEventListener("input", applyFilters);
  if (maxPrice) maxPrice.addEventListener("input", applyFilters);
  if (searchName) searchName.addEventListener("input", applyFilters);
  if (filterAcessibilidade)
    filterAcessibilidade.addEventListener("change", applyFilters);
  if (filterCapacidade)
    filterCapacidade.addEventListener("change", applyFilters);

  // Inicializa com todos os hotéis
  applyFilters();
}
