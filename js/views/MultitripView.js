/* Funcionalidade para multitrip com pills reordenáveis */

let multitripDestinations = [];
let availableDestinations = [];

/* Inicializar funcionalidade multitrip */
function initMultitrip() {
  console.log("🚀 Inicializando sistema multitrip...");
  
  loadAvailableDestinations();
  console.log("📍 Destinos carregados:", availableDestinations.length);
  
  setupMultitripInput();
  setupDragAndDrop();
  setupTripTypeButtons();
  
  console.log("✅ Sistema multitrip inicializado");
}

/* Carregar destinos disponíveis do localStorage */
function loadAvailableDestinations() {
  const destinos = JSON.parse(localStorage.getItem("destinos") || "[]");
  const aeroportos = JSON.parse(localStorage.getItem("aeroportos") || "[]");
  
  availableDestinations = destinos.map((dest) => {
    /* Encontrar o aeroporto correspondente */
    const aeroporto = aeroportos.find(aero => aero.codigo === dest.aeroporto);
    return {
      nome: dest.cidade,
      codigo: aeroporto ? aeroporto.codigo : dest.aeroporto || dest.cidade.substring(0, 3).toUpperCase(),
    };
  });
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
  /* Verificar se já existe */
  if (multitripDestinations.some((dest) => dest.nome === nome)) {
    console.log("Destino já existe:", nome);
    return;
  }

  const newDestination = { nome, codigo };
  multitripDestinations.push(newDestination);
  console.log("Destino adicionado:", newDestination);
  console.log("Lista atual:", multitripDestinations);
  
  renderPills();
  updateOriginDestination();
}

/* Remover destino da lista */
function removeDestination(index) {
  if (index >= 0 && index < multitripDestinations.length) {
    const removedDestination = multitripDestinations.splice(index, 1)[0];
    console.log("Destino removido:", removedDestination);
    console.log("Lista atual:", multitripDestinations);
    
    renderPills();
    updateOriginDestination();
  }
}

/* Renderizar pills */
function renderPills() {
  const pillsContainer = document.getElementById("multitrip-pills");
  const placeholder = document.getElementById("multitrip-placeholder");

  if (!pillsContainer) {
    console.warn("Container de pills não encontrado!");
    return;
  }

  console.log("🔄 Renderizando pills:", multitripDestinations.length);

  if (multitripDestinations.length === 0) {
    if (placeholder) placeholder.classList.remove("hidden");
    pillsContainer.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-sm flex items-center" id="multitrip-placeholder">
        Adicione destinos para criar a sua rota...
      </div>
    `;
    return;
  }

  if (placeholder) placeholder.classList.add("hidden");

  pillsContainer.innerHTML = multitripDestinations
    .map(
      (dest, index) => `
    <div 
      class="multitrip-pill flex items-center gap-2 px-3 py-1 bg-Main-Primary dark:bg-Main-Primary text-white rounded-full text-sm cursor-move transition-all hover:bg-opacity-90 select-none" 
      draggable="true" 
      data-index="${index}"
      title="Arrastar para reordenar"
    >
      <span class="pill-number font-bold text-xs">${index + 1}</span>
      <span class="font-medium">${dest.codigo} - ${dest.nome}</span>
      <button 
        class="pill-remove hover:bg-white hover:bg-opacity-30 rounded-full w-5 h-5 flex items-center justify-center transition-colors ml-1 flex-shrink-0" 
        data-index="${index}"
        type="button"
        title="Remover destino"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `
    )
    .join("");

  /* Adicionar event listeners aos botões de remoção */
  pillsContainer.querySelectorAll(".pill-remove").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const index = parseInt(button.dataset.index);
      removeDestination(index);
    });
    
    /* Prevenir drag quando clica no botão de remoção */
    button.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  });

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
    pill.addEventListener("dragenter", handleDragEnter);
  });

  container.addEventListener("dragover", handleContainerDragOver);
  container.addEventListener("drop", handleContainerDrop);
}

let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add("opacity-50");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}

function handleDragEnter(e) {
  e.preventDefault();
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const targetPill = e.target.closest(".multitrip-pill");
  if (!targetPill) return;
  
  const dropIndex = parseInt(targetPill.dataset.index);

  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    const draggedItem = multitripDestinations.splice(draggedIndex, 1)[0];
    multitripDestinations.splice(dropIndex, 0, draggedItem);
    renderPills();
    updateOriginDestination();
  }
}

function handleContainerDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleContainerDrop(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDragEnd(e) {
  e.target.classList.remove("opacity-50");
  draggedIndex = null;
}

/* Atualizar origem e destino baseado nos pills */
function updateOriginDestination() {
  if (multitripDestinations.length === 0) {
    /* Resetar botões se não há destinos */
    const origemBtn = document.querySelector("#btn-open p");
    const destinoBtn = document.querySelector("#btn-destino p");
    
    if (origemBtn) {
      origemBtn.textContent = "Origem";
    }
    if (destinoBtn) {
      destinoBtn.textContent = "Destino";
    }
    return;
  }

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
  } else if (destinoBtn && multitripDestinations.length === 1) {
    /* Se só há um destino, mostrar "Destino" no botão de destino */
    destinoBtn.textContent = "Destino";
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

/* Função de teste para debugging */
function testMultitrip() {
  console.log("🧪 Testando sistema multitrip...");
  console.log("Destinos disponíveis:", availableDestinations);
  console.log("Destinos selecionados:", multitripDestinations);
  
  /* Testar adição de destino */
  if (availableDestinations.length > 0) {
    const testDest = availableDestinations[0];
    console.log("Adicionando destino de teste:", testDest);
    addDestination(testDest.nome, testDest.codigo);
  }
}

/* Tornar funções disponíveis globalmente */
window.removeDestination = removeDestination;
window.initMultitrip = initMultitrip;
window.getMultitripDestinations = getMultitripDestinations;
window.setMultitripDestinations = setMultitripDestinations;
window.clearMultitripDestinations = clearMultitripDestinations;
window.setupTripTypeButtons = setupTripTypeButtons;
window.testMultitrip = testMultitrip;
