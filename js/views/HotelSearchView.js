import {
  showCookieBanner,
  openModal,
  closeModal
} from "./ViewHelpers.js";
import HotelModel from "../models/HotelModel.js";

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

/**
 * Obtém o ícone de acessibilidade correspondente ao rótulo fornecido.
 * @param {string} label - Rótulo de acessibilidade.
 * @return {string} - Nome do ícone Material Symbols correspondente.
 * @description
 * Esta função retorna o nome do ícone Material Symbols associado ao rótulo de acessibilidade fornecido.
 * Se o rótulo não for encontrado no mapeamento, retorna um ícone padrão de acessibilidade.
 * @example
 * getAcessibilidadeIcon("Elevadores Disponíveis");
 * @see acessibilidadeIcons
 */
function getAcessibilidadeIcon(label) {
  return acessibilidadeIcons[label] || acessibilidadeIcons["default"];
}

/**
 * Renderiza os cartões de hotéis na página.
 * @param {Array} filteredHotels - Lista de hotéis filtrados. Se não for fornecida, renderiza todos os hotéis.
 * @returns {void}
 * @description
 * Esta função itera sobre a lista de hotéis e cria cartões para cada um, exibindo informações como nome, localização, preço, acessibilidade e imagem.
 * Inclui também a funcionalidade de favoritar/desfavoritar hotéis.
 * Os cartões são renderizados dentro de um contêiner com a classe `.card-hoteis`.
 * Se a lista de hotéis filtrados for fornecida, ela será usada; caso contrário, a função usará `HotelModel.getAll()` para obter todos os hotéis disponíveis. 
 * A função também adiciona ícones de acessibilidade como "pills" sobre a imagem do hotel, e implementa a funcionalidade de favoritar/desfavoritar os hotéis clicando no ícone de coração.
 * @example
 * renderHotelCards();
 * @see HotelModel.getAll
 * @see getAcessibilidadeIcon
 */
function renderHotelCards(filteredHotels = null) {
  // Usa HotelModel.getAll() se não houver filtro
  const hotels = filteredHotels || HotelModel.getAll();
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

/**
 * Configura os filtros de pesquisa de hotéis.
 * Inclui filtros por data, preço, nome, acessibilidade e capacidade.
 * Também implementa a funcionalidade de limpar filtros.
 * @returns {void}
 * @example
 * setupFilters();
 * @description
 * Esta função adiciona eventos aos elementos de filtro e aplica os filtros selecionados aos hotéis exibidos.
 * Os filtros incluem:
 * - Ordenação por data de check-in (mais recente ou mais antigo)
 * - Ordenação por preço (crescente ou decrescente)
 * - Filtro por preço mínimo e máximo
 * - Filtro por nome do hotel ou quarto
 * - Filtro por acessibilidade (como elevadores, acesso sem degraus, etc.)
 * - Filtro por capacidade do quarto
 * * A função também inclui um botão para limpar todos os filtros aplicados.
 * @see renderHotelCards
 */
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
    // Usa HotelModel.getAll() ao invés de getHotels()
    let hotels = HotelModel.getAll();

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

/* Inicializar a view de pesquisa de hotéis */
function initHotelSearchView() {
  HotelModel.init();
  setupModalButtons();
  renderInitialData();
}

/* Configurar eventos dos botões dos modais */
function setupModalButtons() {
  // Botão para abrir modal de destino
  const btnDestino = document.getElementById("btn-destino-hotel");
  if (btnDestino) {
    btnDestino.addEventListener("click", abrirModalDestino);
  }

  // Botão para abrir modal de datas  
  const btnDatas = document.getElementById("btn-datas-hotel");
  if (btnDatas) {
    btnDatas.addEventListener("click", abrirModalDatas);
  }

  // Botão para abrir modal de hóspedes
  const btnHospedes = document.getElementById("btn-hospedes-hotel");
  if (btnHospedes) {
    btnHospedes.addEventListener("click", abrirModalHospedes);
  }
  // Botão para abrir modal de acessibilidade
  const btnAcessibilidade = document.getElementById("btn-acessibilidade-hotel");
  if (btnAcessibilidade) {
    btnAcessibilidade.addEventListener("click", abrirModalAcessibilidade);
  }
  // Botão para limpar filtros
  const btnClearFilters = document.getElementById("clear-filters-btn");
  if (btnClearFilters) {
    btnClearFilters.addEventListener("click", clearSearchFilters);
  }

  // Formulário de pesquisa
  const form = document.getElementById("hotel-search-form");
  if (form) {
    form.addEventListener("submit", handleSearchSubmit);
  }
}

/* Renderizar dados iniciais */
function renderInitialData() {
  updateDestinationButton();
  updateDatesButton();
  updateGuestsButton();
  updateAccessibilityButton();
}

/* Modal de Destino */
function abrirModalDestino() {
  const modal = document.getElementById("modal-destino-hotel");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
      // Carregar lista de destinos
    const lista = document.getElementById("lista-destinos-hotel");
    if (lista) {
      const destinos = HotelModel.getDestinations();
      renderDestinationList(destinos, lista);
    }

    // Pesquisa de destinos
    const pesquisa = document.getElementById("pesquisa-destino-hotel");
    if (pesquisa) {
      pesquisa.addEventListener("input", (e) => {
        const filtered = HotelModel.filterDestinations(e.target.value);
        renderDestinationList(filtered, lista);
      });
    }

    // Botão fechar
    const fechar = document.getElementById("fechar-modal-destino-hotel");
    if (fechar) {
      fechar.addEventListener("click", fecharModalDestino);
    }
  }
}

function renderDestinationList(destinos, lista) {
  lista.innerHTML = "";
  destinos.forEach((destino) => {
    const li = document.createElement("li");
    li.className = "p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors";
    li.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400">flight_takeoff</span>
        <div class="flex flex-col">
          <span class="font-medium text-gray-900 dark:text-white">${destino.cidade}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">${destino.aeroporto} - ${destino.pais}</span>
        </div>
      </div>
    `;
    li.addEventListener("click", () => {
      HotelModel.setDestination(destino);
      updateDestinationButton();
      fecharModalDestino();
    });
    lista.appendChild(li);
  });
}

function updateDestinationButton() {
  const texto = document.getElementById("texto-destino-hotel");
  const destino = HotelModel.getSelectedDestination();
  if (texto) {
    texto.textContent = destino ? `${destino.cidade} (${destino.aeroporto})` : "Destino";
  }
}

function fecharModalDestino() {
  const modal = document.getElementById("modal-destino-hotel");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/* Modal de Datas */
function abrirModalDatas() {
  const modal = document.getElementById("modal-datas-hotel");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Botão confirmar
    const confirmar = document.getElementById("confirmar-datas-hotel");
    if (confirmar) {
      confirmar.addEventListener("click", () => {
        const checkin = document.getElementById("data-checkin").value;
        const checkout = document.getElementById("data-checkout").value;
          if (checkin && checkout) {
          HotelModel.setDates(checkin, checkout);
          updateDatesButton();
          fecharModalDatas();
        }
      });
    }

    // Botão fechar
    const fechar = document.getElementById("fechar-modal-datas-hotel");
    if (fechar) {
      fechar.addEventListener("click", fecharModalDatas);
    }
  }
}

function updateDatesButton() {
  const textoCheckin = document.getElementById("texto-checkin");
  const textoCheckout = document.getElementById("texto-checkout");
  const dates = HotelModel.getDatesText();
  
  if (textoCheckin) textoCheckin.textContent = dates.checkin;
  if (textoCheckout) textoCheckout.textContent = dates.checkout;
}

function fecharModalDatas() {
  const modal = document.getElementById("modal-datas-hotel");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/* Modal de Hóspedes */
function abrirModalHospedes() {
  const modal = document.getElementById("modal-hospedes-hotel");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    setupGuestCounters();

    // Botão confirmar
    const confirmar = document.getElementById("confirmar-hospedes-hotel");
    if (confirmar) {
      confirmar.addEventListener("click", () => {
        const adultos = parseInt(document.getElementById("contador-adultos-hotel").textContent);
        const criancas = parseInt(document.getElementById("contador-criancas-hotel").textContent);
        const quartos = parseInt(document.getElementById("contador-quartos-hotel").textContent);
          HotelModel.setGuests(adultos, criancas, quartos);
        updateGuestsButton();
        fecharModalHospedes();
      });
    }

    // Botão fechar
    const fechar = document.getElementById("fechar-modal-hospedes-hotel");
    if (fechar) {
      fechar.addEventListener("click", fecharModalHospedes);
    }
  }
}

function setupGuestCounters() {
  const guests = HotelModel.getGuests();
  
  // Contadores para adultos
  setupCounter("adultos-hotel", guests.adultos, 1, 10);
  
  // Contadores para crianças
  setupCounter("criancas-hotel", guests.criancas, 0, 5);
  
  // Contadores para quartos
  setupCounter("quartos-hotel", guests.quartos, 1, 5);
}

function setupCounter(type, initialValue, min, max) {
  const contador = document.getElementById(`contador-${type}`);
  const diminuir = document.getElementById(`diminuir-${type}`);
  const aumentar = document.getElementById(`aumentar-${type}`);
  
  if (contador && diminuir && aumentar) {
    contador.textContent = initialValue;
    
    diminuir.addEventListener("click", () => {
      const current = parseInt(contador.textContent);
      if (current > min) {
        contador.textContent = current - 1;
      }
    });
    
    aumentar.addEventListener("click", () => {
      const current = parseInt(contador.textContent);
      if (current < max) {
        contador.textContent = current + 1;
      }
    });
  }
}

function updateGuestsButton() {
  const texto = document.getElementById("texto-hospedes-hotel");
  if (texto) {
    texto.textContent = HotelModel.getGuestsText();
  }
}

function fecharModalHospedes() {
  const modal = document.getElementById("modal-hospedes-hotel");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/* Modal de Acessibilidade */
function abrirModalAcessibilidade() {
  const modal = document.getElementById("modal-acessibilidade-hotel");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
      // Carregar lista de acessibilidades
    const lista = document.getElementById("lista-acessibilidades-hotel");
    if (lista) {
      const acessibilidades = HotelModel.getAccessibilities();
      renderAccessibilityList(acessibilidades, lista);
    }

    // Pesquisa de acessibilidades
    const pesquisa = document.getElementById("pesquisa-acessibilidade-hotel");
    if (pesquisa) {
      pesquisa.addEventListener("input", (e) => {
        const filtered = HotelModel.filterAccessibilities(e.target.value);
        renderAccessibilityList(filtered, lista);
      });
    }

    // Botão confirmar
    const confirmar = document.getElementById("confirmar-acessibilidade-hotel");
    if (confirmar) {
      confirmar.addEventListener("click", () => {
        HotelModel.confirmAccessibilities();
        updateAccessibilityButton();
        fecharModalAcessibilidade();
      });
    }

    // Botão fechar
    const fechar = document.getElementById("fechar-modal-acessibilidade-hotel");
    if (fechar) {
      fechar.addEventListener("click", fecharModalAcessibilidade);
    }
  }
}

function renderAccessibilityList(acessibilidades, lista) {
  lista.innerHTML = "";
  const selectedAccessibilities = HotelModel.getSelectedAccessibilities();
  
  acessibilidades.forEach((acessibilidade, index) => {
    const li = document.createElement("li");
    const isSelected = selectedAccessibilities.includes(index);
    const icon = getAcessibilidadeIcon(acessibilidade);
    
    li.className = `p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''}`;
    li.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400">${icon}</span>
          <span class="text-gray-900 dark:text-white">${acessibilidade}</span>
        </div>
        <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400 ${isSelected ? '' : 'opacity-0'}">check</span>
      </div>
    `;
    li.addEventListener("click", () => {
      HotelModel.toggleAccessibility(index);
      renderAccessibilityList(acessibilidades, lista);
    });
    lista.appendChild(li);
  });
}

function updateAccessibilityButton() {
  const texto = document.getElementById("texto-acessibilidade-hotel");
  if (texto) {
    texto.textContent = HotelModel.getAccessibilitiesText();
  }
}

function fecharModalAcessibilidade() {
  const modal = document.getElementById("modal-acessibilidade-hotel");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/* Manipular submissão do formulário */
function handleSearchSubmit(e) {
  e.preventDefault();
  
  const searchData = HotelModel.getSearchData();
  console.log("Dados da pesquisa:", searchData);
  
  // Filtrar hotéis baseado nos critérios de pesquisa usando o modelo
  const filteredHotels = HotelModel.filterHotelsBySearchData(searchData);
  renderHotelCards(filteredHotels);
}

/* Limpar filtros de pesquisa e mostrar todos os hotéis */
function clearSearchFilters() {
  // Usar a função do modelo para limpar filtros
  HotelModel.clearSearchFilters();
  
  // Atualizar interface
  updateDestinationButton();
  updateDatesButton();
  updateGuestsButton();
  updateAccessibilityButton();
  
  // Mostrar todos os hotéis
  renderHotelCards();
}

// --- Função principal ---
document.addEventListener("DOMContentLoaded", () => {
  HotelModel.init(); // Inicializa o modelo
  showCookieBanner();
  renderHotelCards();
  setupFilters();
  initHotelSearchView();
});