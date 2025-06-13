import { loadComponent } from "./ViewHelpers.js";
import * as UserModel from "../models/UserModel.js";
import { getLevelSymbol } from "./RewarditView.js";
import * as FlightModel from "../models/FlightModel.js";

/* Função global para abrir o modal de gamificação */
window.openGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  const modalContent = document.getElementById("modal-content");

  if (!modal || !modalContent) return;

  /* Prevenir scroll da página */
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = "15px";

  /* Mostrar modal */
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  /* Animar entrada */
  requestAnimationFrame(() => {
    modalContent.classList.remove("scale-95", "opacity-0");
    modalContent.classList.add("scale-100", "opacity-100");
  });
};

/* Carregar componentes na página */
window.onload = function () {
  /* Inicializar o modelo */
  UserModel.init();
  FlightModel.init();

  /* Carregar componentes de header e footer */
  loadComponent("../_header.html", "header-placeholder");
  loadComponent("../_footer.html", "footer-placeholder");

  /* Carregar informações do utilizador */
  loadUserInfo();
  /* Adicionar eventos aos botões */
  setupEventListeners();

  /* Inicializar modal de gamificação */
  initGamificationModal();

  /* Inicializar funcionalidades das abas a partir do Model */
  UserModel.initTabEvents();
};

/* Configurar listeners de eventos para interações do utilizador */
function setupEventListeners() {
  /* Botão de edição de perfil */
  const editProfileBtn = document.querySelector("button.mt-4");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", openEditProfileModal);
  }

  /* Botão para movimentos de pontos */
  const btnMovimentos = document.getElementById("btn-movimentos");
  const modalPontos = document.getElementById("pontos-modal");
  const closeModalBtn = document.getElementById("close-pontos-modal");

  if (btnMovimentos && modalPontos && closeModalBtn) {
    btnMovimentos.addEventListener("click", function () {
      modalPontos.classList.remove("hidden");
    });

    closeModalBtn.addEventListener("click", function () {
      modalPontos.classList.add("hidden");
    });

    window.addEventListener("click", function (e) {
      if (e.target === modalPontos) {
        modalPontos.classList.add("hidden");
      }
    });
  }

  /* Botão de copiar link de convite */
  const btnCopy = document.querySelector("button.bg-Button-Main.rounded-r-lg");
  if (btnCopy) {
    btnCopy.addEventListener("click", function () {
      const linkInput = document.querySelector("input[readonly]");
      if (linkInput) {
        linkInput.select();
        document.execCommand("copy");

        /* Feedback visual */
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML =
          '<span class="material-symbols-outlined text-sm">check</span>';
        setTimeout(() => {
          btnCopy.innerHTML = originalText;
        }, 2000);
      }
    });
  }

  /* Botões de exclusão de reservas */
  const deleteButtons = document.querySelectorAll("#reservas-container button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const reservaCard = this.closest(".bg-white.dark\\:bg-gray-900");
      if (reservaCard) {
        /* Animação de fade-out antes de remover */
        reservaCard.style.transition = "opacity 0.3s ease";
        reservaCard.style.opacity = "0";

        setTimeout(() => {
          reservaCard.remove();

          /* Verificar se ainda existem reservas */
          const reservasContainer =
            document.getElementById("reservas-container");
          if (reservasContainer && reservasContainer.children.length <= 1) {
            document
              .getElementById("reservas-empty")
              .classList.remove("hidden");
          }
        }, 300);
      }
    });
  });
}

/* Carregar informações do utilizador */
function loadUserInfo() {
  /* Obter dados do utilizador "António Amorim" da localStorage */
  const users = JSON.parse(localStorage.getItem("user"));
  const user = users.find((u) => u.username === "António Amorim");

  if (!user) {
    alert("Utilizador não encontrado!");
    return;
  }

  /* Preencher informações básicas */
  document.getElementById("user-name").textContent = user.username;

  /* Determinar nível baseado nos pontos */
  const userPoints = parseInt(user.pontos) || 0;
  const userLevel = getUserLevel(userPoints);
  document.getElementById("user-level").textContent = userLevel;

  /* Atualizar o ícone do nível */
  const levelIcon = getLevelSymbol(userLevel);
  document.querySelector(
    ".absolute.bottom-0.right-0 .material-symbols-outlined"
  ).textContent = levelIcon;
  /* Atualizar avatar se disponível */
  if (user.avatar) {
    document.getElementById("user-avatar").src = `..${user.avatar}`;
  }

  /* Preencher informações pessoais */
  document.getElementById("info-username").textContent = user.username;
  document.getElementById("info-email").textContent = user.email;
  document.getElementById("info-points").textContent = userPoints;
  document.getElementById("info-member-since").textContent = formatDate(
    new Date()
  );

  /* Atualizar barra de progresso */
  updateProgressBar(userPoints);

  /* Carregar histórico de viagens */
  loadTravelHistory(user);

  /* Carregar preferências de viagem */
  loadTravelPreferences(user);
}

/* Obter nível do utilizador baseado nos pontos */
function getUserLevel(points) {
  if (points >= 5000) {
    return "Embaixador";
  } else if (points >= 3000) {
    return "Globetrotter";
  } else if (points >= 1500) {
    return "Aventureiro";
  } else if (points >= 250) {
    return "Viajante";
  } else {
    return "Explorador";
  }
}

/* Atualizar barra de progresso */
function updateProgressBar(points) {
  /* Definir pontos para cada nível */
  const levelPoints = {
    Explorador: 0,
    Viajante: 250,
    Aventureiro: 1500,
    Globetrotter: 3000,
    Embaixador: 5000,
  };

  /* Determinar nível atual e próximo nível */
  const currentLevel = getUserLevel(points);
  let nextLevel;
  let pointsNeeded;
  /* Calcular pontos necessários para o próximo nível */
  switch (currentLevel) {
    case "Explorador":
      nextLevel = "Viajante";
      pointsNeeded = levelPoints.Viajante - points;
      break;
    case "Viajante":
      nextLevel = "Aventureiro";
      pointsNeeded = levelPoints.Aventureiro - points;
      break;
    case "Aventureiro":
      nextLevel = "Globetrotter";
      pointsNeeded = levelPoints.Globetrotter - points;
      break;
    case "Globetrotter":
      nextLevel = "Embaixador";
      pointsNeeded = levelPoints.Embaixador - points;
      break;
    default:
      nextLevel = "Máximo";
      pointsNeeded = 0;
  }
  /* Atualizar texto com pontos necessários */
  const pointsInfoElement = document.querySelector(
    ".text-white.dark\\:text-gray-300.text-left.text-base"
  );
  if (currentLevel === "Embaixador") {
    pointsInfoElement.innerHTML =
      "Parabéns! Alcançaste o nível máximo: <span class='font-bold'>Embaixador</span>!";
  } else {
    document.getElementById("points-needed").textContent = pointsNeeded;
    document.getElementById("next-level").textContent = nextLevel;
  }

  /* Calcular percentagem de progresso para o próximo nível */
  let progressPercentage;

  if (currentLevel === "Embaixador") {
    progressPercentage = 100;
  } else {
    const currentLevelPoints = levelPoints[currentLevel];
    const nextLevelPoints = levelPoints[nextLevel];
    const totalPointsForLevel = nextLevelPoints - currentLevelPoints;
    const userProgressInLevel = points - currentLevelPoints;

    progressPercentage = (userProgressInLevel / totalPointsForLevel) * 100;
  } /* Atualizar barra de progresso */
  document.getElementById(
    "progress-bar"
  ).style.width = `${progressPercentage}%`;

  /* Atualizar ícones de nível na barra de progresso */
  updateLevelIcons(currentLevel);
}

/* Atualizar os ícones dos níveis na barra de progresso */
function updateLevelIcons(currentLevel) {
  const levels = [
    "Explorador",
    "Viajante",
    "Aventureiro",
    "Globetrotter",
    "Embaixador",
  ];
  const levelMarkers = document.querySelectorAll(
    ".absolute.top-\\[6\\.5px\\].left-0.right-0.flex.justify-between.items-center .relative"
  );

  if (levelMarkers.length === levels.length) {
    levels.forEach((level, index) => {
      const marker = levelMarkers[index];
      const iconContainer = marker.querySelector("div:first-child");
      const icon = marker.querySelector(
        "div:first-child span.material-symbols-outlined"
      );
      const checkmark = marker.querySelector(".completed-check");

      icon.textContent = getLevelSymbol(level);

      if (levels.indexOf(currentLevel) > index) {
        // Níveis já alcançados
        iconContainer.className =
          "w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-green-600 dark:border-green-500 z-10";
        icon.className =
          "material-symbols-outlined text-green-600 dark:text-green-500 text-sm";
        checkmark.style.display = "flex";
      } else if (levels.indexOf(currentLevel) === index) {
        // Nível atual
        iconContainer.className =
          "w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-Main-Primary dark:border-Main-Primary z-10 animate-pulse";
        icon.className =
          "material-symbols-outlined text-Main-Primary dark:text-Main-Primary text-sm";
        checkmark.style.display = "none";
      } else {
        // Níveis futuros
        iconContainer.className =
          "w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-600 z-10";
        icon.className =
          "material-symbols-outlined text-gray-300 dark:text-gray-500 text-sm";
        checkmark.style.display = "none";
      }
    });
  }
}

/* Carregar histórico de viagens */
function loadTravelHistory(user) {
  const travelHistoryContainer = document.getElementById("travel-history");
  travelHistoryContainer.innerHTML = "";

  /* Verificar se o utilizador tem histórico de viagens */
  if (!user.travelHistory || user.travelHistory.length === 0) {
    /* Mostrar botão para criar viagem de demonstração */
    const demoButton = document.createElement("button");
    demoButton.className =
      "bg-Main-Primary hover:bg-Main-Secondary dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white font-medium rounded-md transition duration-300 py-2 px-4 mb-4";
    demoButton.textContent = "Adicionar Viagem de Demonstração";
    demoButton.addEventListener("click", addDemoTrip);

    travelHistoryContainer.appendChild(demoButton);

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "text-Text-Subtitles dark:text-gray-400";
    emptyMessage.textContent = "Nenhuma viagem registada.";

    travelHistoryContainer.appendChild(emptyMessage);
    return;
  }

  /* Adicionar cada viagem ao histórico */
  user.travelHistory.forEach((trip) => {
    const tripElement = document.createElement("div");
    tripElement.className =
      "bg-Main-Card-Bg-Gami dark:bg-gray-700 rounded-lg p-4 shadow-sm";
    tripElement.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h3 class="text-Text-Titles dark:text-gray-200 font-semibold">${
            trip.destination
          }</h3>
          <p class="text-Text-Subtitles dark:text-gray-400 text-sm">${formatDate(
            trip.date
          )}</p>
        </div>
        <div class="bg-Main-Primary dark:bg-cyan-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
          +${trip.points} pontos
        </div>
      </div>
    `;

    travelHistoryContainer.appendChild(tripElement);
  });
}

/* Adicionar viagem de demonstração */
function addDemoTrip() {
  /* Obter utilizador atual da localStorage */
  const users = JSON.parse(localStorage.getItem("user"));
  const userIndex = users.findIndex((u) => u.username === "António Amorim");

  if (userIndex === -1) {
    alert("Utilizador não encontrado!");
    return;
  }

  const currentUser = users[userIndex];

  /* Destinos possíveis */
  const destinations = [
    "Lisboa, Portugal",
    "Porto, Portugal",
    "Madrid, Espanha",
    "Barcelona, Espanha",
    "Paris, França",
    "Roma, Itália",
    "Londres, Reino Unido",
    "Amesterdão, Países Baixos",
  ];

  /* Criar viagem de demonstração */
  const newTrip = {
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    date: new Date().toISOString(),
    points: Math.floor(Math.random() * 200) + 100, // Entre 100 e 300 pontos
  };

  /* Adicionar à lista de viagens do utilizador */
  if (!currentUser.travelHistory) {
    currentUser.travelHistory = [];
  }

  currentUser.travelHistory.push(newTrip);

  /* Adicionar pontos */
  currentUser.pontos = parseInt(currentUser.pontos || 0) + newTrip.points;

  try {
    /* Atualizar utilizador na localStorage */
    users[userIndex] = currentUser;
    localStorage.setItem("user", JSON.stringify(users));

    /* Recarregar informações */
    loadUserInfo();

    /* Mostrar mensagem de sucesso */
    alert(
      `Viagem para ${newTrip.destination} adicionada com sucesso! Ganhou +${newTrip.points} pontos.`
    );
  } catch (error) {
    alert(`Erro ao adicionar viagem: ${error.message}`);
  }
}

/* Carregar preferências de viagem */
function loadTravelPreferences(user) {
  const preferencesContainer = document.getElementById("travel-preferences");
  preferencesContainer.innerHTML = "";

  /* Verificar se o utilizador tem preferências de viagem */
  if (!user.preferences || Object.keys(user.preferences).length === 0) {
    /* Mostrar botão para adicionar preferências */
    const demoButton = document.createElement("button");
    demoButton.className =
      "bg-Main-Primary hover:bg-Main-Secondary dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white font-medium rounded-md transition duration-300 py-2 px-4 mb-4";
    demoButton.textContent = "Adicionar Preferências de Demonstração";
    demoButton.addEventListener("click", addDemoPreferences);

    preferencesContainer.appendChild(demoButton);

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "text-Text-Subtitles dark:text-gray-400";
    emptyMessage.textContent = "Nenhuma preferência definida.";

    preferencesContainer.appendChild(emptyMessage);
    return;
  }

  /* Mapear as preferências para nomes mais amigáveis */
  const preferenceLabels = {
    transport: "Meio de Transporte Preferido",
    accommodation: "Tipo de Alojamento",
    tourismType: "Tipo de Turismo",
    activities: "Atividades",
    destinations: "Destinos Favoritos",
  };

  /* Adicionar cada preferência */
  for (const [key, value] of Object.entries(user.preferences)) {
    if (value) {
      const prefElement = document.createElement("div");
      prefElement.className =
        "bg-Main-Card-Bg-Gami dark:bg-gray-700 rounded-lg p-4 shadow-sm";
      prefElement.innerHTML = `
        <h3 class="text-Text-Subtitles dark:text-gray-400 text-sm font-medium">${
          preferenceLabels[key] || key
        }</h3>
        <p class="text-Text-Body dark:text-gray-200 font-medium">${
          Array.isArray(value) ? value.join(", ") : value
        }</p>
      `;

      preferencesContainer.appendChild(prefElement);
    }
  }
}

/* Adicionar preferências de demonstração */
function addDemoPreferences() {
  /* Obter utilizador atual da localStorage */
  const users = JSON.parse(localStorage.getItem("user"));
  const userIndex = users.findIndex((u) => u.username === "António Amorim");

  if (userIndex === -1) {
    alert("Utilizador não encontrado!");
    return;
  }

  const currentUser = users[userIndex];

  /* Criar preferências de demonstração */
  const demoPreferences = {
    transport: ["Avião", "Comboio"],
    accommodation: "Hotel",
    tourismType: "Cultural",
    activities: ["Museus", "Gastronomia", "Praia"],
    destinations: ["Portugal", "Espanha", "Itália"],
  };

  /* Adicionar preferências ao utilizador */
  currentUser.preferences = demoPreferences;

  try {
    /* Atualizar utilizador na localStorage */
    users[userIndex] = currentUser;
    localStorage.setItem("user", JSON.stringify(users));

    /* Recarregar informações */
    loadUserInfo();

    /* Mostrar mensagem de sucesso */
    alert("Preferências de viagem adicionadas com sucesso!");
  } catch (error) {
    alert(`Erro ao adicionar preferências: ${error.message}`);
  }
}

/* Formatar data para exibição */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* Abrir modal para edição de perfil */
function openEditProfileModal() {
  /* Criar estrutura do modal */
  const modalOverlay = document.createElement("div");
  modalOverlay.className =
    "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";
  modalOverlay.id = "edit-profile-modal";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto";

  /* Obter dados do utilizador atual da localStorage */
  const users = JSON.parse(localStorage.getItem("user"));
  const user = users.find((u) => u.username === "António Amorim");
  modalContent.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold font-['Space_Mono'] text-Text-Titles dark:text-gray-100">Editar Perfil</h2>
      <button id="close-modal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    
    <form id="edit-profile-form" class="space-y-4">
      <div>
        <label for="edit-username" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">Nome de Utilizador</label>
        <input type="text" id="edit-username" value="${
          user.username
        }" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      
      <div>
        <label for="edit-email" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">Email</label>
        <input type="email" id="edit-email" value="${
          user.email
        }" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      
      <div>
        <label for="edit-password" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">Nova Senha (deixe em branco para manter)</label>
        <input type="password" id="edit-password" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      
      <div>
        <label for="edit-avatar" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">URL do Avatar</label>
        <input type="text" id="edit-avatar" value="${
          user.avatar || ""
        }" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      
      <div class="flex items-center mt-4">
        <input type="checkbox" id="edit-private" ${
          user.private ? "checked" : ""
        } class="h-4 w-4 text-Main-Primary dark:text-cyan-600 border-gray-300 rounded">
        <label for="edit-private" class="ml-2 block text-Text-Subtitles dark:text-gray-400 text-sm font-medium">Perfil Privado</label>
      </div>
      
      <div class="flex justify-end gap-4 mt-6">
        <button type="button" id="cancel-edit" class="py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-medium rounded-md transition duration-300">
          Cancelar
        </button>
        <button type="submit" class="py-2 px-4 bg-Main-Primary hover:bg-Main-Secondary dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white font-medium rounded-md transition duration-300">
          Guardar Alterações
        </button>
      </div>
    </form>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  /* Adicionar eventos aos botões do modal */
  document
    .getElementById("close-modal")
    .addEventListener("click", closeEditProfileModal);
  document
    .getElementById("cancel-edit")
    .addEventListener("click", closeEditProfileModal);
  document
    .getElementById("edit-profile-form")
    .addEventListener("submit", saveProfileChanges);
}

/* Fechar o modal de edição de perfil */
function closeEditProfileModal() {
  const modal = document.getElementById("edit-profile-modal");
  if (modal) {
    modal.remove();
  }
}

/* Guardar alterações do perfil */
function saveProfileChanges(event) {
  event.preventDefault();

  /* Obter dados do formulário */
  const username = document.getElementById("edit-username").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  const password = document.getElementById("edit-password").value;
  const avatar = document.getElementById("edit-avatar").value.trim();
  const isPrivate = document.getElementById("edit-private").checked;

  /* Validar dados */
  if (!username || !email) {
    alert("Nome de utilizador e email são obrigatórios.");
    return;
  }

  /* Obter utilizador atual da localStorage */
  const users = JSON.parse(localStorage.getItem("user"));
  const userIndex = users.findIndex((u) => u.username === "António Amorim");

  if (userIndex === -1) {
    alert("Utilizador não encontrado!");
    return;
  }

  const currentUser = users[userIndex];

  /* Criar objeto com novos dados */
  const updatedUser = {
    ...currentUser,
    username: username,
    email: email,
    avatar: avatar,
    private: isPrivate,
  };

  /* Atualizar senha apenas se foi fornecida */
  if (password) {
    updatedUser.password = password;
  }

  try {
    /* Atualizar utilizador na localStorage */
    users[userIndex] = updatedUser;
    localStorage.setItem("user", JSON.stringify(users));

    /* Fechar modal e recarregar informações */
    closeEditProfileModal();
    loadUserInfo();

    /* Mostrar mensagem de sucesso */
    alert("Perfil atualizado com sucesso!");
  } catch (error) {
    alert(`Erro ao atualizar perfil: ${error.message}`);
  }
}

/* Inicializar o sistema de abas */
/* A lógica de controle das abas foi movida para o Model (UserModel.js) */
/* Quando uma função precisar chamar funções do Model, deve usar as funções exportadas */

/* As funções de carregamento de conteúdo para as abas foram movidas para o Model (UserModel.js) */

/* Funções do modal de gamificação */
function initGamificationModal() {
  /* Configurar eventos do modal primeiro */
  setupGamificationModalEvents();

  /* Configurar funcionalidade de redeem de código */
  setupCodeRedeemEvents();

  /* Usar event delegation para o botão "Saber mais" */
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "btn-saber-mais-codigo") {
      e.preventDefault();
      e.stopPropagation();
      showGamificationModal();
    }
  });
}

function showGamificationModal() {
  const modal = document.getElementById("modal-gamificacao");
  const modalContent = document.getElementById("modal-content");

  if (!modal || !modalContent) return;

  /* Prevenir scroll da página */
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = "15px";

  /* Mostrar modal */
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  /* Animar entrada */
  requestAnimationFrame(() => {
    modalContent.classList.remove("scale-95", "opacity-0");
    modalContent.classList.add("scale-100", "opacity-100");
  });
}

function hideGamificationModal() {
  const modal = document.getElementById("modal-gamificacao");
  const modalContent = document.getElementById("modal-content");

  if (!modal || !modalContent) return;

  /* Animar saída */
  modalContent.classList.remove("scale-100", "opacity-100");
  modalContent.classList.add("scale-95", "opacity-0");
  /* Esconder modal após animação */
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.style.display = "none";
    /* Restaurar scroll da página */
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, 300);
}

function setupGamificationModalEvents() {
  const btnLembrarMaisTarde = document.getElementById("btn-lembrar-mais-tarde");
  const btnIgnorar = document.getElementById("btn-ignorar");
  const btnFechar = document.getElementById("fechar-modal-gamificacao");

  if (btnLembrarMaisTarde) {
    btnLembrarMaisTarde.addEventListener("click", () => {
      sessionStorage.setItem("gamificationModalDeferred", "true");
      hideGamificationModal();
    });
  }

  if (btnIgnorar) {
    btnIgnorar.addEventListener("click", () => {
      localStorage.setItem("gamificationModalIgnored", "true");
      hideGamificationModal();
    });
  }

  if (btnFechar) {
    btnFechar.addEventListener("click", () => {
      hideGamificationModal();
    });
  }
}

function setupCodeRedeemEvents() {
  const btnResgatar = document.getElementById("btn-resgatar-codigo");
  const inputCodigo = document.getElementById("input-codigo-especial");
  const mensagemDiv = document.getElementById("mensagem-codigo");

  if (btnResgatar && inputCodigo && mensagemDiv) {
    btnResgatar.addEventListener("click", () => {
      const codigo = inputCodigo.value.trim();

      if (!codigo) {
        showCodeMessage("Por favor, insira um código válido.", "error");
        return;
      }
      try {
        saveSpecialCode(codigo);
        showCodeMessage(
          "Código resgatado com sucesso! Ganhaste 200 pontos.",
          "success"
        );
        inputCodigo.value = "";

        /* Limpar mensagem após 5 segundos */
        setTimeout(() => {
          showCodeMessage("", "hidden");
        }, 5000);
      } catch (error) {
        showCodeMessage(error.message, "error");
      }
    });

    /* Permitir resgatar com Enter */
    inputCodigo.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        btnResgatar.click();
      }
    });
  }
}

function showCodeMessage(message, type) {
  const mensagemDiv = document.getElementById("mensagem-codigo");
  if (!mensagemDiv) return;

  mensagemDiv.textContent = message;
  mensagemDiv.classList.remove("hidden", "text-red-600", "text-green-600");

  if (type === "error") {
    mensagemDiv.classList.add("text-red-600");
  } else if (type === "success") {
    mensagemDiv.classList.add("text-green-600");
  } else if (type === "hidden") {
    mensagemDiv.classList.add("hidden");
  }
}

function saveSpecialCode(code) {
  if (!code || code.trim() === "") {
    throw new Error("Código inválido");
  }

  /* Guardar código na local storage */
  const existingCodes = JSON.parse(
    localStorage.getItem("specialCodes") || "[]"
  );

  /* Verificar se código já foi usado */
  if (existingCodes.includes(code.trim())) {
    throw new Error("Este código já foi utilizado");
  }

  existingCodes.push(code.trim());
  localStorage.setItem("specialCodes", JSON.stringify(existingCodes));

  return true;
}
