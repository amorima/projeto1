import { loadComponent, showToast, showConfirm } from "./ViewHelpers.js";
import * as UserModel from "../models/UserModel.js";
import { getLevelSymbol } from "./RewarditView.js";
import * as FlightModel from "../models/FlightModel.js";
import { updateNavbarUser } from "./NavbarView.js";
// Disable automatic header loading since we handle it manually
window.skipAutoHeaderLoad = true;
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
  initGamificationModal()
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

  if (btnMovimentos && modalPontos) {
    btnMovimentos.addEventListener("click", function () {
      try {
        loadPointMovements();
        modalPontos.classList.remove("hidden");
        modalPontos.style.display = "block";
        modalPontos.style.zIndex = "9999";
        document.body.style.overflow = "hidden";
      } catch (error) {
      }
    });

    // Close modal when clicking outside
    window.addEventListener("click", function (e) {
      if (e.target === modalPontos) {
        modalPontos.classList.add("hidden");
        modalPontos.style.display = ""; // Reset inline style
        document.body.style.overflow = ""; // Restore scroll
      }
    });
    // Close modal with ESC key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modalPontos.classList.contains("hidden")) {
        modalPontos.classList.add("hidden");
        modalPontos.style.display = ""; // Reset inline style
        document.body.style.overflow = ""; // Restore scroll
      }
    });
  } else {
  }
  /* Botão de copiar link de convite */
  const btnCopy = document.querySelector("button.bg-Button-Main.rounded-r-lg");
  if (btnCopy) {
    btnCopy.addEventListener("click", function () {
      const linkInput = document.getElementById("referral-link");
      if (linkInput && linkInput.value) {
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
    });  }
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
  ).textContent = levelIcon;  /* Atualizar avatar */
  const avatarElement = document.getElementById("user-avatar");
  if (avatarElement) {
    if (user.avatar && user.avatar !== "") {
      /* Corrigir caminho do avatar se necessário */
      const avatarPath = user.avatar.startsWith("data:")
        ? user.avatar
        : `..${user.avatar}`;
      avatarElement.src = avatarPath;
    } else {
      /* Se não tem avatar, usar um placeholder */
      avatarElement.src = "https://placehold.co/80x80/6b7280/ffffff?text=" + encodeURIComponent(user.username.charAt(0).toUpperCase());
    }
  }/* Atualizar navbar após carregar os dados */
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
  /* Carregar favoritos */
  loadFavoritos(user);
  /* Set referral link */
  const referralLinkInput = document.getElementById("referral-link");
  if (referralLinkInput) {
    try {
      const referralLink = UserModel.getReferralLink(user);
      referralLinkInput.value = referralLink;
    } catch (error) {
      referralLinkInput.value = '';
    }
  }
}
/* Popular campos do formulário de definições */
function populateSettingsForm(user) {
  // Avatar nas definições
  const settingsAvatar = document.getElementById("settings-avatar");
  if (settingsAvatar) {
    if (user.avatar && user.avatar !== "") {
      settingsAvatar.src = user.avatar;
    } else {
      /* Se não tem avatar, usar um placeholder */
      settingsAvatar.src = "https://placehold.co/96x96/6b7280/ffffff?text=" + encodeURIComponent(user.username.charAt(0).toUpperCase());
    }
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
  // Password change logic (acesso direto aos inputs pelo id)
  const currentPassword = document.getElementById("current-password")?.value || "";
  const newPassword = document.getElementById("new-password")?.value || "";
  const confirmPassword = document.getElementById("confirm-password")?.value || "";
  if (currentPassword || newPassword || confirmPassword) {
    // Só tenta alterar se algum campo de password foi preenchido
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Preencha todos os campos de password.", "error");
      return;
    }
    if (currentPassword !== user.password) {
      showToast("Password atual incorreta.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("A nova password e a confirmação não coincidem.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("A nova password deve ter pelo menos 6 caracteres.", "error");
      return;
    }
    user.password = newPassword;
  }
  // Atualizar todos os campos relevantes do utilizador
  const updatedUser = {
    ...user,
    username: formData.get("user-name-input") || formData.get("username") || user.username,
    email: formData.get("user-email-input") || formData.get("email") || user.email,
    telefone: formData.get("user-phone-input") || formData.get("telefone") || user.telefone,
    dataNascimento: formData.get("user-birth-input") || formData.get("birth") || user.dataNascimento,
    avatar: formData.get("settings-avatar") || user.avatar,
    isPrivate: formData.get("user-private-input") === "on" || user.isPrivate,
  };
  // Preferências (notificações/newsletter) - manter compatibilidade
  updatedUser.preferences = {
    ...user.preferences,
    emailNotifications: document.querySelector('#settings-email-notifications')?.checked ?? user.preferences?.emailNotifications,
    newsletter: document.querySelector('#newsletter-check')?.checked ?? user.preferences?.newsletter,
  };
  // Atualizar também user.newsletter diretamente
  updatedUser.newsletter = document.querySelector('#newsletter-check')?.checked ?? user.newsletter;
  try {
    const result = UserModel.update(user.id, updatedUser);
    sessionStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    loadUserInfo();
    showToast("Perfil atualizado com sucesso!", "success");
  } catch (error) {
    showToast("Erro ao atualizar perfil: " + error.message, "error");
  }
}
/* Processar upload de avatar */
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      showToast("Por favor, selecione um ficheiro de imagem.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      // Guardar o base64 no perfil do utilizador
      const user = UserModel.getUserLogged();
      if (!user) {
        showToast("Utilizador não encontrado.", "error");
        return;
      }
      user.avatar = e.target.result; // base64
      try {
        UserModel.update(user.id, user);
        sessionStorage.setItem("loggedUser", JSON.stringify(user));
        loadUserInfo();
        showToast("Avatar atualizado com sucesso!", "success");
      } catch (error) {
        showToast("Erro ao atualizar avatar: " + error.message, "error");
      }
    };
    reader.onerror = function () {
      showToast("Erro ao ler o ficheiro de imagem.", "error");
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
        showToast("Por favor, insira um código válido.", "error");
        return;
      }
      try {
        const result = saveSpecialCode(codigo);
        if (result.success) {
          showToast(
            "Código resgatado com sucesso! Ganhaste 200 pontos.",
            "success"
          );
          inputCodigo.value = "";
          // Reload user info to update points display
          loadUserInfo();
        }
      } catch (error) {
        showToast(error.message, "error");
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
  // Check if user is logged in
  if (!UserModel.isLogged()) {
    throw new Error("Deve fazer login para resgatar códigos");
  }
  const validCode = "PITSIWESMAD";
  const codeToCheck = code.trim().toUpperCase();
  // Check if code is valid
  if (codeToCheck !== validCode) {
    throw new Error("Código inválido");
  }
  // Get current user
  const currentUser = UserModel.getUserLogged();
  // Check if user already used this code
  if (!currentUser.redeemedCodes) {
    currentUser.redeemedCodes = [];
  }
  if (currentUser.redeemedCodes.includes(validCode)) {
    throw new Error("Este código já foi utilizado por si");
  }
  // Add points to user (UserModel.addPontos handles adding points to currentUser.pontos)
  const pointsToAdd = 200;
  // Add code to user's redeemed codes
  currentUser.redeemedCodes.push(validCode);
  // Add point movement record and points
  UserModel.addPontos(currentUser, pointsToAdd, `Código especial resgatado: ${validCode}`);
  // Update user in storage
  UserModel.update(currentUser.id, currentUser);
  // Update session storage
  sessionStorage.setItem("loggedUser", JSON.stringify(currentUser));
  return { success: true };
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
      "bg-white dark:bg-gray-900 rounded-xl shadow-md outline outline-1 outline-gray-200 dark:outline-gray-700 flex flex-col sm:flex-row items-center p-0 gap-6 relative max-w-3xl w-full mb-6 cursor-pointer hover:shadow-lg transition-shadow";
    // Add click event based on reservation type
    card.addEventListener("click", function(e) {
      // Don't navigate if clicking the delete button
      if (e.target.closest('.delete-reservation-btn')) {
        return;
      }
      // Navigate based on reservation type
      if (reserva.tipo === 'hotel') {
        window.location.href = `hotel.html?id=${reserva.id}`;
      } else if (reserva.numeroVoo) {
        window.location.href = `flight_itinerary.html?id=${reserva.numeroVoo}`;
      }
    });
    // Botão de apagar
    const btnDelete = document.createElement("button");
    btnDelete.className =
      "absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-red-50 dark:hover:bg-gray-700 transition-colors z-10 flex items-center justify-center delete-reservation-btn";
    btnDelete.innerHTML =
      '<span class="material-symbols-outlined text-red-500 text-sm">delete</span>';
    btnDelete.dataset.reservationIndex = idx;
    card.appendChild(btnDelete);
    // Imagem principal
    const img = document.createElement("img");
    img.className =
      "h-40 w-full sm:h-48 sm:w-48 max-lg:rounded-t-xl max-lg:rounded-bl-none sm:rounded-l-xl sm:rounded-tr-none object-cover flex-shrink-0";
    img.src = reserva.imagem || "https://placehold.co/200x200";
    img.alt = "Imagem promocional";
    card.appendChild(img);    // Área do conteúdo
    const content = document.createElement("div");
    content.className = "flex flex-row items-center justify-between flex-1 p-4 w-full";
    // Itinerário (lado esquerdo) - give more space for hotel reservations
    const itinerary = document.createElement("div");
    if (reserva.tipo === 'hotel') {
      itinerary.className = "flex flex-col gap-2 text-left w-full"; // Full width for hotels
    } else {
      itinerary.className = "flex flex-col gap-2 text-left flex-1"; // Original for flights
    }
    // Destino em destaque
    itinerary.innerHTML = `<span class="text-3xl font-bold font-['Space_Mono'] text-Main-Primary dark:text-cyan-400">${reserva.destino || 'Destino'}</span>`;
    // Display based on reservation type
    if (reserva.tipo === 'hotel') {
      // Hotel reservation display
      itinerary.innerHTML += `<span class="text-sm font-semibold text-Main-Secondary dark:text-cyan-200">Hotel: ${reserva.nome || 'Hotel'}</span>`;
      if (reserva.checkIn && reserva.checkOut) {
        itinerary.innerHTML += `<span class="text-sm font-semibold text-Main-Secondary dark:text-cyan-200">Check-in: ${reserva.checkIn} | Check-out: ${reserva.checkOut}</span>`;
      }
        if (reserva.hospedes) {
        itinerary.innerHTML += `<span class="text-base font-light text-Main-Secondary dark:text-cyan-100">${reserva.hospedes} hóspedes</span>`;
      }
    } else {
      // Flight reservation display (original logic)
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
    }    content.appendChild(itinerary);
    // Icon/Logo (lado direito) - only for flights, not hotels
    if (reserva.tipo !== 'hotel') {
      const iconDiv = document.createElement("div");
      iconDiv.className = "pl-4 flex-shrink-0 flex items-center";
      // Airline logo (original logic)
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
      iconDiv.appendChild(companhiaImg);
      content.appendChild(iconDiv);
    }
    card.appendChild(content);
    container.appendChild(card);
  });
  // After loading all reservations, setup the delete button listeners
  setupReservationDeleteListeners();
}
/* Setup reservation delete listeners - should be called after loadReservas */
function setupReservationDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete-reservation-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the logged user
      const user = UserModel.getUserLogged();
      if (!user) {
        showToast("Erro: Utilizador não está logado", "error");
        return;
      }
      
      // Get reservation index from data attribute
      const reservationIndex = parseInt(this.dataset.reservationIndex, 10);
      const reservation = user.reservas && user.reservas[reservationIndex];
      const reservationName = reservation ? 
        (reservation.numeroVoo || reservation.hotel?.nome || `Reserva ${reservationIndex + 1}`) :
        `Reserva ${reservationIndex + 1}`;
        showConfirm(`Tem a certeza que pretende cancelar a reserva "${reservationName}"? Esta ação não pode ser desfeita.`)
        .then(confirmed => {
          if (confirmed) {
            // Call model function to remove reservation and subtract points
            const result = UserModel.removeReservation(user.id, reservationIndex);
            
            if (result.success) {
              // Find the parent card element
              let reservaCard = this.parentElement;
              while (reservaCard && !reservaCard.classList.contains('mb-6')) {
                reservaCard = reservaCard.parentElement;
              }
              if (reservaCard) {
                /* Animação de fade-out antes de remover */
                reservaCard.style.transition = "opacity 0.3s ease";
                reservaCard.style.opacity = "0";
                setTimeout(() => {
                  reservaCard.remove();
                  /* Verificar se ainda existem reservas */
                  const reservasContainer = document.getElementById("reservas-container");
                  if (reservasContainer && reservasContainer.children.length === 0) {
                    document.getElementById("reservas-empty").classList.remove("hidden");
                  }
                }, 300);
              }
              // Show success message with points info - use toast instead of alert
              showToast(`Reserva removida! Pontos subtraídos: ${result.pointsSubtracted}. Pontos atuais: ${result.newPoints}`, "success");
              // Reload user info to update UI
              loadUserInfo();
            } else {
              showToast(`Erro ao remover reserva: ${result.message}`, "error");
            }
          }
        });
    });
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
/* Remove favorite from user's favorites list */
function removeFavorite(favoriteIndex) {
  // Check if user is logged in
  if (!UserModel.isLogged()) {
    alert("Deve fazer login primeiro!");
    return;
  }
  const currentUser = UserModel.getUserLogged();
  // Check if favorites array exists and index is valid
  if (!currentUser.favoritos || favoriteIndex < 0 || favoriteIndex >= currentUser.favoritos.length) {
    return;
  }
  // Get the favorite to be removed for confirmation
  const favoriteToRemove = currentUser.favoritos[favoriteIndex];
  const favoriteName = favoriteToRemove.destino || favoriteToRemove.nome || favoriteToRemove.title || "este favorito";
  // Confirm removal
  showToast(`Favorito ${favoriteName} removido com sucesso!`);
  try {
    // Try to use the UserModel to remove the favorite first
    let success = false;
    // Check if the favorite has flight number properties
    if (favoriteToRemove.numeroVoo || favoriteToRemove.nVoo) {
      success = UserModel.removeFavorite(currentUser, favoriteToRemove);
    }
    // If UserModel method failed or couldn't be used, remove manually by index
    if (!success) {
      currentUser.favoritos.splice(favoriteIndex, 1);
      UserModel.update(currentUser.id, currentUser);
      success = true;
    }
    if (success) {
      // Reload the favorites display
      loadFavoritos(currentUser);
      showToast(`Favorito ${favoriteName} removido com sucesso!`);
      // Show success message
    } else {
      throw new Error("Falha ao remover favorito");
    }
  } catch (error) {
    alert("Erro ao remover favorito. Tente novamente.");
  }
}
/* Carregar favoritos */
function loadFavoritos(user) {
  // Find the bookmarks container in the Perfil tab
  const bookmarksContainer = document.getElementById("bookmarks-container");
  const bookmarksEmpty = document.getElementById("bookmarks-empty");
  if (!bookmarksContainer) {
    return;
  }
  // Limpa o container
  bookmarksContainer.innerHTML = "";
  // Debug: log the favoritos array
  if (!user.favoritos || user.favoritos.length === 0) {
    if (bookmarksEmpty) {
      bookmarksEmpty.classList.remove("hidden");
    }
    return;
  } else {
    if (bookmarksEmpty) bookmarksEmpty.classList.add("hidden");
  }  user.favoritos.forEach((fav, idx) => {
    // Determine if it's a hotel or flight
    const isHotel = fav.id && !fav.numeroVoo && !fav.nVoo;
    const isFlight = fav.numeroVoo || fav.nVoo;
    // Render a card matching the provided HTML
    const card = document.createElement("div");
    card.className = "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors";
    let title, subtitle, navigationUrl;
    if (isHotel) {
      title = fav.nome || "Hotel";
      subtitle = `${fav.cidade || "Localização"} | Hotel`;
      navigationUrl = `/html/hotel.html?id=${fav.id}`;
    } else if (isFlight) {
      title = fav.destino || fav.nome || fav.title || "Voo";
      subtitle = `${fav.origem ? `${fav.origem} → ${fav.destino}` : ""}${fav.partida ? ` | ${fav.partida.split(' ')[0]}` : ""}${fav.companhia ? ` | ${fav.companhia}` : ""}`;
      navigationUrl = `/html/flight_itinerary.html?id=${fav.numeroVoo || fav.nVoo || ""}`;
    } else {
      title = "Favorito";
      subtitle = "Tipo desconhecido";
      navigationUrl = "#";
    }
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-rose-500 hover:text-rose-600 cursor-pointer transition-colors favorite-heart" data-favorite-index="${idx}">favorite</span>
        <div>
          <h3 class="font-medium">${title}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">${subtitle}</p>
        </div>
      </div>
      <span class="material-symbols-outlined text-gray-400 dark:text-gray-300 hover:text-gray-600 cursor-pointer">arrow_forward</span>
    `;
    // Add click event to the heart icon for removing favorite
    const heartIcon = card.querySelector('.favorite-heart');
    heartIcon.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent card click from triggering
      removeFavorite(idx);
    });
    // Add click event for navigation to the entire card
    card.addEventListener('click', function() {
      window.location.href = navigationUrl;
    });
    bookmarksContainer.appendChild(card);
  });
  // Final debug
}
/* Load and display point movements in the modal */
function loadPointMovements() {
  const user = UserModel.getUserLogged();
  if (!user) {
    return;
  }
  const movements = UserModel.getUserPointMovements(user);
  const modalContent = document.querySelector("#pontos-modal .inline-block");
  if (!modalContent) return;
  modalContent.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Movimentos de Pontos
      </h3>
      <button id="close-pontos-modal" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
        <span class="material-symbols-outlined">close</span>
        <span class="sr-only">Fechar modal</span>
      </button>
    </div>
    <div class="mt-4">
      <div class="mb-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-cyan-800 dark:text-cyan-200">Saldo Atual</span>
          <span class="text-2xl font-bold text-cyan-800 dark:text-cyan-200">${user.pontos || 0} pontos</span>
        </div>
      </div>
      ${movements.length === 0 ? 
        '<div class="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum movimento de pontos encontrado</div>' :
        `<div class="max-h-96 overflow-y-auto">
          ${movements.map(movement => `
            <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  ${movement.descricao}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  ${formatMovementDate(movement.data)}
                </div>
              </div>
              <div class="flex flex-col items-end ml-4">
                <span class="text-sm font-semibold ${movement.valor >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                  ${movement.valor >= 0 ? '+' : ''}${movement.valor} pts
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  Saldo: ${movement.saldoAtual} pts
                </span>
              </div>
            </div>
          `).join('')}
        </div>`
      }
    </div>
  `;  // Reattach close button event listener
  const newCloseBtn = document.getElementById("close-pontos-modal");
  if (newCloseBtn) {
    newCloseBtn.addEventListener("click", function () {
      const modal = document.getElementById("pontos-modal");
      modal.classList.add("hidden");
      modal.style.display = ""; // Reset inline style
      document.body.style.overflow = ""; // Restore scroll
    });
  }
}
/* Format movement date for display */
function formatMovementDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  if (diffInHours < 24) {
    return `Hoje às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffInHours < 48) {
    return `Ontem às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
