/* Funcionalidade para multitrip com pills reordenáveis */

let multitripDestinations = [];
let availableDestinations = [];

/* Inicializar funcionalidade multitrip */
function initMultitrip() {
  loadAvailableDestinations();
  setupMultitripInput();
  setupDragAndDrop();
  setupTripTypeButtons();
}

/* Carregar destinos disponíveis do localStorage */
function loadAvailableDestinations() {
  const destinos = JSON.parse(localStorage.getItem("destinos") || "[]");
  availableDestinations = destinos.map((dest) => ({
    nome: dest.cidade,
    codigo: dest.codigo || dest.cidade.substring(0, 3).toUpperCase(),
  }));
}

/* Configurar input com autocomplete */
function setupMultitripInput() {
  const input = document.getElementById("multitrip-input");
  const suggestions = document.getElementById("multitrip-suggestions");

  if (!input || !suggestions) return;

  input.addEventListener("input", handleInputChange);
  input.addEventListener("keydown", handleInputKeydown);
  input.addEventListener("blur", () => {
    setTimeout(() => suggestions.classList.add("hidden"), 200);
  });
}

/* Gerir alterações no input */
function handleInputChange(e) {
  const value = e.target.value.trim();
  const suggestions = document.getElementById("multitrip-suggestions");

  if (value.length < 2) {
    suggestions.classList.add("hidden");
    return;
  }

  const matches = availableDestinations.filter(
    (dest) =>
      dest.nome.toLowerCase().includes(value.toLowerCase()) &&
      !multitripDestinations.some((selected) => selected.nome === dest.nome)
  );

  if (matches.length === 0) {
    suggestions.classList.add("hidden");
    return;
  }

  suggestions.innerHTML = matches
    .map(
      (dest) => `
    <div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer suggestion-item" data-name="${dest.nome}" data-codigo="${dest.codigo}">
      <span class="font-medium">${dest.codigo}</span> - ${dest.nome}
    </div>
  `
    )
    .join("");

  suggestions.classList.remove("hidden");

  /* Adicionar event listeners às sugestões */
  suggestions.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      addDestination(item.dataset.name, item.dataset.codigo);
      document.getElementById("multitrip-input").value = "";
      suggestions.classList.add("hidden");
    });
  });
}

/* Gerir teclas no input */
function handleInputKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const suggestions = document.getElementById("multitrip-suggestions");
    const firstSuggestion = suggestions.querySelector(".suggestion-item");
    if (firstSuggestion) {
      addDestination(
        firstSuggestion.dataset.name,
        firstSuggestion.dataset.codigo
      );
      e.target.value = "";
      suggestions.classList.add("hidden");
    }
  }
}

/* Adicionar destino à lista */
function addDestination(nome, codigo) {
  if (multitripDestinations.some((dest) => dest.nome === nome)) return;

  const newDestination = { nome, codigo };
  multitripDestinations.push(newDestination);
  renderPills();
  updateOriginDestination();
}

/* Remover destino da lista */
function removeDestination(index) {
  multitripDestinations.splice(index, 1);
  renderPills();
  updateOriginDestination();
}

/* Renderizar pills */
function renderPills() {
  const pillsContainer = document.getElementById("multitrip-pills");
  const placeholder = document.getElementById("multitrip-placeholder");

  if (!pillsContainer) return;

  if (multitripDestinations.length === 0) {
    placeholder.classList.remove("hidden");
    pillsContainer.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center" id="multitrip-placeholder">
        Adicione destinos para criar a sua rota...
      </div>
    `;
    return;
  }

  placeholder.classList.add("hidden");

  pillsContainer.innerHTML = multitripDestinations
    .map(
      (dest, index) => `
    <div 
      class="multitrip-pill flex items-center gap-2 px-3 py-1 bg-Main-Primary text-white rounded-full text-sm cursor-move transition-all hover:bg-Main-Dark" 
      draggable="true" 
      data-index="${index}"
    >
      <span class="pill-number font-bold">${index + 1}</span>
      <span>${dest.codigo} - ${dest.nome}</span>
      <button 
        class="pill-remove hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors" 
        onclick="removeDestination(${index})"
        type="button"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `
    )
    .join("");

  setupDragAndDrop();
}

/* Configurar drag and drop para reordenação */
function setupDragAndDrop() {
  const pills = document.querySelectorAll(".multitrip-pill");
  const container = document.getElementById("multitrip-pills");

  if (!container) return;

  pills.forEach((pill) => {
    pill.addEventListener("dragstart", handleDragStart);
    pill.addEventListener("dragover", handleDragOver);
    pill.addEventListener("drop", handleDrop);
    pill.addEventListener("dragend", handleDragEnd);
  });

  container.addEventListener("dragover", handleContainerDragOver);
  container.addEventListener("drop", handleContainerDrop);
}

let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add("opacity-50");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.target.closest(".multitrip-pill").dataset.index);

  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    const draggedItem = multitripDestinations.splice(draggedIndex, 1)[0];
    multitripDestinations.splice(dropIndex, 0, draggedItem);
    renderPills();
    updateOriginDestination();
  }
}

function handleContainerDragOver(e) {
  e.preventDefault();
}

function handleContainerDrop(e) {
  e.preventDefault();
}

function handleDragEnd(e) {
  e.target.classList.remove("opacity-50");
  draggedIndex = null;
}

/* Atualizar origem e destino baseado nos pills */
function updateOriginDestination() {
  if (multitripDestinations.length === 0) return;

  const origem = multitripDestinations[0];
  const destino = multitripDestinations[multitripDestinations.length - 1];

  /* Atualizar botões de origem e destino */
  const origemBtn = document.querySelector("#btn-open p");
  const destinoBtn = document.querySelector("#btn-destino p");

  if (origemBtn) {
    origemBtn.textContent = `${origem.codigo} - ${origem.nome}`;
  }

  if (destinoBtn && multitripDestinations.length > 1) {
    destinoBtn.textContent = `${destino.codigo} - ${destino.nome}`;
  }
}

/* Obter destinos para o modelo */
function getMultitripDestinations() {
  return multitripDestinations;
}

/* Definir destinos (para carregar dados salvos) */
function setMultitripDestinations(destinations) {
  multitripDestinations = destinations || [];
  renderPills();
  updateOriginDestination();
}

/* Limpar todos os destinos */
function clearMultitripDestinations() {
  multitripDestinations = [];
  renderPills();
}

/* Configurar event listeners para botões de tipo de viagem */
function setupTripTypeButtons() {
  const tripTypeButtons = document.querySelectorAll(".trip-type-option");
  const multitripContainer = document.getElementById("multitrip-container");

  tripTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tripType = button.dataset.type;

      /* Atualizar texto do botão */
      const tipoViagemText = document.getElementById("texto-tipo-viagem");
      if (tipoViagemText) {
        if (tripType === "so-ida") {
          tipoViagemText.textContent = "Só Ida";
        } else if (tripType === "ida-volta") {
          tipoViagemText.textContent = "Ida e Volta";
        } else if (tripType === "multitrip") {
          tipoViagemText.textContent = "Multitrip";
        }
      }

      /* Mostrar/esconder container multitrip */
      if (multitripContainer) {
        if (tripType === "multitrip") {
          multitripContainer.classList.remove("hidden");
        } else {
          multitripContainer.classList.add("hidden");
          clearMultitripDestinations();
        }
      }

      /* Fechar modal */
      const modal = document.getElementById("modal-tipo-viagem");
      if (modal) {
        modal.classList.add("hidden");
      }
    });
  });
}

/* Tornar funções disponíveis globalmente */
window.removeDestination = removeDestination;
window.initMultitrip = initMultitrip;
window.getMultitripDestinations = getMultitripDestinations;
window.setMultitripDestinations = setMultitripDestinations;
window.clearMultitripDestinations = clearMultitripDestinations;
window.setupTripTypeButtons = setupTripTypeButtons;
