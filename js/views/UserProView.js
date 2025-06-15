import { loadComponent, showToast } from "./ViewHelpers.js";
import * as UserModel from "../models/UserModel.js";
import { getLevelSymbol } from "./RewarditView.js";
import * as FlightModel from "../models/FlightModel.js";
import { updateNavbarUser } from "./NavbarView.js";

/* Funções globais para o modal de gamificação */
window.openGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
};

window.closeGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
};

window.deferGamificationModal = function () {
  sessionStorage.setItem("gamificationModalDeferred", "true");
  window.closeGamificationModal();
};

window.ignoreGamificationModal = function () {
  localStorage.setItem("gamificationModalIgnored", "true");
  window.closeGamificationModal();
};

/* Carregar componentes na página */
window.onload = async function () {
  /* Inicializar o modelo */
  UserModel.init();
  FlightModel.init();

  try {
    /* Carregar componentes de header e footer e aguardar a sua conclusão */
    await loadComponent("_header.html", "header-placeholder");
    await loadComponent("_footer.html", "footer-placeholder");

    /* Agora que os componentes estão carregados, carregar informações do utilizador e configurar eventos */
    loadUserInfo(); /* Esta função chama updateNavbarUser */
    setupEventListeners();

    /* Inicializar funcionalidades das abas após um pequeno delay */
    /* Considerar se este timeout ainda é necessário ou se pode ser chamado diretamente */
    setTimeout(() => {
      UserModel.initTabEvents();
    }, 100); /* Reduzido o delay, ajustar conforme necessário */
  } catch (error) {
    console.error("Erro ao carregar componentes na UserProView:", error);
  }
};

/* Configurar listeners de eventos para interações do utilizador */
function setupEventListeners() {
  /* Botão de edição de perfil */
  const editProfileBtn = document.getElementById("btn-editar-perfil");
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

  /* Formulário de definições do perfil */
  const profileForm = document.getElementById("profile-settings-form");
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileUpdate);
  }

  /* Upload de avatar */
  const avatarUpload = document.getElementById("avatar-upload");
  if (avatarUpload) {
    avatarUpload.addEventListener("change", handleAvatarUpload);
  }

  /* Botão para scan de gamificação */
  const btnScanIt = document.getElementById("btn-scan-it");
  if (btnScanIt) {
    btnScanIt.addEventListener("click", function () {
      window.location.href = "rewardit.html";
    });
  }
}

/* Carregar informações do utilizador */
function loadUserInfo() {
  /* Verificar se utilizador está logado */
  if (!UserModel.isLogged()) {
    window.location.href = "_login.html";
    return;
  }

  /* Obter dados do utilizador logado */
  const user = UserModel.getUserLogged();

  if (!user) {
    alert("Erro ao carregar dados do utilizador!");
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
  ).textContent = levelIcon; /* Atualizar avatar */
  const avatarElement = document.getElementById("user-avatar");
  if (avatarElement) {
    if (user.avatar && user.avatar !== "") {
      /* Corrigir caminho do avatar se necessário */
      const avatarPath = user.avatar.startsWith("data:")
        ? user.avatar
        : `..${user.avatar}`;
      avatarElement.src = avatarPath;
    } else {
      /* Se não tem avatar, usar uma imagem padrão */
      avatarElement.src = "../img/users/40240119.jpg";
    }
  } /* Atualizar navbar após carregar os dados */
  updateNavbarUser();
  /* Preencher informações pessoais */
  if (document.getElementById("info-username"))
    document.getElementById("info-username").textContent = user.username;
  if (document.getElementById("info-email"))
    document.getElementById("info-email").textContent = user.email;
  if (document.getElementById("info-points"))
    document.getElementById("info-points").textContent = userPoints;
  if (document.getElementById("info-member-since"))
    document.getElementById("info-member-since").textContent = formatDate(
      new Date()
    );

  /* Popular campos do formulário de definições */
  populateSettingsForm(user);

  /* Atualizar barra de progresso */
  updateProgressBar(userPoints);

  /* Carregar histórico de viagens */
  loadTravelHistory(user);

  /* Carregar preferências de viagem */
  loadTravelPreferences(user);

  /* Carregar reservas */
  loadReservas(user);
}

/* Popular campos do formulário de definições */
function populateSettingsForm(user) {
  /* Avatar nas definições */
  const settingsAvatar = document.getElementById("settings-avatar");
  if (settingsAvatar && user.avatar) {
    settingsAvatar.src = `..${user.avatar}`;
  }

  /* Campos de dados pessoais */
  const nameInput = document.getElementById("user-name-input");
  if (nameInput) {
    nameInput.value = user.username || "";
  }

  const emailInput = document.getElementById("user-email-input");
  if (emailInput) {
    emailInput.value = user.email || "";
  }

  const phoneInput = document.getElementById("user-phone-input");
  if (phoneInput) {
    phoneInput.value = user.telefone || "";
  }

  const birthInput = document.getElementById("user-birth-input");
  if (birthInput && user.dataNascimento) {
    birthInput.value = user.dataNascimento;
  }

  /* Configurações de preferências */
  const preferences = user.preferences || {};

  /* Notificações por email */
  const emailNotifications = document.querySelector(
    '#tab-definicoes input[type="checkbox"]:first-of-type'
  );
  if (emailNotifications) {
    emailNotifications.checked = preferences.emailNotifications !== false;
  }

  /* Newsletter */
  const newsletter = document.querySelector(
    '#tab-definicoes input[type="checkbox"]:last-of-type'
  );
  if (newsletter) {
    newsletter.checked = preferences.newsletter !== false;
  }
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
  let progressPercentage = 0;

  /* Calcular pontos necessários para o próximo nível */
  if (currentLevel === "Embaixador") {
    nextLevel = "Máximo";
    pointsNeeded = 0;
  } else {
    /* Determinar próximo nível */
    const levelOrder = [
      "Explorador",
      "Viajante",
      "Aventureiro",
      "Globetrotter",
      "Embaixador",
    ];
    const currentIndex = levelOrder.indexOf(currentLevel);
    nextLevel = levelOrder[currentIndex + 1];

    const nextLevelPoints = levelPoints[nextLevel];
    pointsNeeded = nextLevelPoints - points;
  }
  /* Lógica da barra por segmentos progressivos */
  /* Cada segmento entre níveis representa 25% da barra total */
  const segmentPercentage = 25; /* Cada segmento vale 25% */

  if (points < 250) {
    /* Até 249 pontos: barra não aparece */
    progressPercentage = 0;
  } else if (points >= 5000) {
    /* Embaixador: barra completa */
    progressPercentage = 100;
  } else if (points >= 3000) {
    /* Entre Globetrotter e Embaixador */
    const progressInSegment = points - 3000;
    const totalPointsInSegment = 2000; /* 5000 - 3000 */
    const segmentProgress =
      (progressInSegment / totalPointsInSegment) * segmentPercentage;
    progressPercentage =
      75 + segmentProgress; /* 3 segmentos completos + progresso no 4º */
  } else if (points >= 1500) {
    /* Entre Aventureiro e Globetrotter */
    const progressInSegment = points - 1500;
    const totalPointsInSegment = 1500; /* 3000 - 1500 */
    const segmentProgress =
      (progressInSegment / totalPointsInSegment) * segmentPercentage;
    progressPercentage =
      50 + segmentProgress; /* 2 segmentos completos + progresso no 3º */
  } else if (points >= 250) {
    /* Entre Viajante e Aventureiro */
    const progressInSegment = points - 250;
    const totalPointsInSegment = 1250; /* 1500 - 250 */
    const segmentProgress =
      (progressInSegment / totalPointsInSegment) * segmentPercentage;
    progressPercentage =
      25 + segmentProgress; /* 1 segmento completo + progresso no 2º */
  }

  /* Garantir que não excede 100% */ progressPercentage = Math.min(
    100,
    progressPercentage
  );

  /* Atualizar texto com pontos necessários */
  const pointsInfoElement = document.querySelector(
    ".text-white.dark\\:text-gray-300.text-left.text-base"
  );
  if (pointsInfoElement) {
    if (currentLevel === "Embaixador") {
      pointsInfoElement.innerHTML =
        "Parabéns! Alcançaste o nível máximo: <span class='font-bold'>Embaixador</span>!";
    } else {
      const pointsNeededEl = document.getElementById("points-needed");
      const nextLevelEl = document.getElementById("next-level");
      if (pointsNeededEl) pointsNeededEl.textContent = pointsNeeded;
      if (nextLevelEl) nextLevelEl.textContent = nextLevel;
    }
  }
  /* Atualizar barra de progresso */
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    /* Remover qualquer estilo inline anterior */
    progressBar.removeAttribute("style");

    /* Aplicar nova largura */
    progressBar.style.width = `${progressPercentage}%`; /* Garantir que a barra é visível se houver progresso */
    if (progressPercentage > 0) {
      progressBar.style.display = "block";
    }
  }

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

  /* Selecionar todos os marcadores na barra de progresso */
  const levelMarkersContainer = document.querySelector(
    ".absolute.top-2.left-0.right-0.flex.justify-between.items-center"
  );

  if (!levelMarkersContainer) {
    console.error("Contentor dos marcadores de nível não encontrado");
    return;
  }

  const levelMarkers = levelMarkersContainer.querySelectorAll(".relative");

  if (levelMarkers.length === levels.length) {
    levels.forEach((level, index) => {
      const marker = levelMarkers[index];
      const iconContainer = marker.querySelector("div:first-child");
      const icon = iconContainer.querySelector(
        "span.material-symbols-outlined"
      );
      const checkmark =
        marker.querySelector(
          ".completed-check"
        ); /* Atualizar ícone com símbolo correto */
      icon.textContent = getLevelSymbol(level);
      const currentLevelIndex = levels.indexOf(currentLevel);

      /* Obter pontos do utilizador para verificação precisa */
      const user = UserModel.getUserLogged();
      const userPoints = parseInt(user.pontos) || 0;

      const levelPoints = {
        Explorador: 0,
        Viajante: 250,
        Aventureiro: 1500,
        Globetrotter: 3000,
        Embaixador: 5000,
      };
      if (userPoints >= levelPoints[level]) {
        /* Utilizador já alcançou este nível */
        iconContainer.className =
          "w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-green-600 dark:border-green-500 z-10";
        icon.className =
          "material-symbols-outlined text-green-600 dark:text-green-500 text-sm";
        if (checkmark) checkmark.style.display = "flex";
      } else {
        /* Determinar se é o próximo nível */
        const levelOrder = [
          "Explorador",
          "Viajante",
          "Aventureiro",
          "Globetrotter",
          "Embaixador",
        ];
        let nextLevelIndex = -1;

        /* Encontrar o índice do próximo nível */
        for (let i = 0; i < levelOrder.length; i++) {
          if (userPoints < levelPoints[levelOrder[i]]) {
            nextLevelIndex = i;
            break;
          }
        }

        if (index === nextLevelIndex) {
          /* Este é o próximo nível - piscar azul */
          iconContainer.className =
            "w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-Main-Primary dark:border-Main-Primary z-10 animate-pulse";
          icon.className =
            "material-symbols-outlined text-Main-Primary dark:text-Main-Primary text-sm";
          if (checkmark) checkmark.style.display = "none";
        } else {
          /* Nível futuro */
          iconContainer.className =
            "w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-600 z-10";
          icon.className =
            "material-symbols-outlined text-gray-300 dark:text-gray-500 text-sm";
          if (checkmark) checkmark.style.display = "none";
        }
      }
    });
  }
}

/* Carregar histórico de viagens */
function loadTravelHistory(user) {
  const travelHistoryContainer = document.getElementById("travel-history");
  if (travelHistoryContainer) {
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
}

/* Adicionar viagem de demonstração */
function addDemoTrip() {
  /* Verificar se utilizador está logado */
  if (!UserModel.isLogged()) {
    alert("Deve fazer login primeiro!");
    return;
  }

  /* Obter utilizador logado */
  const currentUser = UserModel.getUserLogged();

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
    /* Atualizar utilizador usando o modelo */
    UserModel.update(currentUser.id, currentUser);

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
  if (!preferencesContainer) return;
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

/* Adicionar viagem de demonstração */


/* Carregar preferências de viagem */


/* Adicionar preferências de demonstração */
function addDemoPreferences() {
  /* Verificar se utilizador está logado */
  if (!UserModel.isLogged()) {
    alert("Deve fazer login primeiro!");
    return;
  }

  /* Obter utilizador logado */
  const currentUser = UserModel.getUserLogged();

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
    /* Atualizar utilizador usando o modelo */
    UserModel.update(currentUser.id, currentUser);

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
  /* Obter dados do utilizador logado */
  if (!UserModel.isLogged()) {
    alert("Deve fazer login primeiro!");
    return;
  }

  const user = UserModel.getUserLogged();
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
        <input type="text" id="edit-username" value="${user.username}" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      <div>
        <label for="edit-email" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">Email</label>
        <input type="email" id="edit-email" value="${user.email}" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      <div>
        <label for="edit-phone" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">Telefone</label>
        <input type="text" id="edit-phone" value="${user.telefone || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      <div>
        <label for="edit-birth" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">Data de Nascimento</label>
        <input type="date" id="edit-birth" value="${user.dataNascimento || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      <div>
        <label for="edit-avatar" class="block text-Text-Subtitles dark:text-gray-400 text-sm font-medium mb-1">URL do Avatar</label>
        <input type="text" id="edit-avatar" value="${user.avatar || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-Text-Body dark:text-gray-300">
      </div>
      <div class="flex items-center mt-4">
        <input type="checkbox" id="edit-private" ${user.isPrivate ? "checked" : ""} class="h-4 w-4 text-Main-Primary dark:text-cyan-600 border-gray-300 rounded">
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
  const username = document.getElementById("edit-username").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  const telefone = document.getElementById("edit-phone").value.trim();
  const dataNascimento = document.getElementById("edit-birth").value;
  const avatar = document.getElementById("edit-avatar").value.trim();
  const isPrivate = document.getElementById("edit-private").checked;
  if (!username || !email) {
    alert("Nome de utilizador e email são obrigatórios.");
    return;
  }
  if (!UserModel.isLogged()) {
    alert("Deve fazer login primeiro!");
    return;
  }
  const currentUser = UserModel.getUserLogged();
  const updatedUser = {
    ...currentUser,
    username,
    email,
    telefone,
    dataNascimento,
    avatar,
    isPrivate,
  };
  try {
    UserModel.update(currentUser.id, updatedUser);
    closeEditProfileModal();
    loadUserInfo();
    alert("Perfil atualizado com sucesso!");
  } catch (error) {
    alert(`Erro ao atualizar perfil: ${error.message}`);
  }
}

/* Processar atualização do perfil */
function handleProfileUpdate(event) {
  event.preventDefault();
  const user = UserModel.getUserLogged();
  if (!user) {
    showToast("Erro: Utilizador não encontrado", "error");
    return;
  }
  // Obter dados do formulário
  const formData = new FormData(event.target);
  // Atualizar todos os campos relevantes do utilizador
  const updatedUser = {
    ...user,
    username: formData.get("user-name-input") || formData.get("username") || user.username,
    email: formData.get("user-email-input") || formData.get("email") || user.email,
    telefone: formData.get("user-phone-input") || formData.get("telefone") || user.telefone,
    dataNascimento: formData.get("user-birth-input") || formData.get("birth") || user.dataNascimento,
    avatar: formData.get("user-avatar-input") || user.avatar,
    isPrivate: formData.get("user-private-input") === "on" || user.isPrivate,
  };
  console.log('[DEBUG] Dados do utilizador antes do update:', user);
  console.log('[DEBUG] Dados do utilizador a atualizar:', updatedUser);
  try {
    const result = UserModel.update(user.id, updatedUser);
    console.log('[DEBUG] Resultado do update:', result);
    // Atualizar sessionStorage manualmente para garantir que o utilizador logado reflete as alterações
    sessionStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    // Garantir que localStorage também está atualizado (UserModel.update já faz isto, mas logar para garantir)
    const allUsers = JSON.parse(localStorage.getItem("user"));
    console.log('[DEBUG] Utilizadores no localStorage após update:', allUsers);
    // Recarregar info
    loadUserInfo();
    showToast("Perfil atualizado com sucesso!", "success");
  } catch (error) {
    console.error('[DEBUG] Erro ao atualizar perfil:', error);
    showToast("Erro ao atualizar perfil: " + error.message, "error");
  }
}

/* Processar upload de avatar */
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    /* Validar tipo de ficheiro */
    if (!file.type.startsWith("image/")) {
      showToast("Por favor, seleciona apenas ficheiros de imagem", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const newAvatarUrl = e.target.result;

      try {
        /* Atualizar preview do avatar */
        const avatarImg = document.getElementById("settings-avatar");
        if (avatarImg) {
          avatarImg.src = newAvatarUrl;
        }

        /* Atualizar avatar no utilizador logado */
        const user = UserModel.getUserLogged();
        if (user) {
          UserModel.changeAvater(user, newAvatarUrl);
          UserModel.update(user.id, user);

          /* Atualizar avatar principal do perfil */
          const mainAvatar = document.getElementById("user-avatar");
          if (mainAvatar) {
            mainAvatar.src = newAvatarUrl;
          }

          /* Atualizar navbar */
          updateNavbarUser();

          showToast("Avatar atualizado com sucesso!", "success");
        }
      } catch (error) {
        showToast("Erro ao atualizar avatar: " + error.message, "error");
      }
    };

    reader.onerror = function () {
      showToast("Erro ao ler o ficheiro", "error");
    };

    reader.readAsDataURL(file);
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

/* Carregar reservas */
function loadReservas(user) {
  const container = document.getElementById("reservas-container");
  const emptyDiv = document.getElementById("reservas-empty");
  if (!container) return;

  // Limpa o container
  container.innerHTML = "";

  if (!user.reservas || user.reservas.length === 0) {
    if (emptyDiv) emptyDiv.classList.remove("hidden");
    return;
  } else {
    if (emptyDiv) emptyDiv.classList.add("hidden");
  }

  user.reservas.forEach((reserva, idx) => {
    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-gray-900 rounded-xl shadow-md outline outline-1 outline-gray-200 dark:outline-gray-700 flex flex-col sm:flex-row items-center p-0 gap-6 relative max-w-3xl w-full mb-6";

    // Botão de apagar
    const btnDelete = document.createElement("button");
    btnDelete.className =
      "absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-red-50 dark:hover:bg-gray-700 transition-colors z-10 flex items-center justify-center";
    btnDelete.innerHTML =
      '<span class="material-symbols-outlined text-red-500 text-sm">delete</span>';
    btnDelete.onclick = function () {
      // Remove do array e atualiza no Model
      if (UserModel.removeReservaByNumeroVoo(user, reserva.numeroVoo)) {
        showToast("Reserva eliminada com sucesso!", "success");
        loadReservas(user);
      } else {
        showToast("Erro ao eliminar reserva.", "error");
      }
    };
    card.appendChild(btnDelete);

    // Imagem principal
    const img = document.createElement("img");
    img.className =
      "h-40 max-lg:h-56 max-lg:w-full sm:h-full sm:w-auto max-lg:rounded-t-xl max-lg:rounded-bl-none sm:rounded-l-xl sm:rounded-tr-none object-cover";
    img.src = reserva.imagem || "https://placehold.co/200x200";
    img.alt = "Imagem promocional";
    card.appendChild(img);

    // Área do conteúdo
    const content = document.createElement("div");
    content.className = "flex flex-row items-center justify-between flex-1 p-4 w-full";

    // Itinerário (lado esquerdo)
    const itinerary = document.createElement("div");
    itinerary.className = "flex flex-col gap-2 text-left flex-1";

    // Destino em destaque
    itinerary.innerHTML = `<span class="text-3xl font-bold font-['Space_Mono'] text-Main-Primary dark:text-cyan-400">${reserva.destino || 'Destino'}</span>`;

    // Ida
    if (reserva.partida && reserva.origem && reserva.chegada && reserva.destino) {
      itinerary.innerHTML += `<span class="text-sm font-semibold text-Main-Secondary dark:text-cyan-200">${reserva.partida} (${reserva.origem}) » ${reserva.chegada} (${reserva.destino})</span>`;
    } else {
      itinerary.innerHTML += `<span class="text-xs text-red-500">Faltam dados de ida</span>`;
    }

    // Volta
    if (reserva.dataVolta && reserva.destino && reserva.origem) {
      itinerary.innerHTML += `<span class="text-sm font-semibold text-Main-Secondary dark:text-cyan-200">${reserva.dataVolta} (${reserva.destino}) » ? (${reserva.origem})</span>`;
    }

    // Voo
    if (reserva.numeroVoo) {
      itinerary.innerHTML += `<span class="text-base font-light text-Main-Secondary dark:text-cyan-100">Voo ${reserva.numeroVoo}</span>`;
    }

    content.appendChild(itinerary);

    // Imagem da companhia aérea (lado direito)
    const companhiaDiv = document.createElement("div");
    companhiaDiv.className = "pl-4 flex-shrink-0 flex items-center";
    let companhiaImgSrc = "";
    // Tenta usar um ícone da companhia se existir, senão usa um placeholder
    if (reserva.companhia && typeof reserva.companhia === 'string') {
      // Exemplo de correspondência simples para TAP, Ryanair, etc.
      const companhiaMap = {
        'TAP': '../img/icons/ca_tap.jpg',
        'Brussels Airlines': '../img/icons/ca_brussels.png',
        'Ryanair': '../img/icons/ca_ryanair.jpg',
        'KLM': '../img/icons/ca_klm.png',
        'Air France': '../img/icons/ca_air_france.jpg',
        'Swiss': '../img/icons/ca_swiss.png',
        'Vueling': '../img/icons/ca_vueling.png',
        'Wizz Air': '../img/icons/ca_wizz.png',
        'Norwegian': '../img/icons/ca_Norwegian.png',
        'British Airways': '../img/icons/ca_british_airways.jpg',
        'Alitalia': '../img/icons/ca_alitalia.png',
        'Austrian': '../img/icons/ca_Austrian.png',
        'SAS': '../img/icons/ca_sas.png',
        'LOT': '../img/icons/ca_LOT.png',
        'ITA': '../img/icons/ca_ITA.png',
        'Tarom': '../img/icons/ca-tarom.jpg',
      };
      for (const key in companhiaMap) {
        if (reserva.companhia.toLowerCase().includes(key.toLowerCase())) {
          companhiaImgSrc = companhiaMap[key];
          break;
        }
      }
    }
    if (!companhiaImgSrc) {
      companhiaImgSrc = "https://placehold.co/64x64?text=Airline";
    }
    const companhiaImg = document.createElement("img");
    companhiaImg.className = "w-16 h-16 rounded-full object-cover";
    companhiaImg.src = companhiaImgSrc;
    companhiaImg.alt = reserva.companhia || "Companhia aérea";
    companhiaDiv.appendChild(companhiaImg);
    content.appendChild(companhiaDiv);

    card.appendChild(content);
    container.appendChild(card);
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "Data não disponível";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Data inválida";
  // Exemplo: 06 Mai 10:30
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
