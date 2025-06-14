import {
  showCookieBanner,
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
  getUserLocation,
  closestAirport,
} from "./ViewHelpers.js";

/* Símbolos dos níveis de utilizador */
const levelSymbols = {
  Explorador: "explore",
  Viajante: "flight_takeoff",
  Aventureiro: "hiking",
  Globetrotter: "public",
  Embaixador: "military_tech",
};

/* Obter símbolo do nível */
export function getLevelSymbol(level) {
  return levelSymbols[level] || "person";
}

/* Obter símbolo baseado nos pontos */
export function getSymbolByPoints(points) {
  let level;
  if (points >= 5000) {
    level = "Embaixador";
  } else if (points >= 3000) {
    level = "Globetrotter";
  } else if (points >= 1500) {
    level = "Aventureiro";
  } else if (points >= 250) {
    level = "Viajante";
  } else {
    level = "Explorador";
  }
  return getLevelSymbol(level);
}

/* Criar elemento HTML com nível e símbolo */
export function createLevelBadge(user) {
  const badge = document.createElement("div");
  badge.className = "level-badge";

  const symbol = document.createElement("span");
  symbol.className = "material-symbols-outlined";
  symbol.textContent = getLevelSymbol(user.level);

  const levelText = document.createElement("span");
  levelText.textContent = user.level;

  badge.appendChild(symbol);
  badge.appendChild(levelText);

  return badge;
}

/* Atualizar elemento existente com novo nível */
export function updateLevelDisplay(element, user) {
  const symbolElement = element.querySelector(".material-symbols-outlined");
  const textElement = element.querySelector(".level-text");

  if (symbolElement) {
    symbolElement.textContent = getLevelSymbol(user.level);
  }
  if (textElement) {
    textElement.textContent = user.level;
  }
}

/* Obter informações do próximo nível */
export function getNextLevelInfo(points) {
  if (points < 250) {
    return { pointsNeeded: 250 - points, nextLevel: "Viajante" };
  } else if (points < 1500) {
    return { pointsNeeded: 1500 - points, nextLevel: "Aventureiro" };
  } else if (points < 3000) {
    return { pointsNeeded: 3000 - points, nextLevel: "Globetrotter" };
  } else if (points < 5000) {
    return { pointsNeeded: 5000 - points, nextLevel: "Embaixador" };
  }
  return { pointsNeeded: 0, nextLevel: "Máximo" };
}

/* Verificar se utilizador atingiu determinado nível */
export function hasReachedLevel(points, targetLevel) {
  const levelThresholds = {
    Explorador: 0,
    Viajante: 250,
    Aventureiro: 1500,
    Globetrotter: 3000,
    Embaixador: 5000,
  };
  return points >= levelThresholds[targetLevel];
}

/* Carregar informações do utilizador */
async function loadUserInfo() {
  try {
    const { getUserLogged, isLogged } = await import("../models/UserModel.js");

    const userNameElement = document.getElementById("userName");
    const userLevelElement = document.getElementById("userLevel");
    const userLevelIcon = document.getElementById("userLevelIcon");
    const pointsNeededElement = document.getElementById("pointsNeeded");
    const nextLevelElement = document.getElementById("nextLevel");

    if (!isLogged()) {
      /* Utilizador não logado - manter valores por defeito */
      if (userNameElement) userNameElement.textContent = "Utilizador";
      if (userLevelElement) userLevelElement.textContent = "Explorador";
      if (userLevelIcon) userLevelIcon.textContent = "explore";
      if (pointsNeededElement) pointsNeededElement.textContent = "250";
      if (nextLevelElement) nextLevelElement.textContent = "Viajante";
      return;
    }

    const user = getUserLogged();

    /* Atualizar nome e nível do utilizador */
    if (userNameElement) userNameElement.textContent = user.username;
    if (userLevelElement) userLevelElement.textContent = user.level;
    if (userLevelIcon) userLevelIcon.textContent = getLevelSymbol(user.level);

    /* Calcular pontos necessários para próximo nível */
    const nextLevelInfo = getNextLevelInfo(user.points);

    if (nextLevelInfo.pointsNeeded > 0) {
      if (pointsNeededElement)
        pointsNeededElement.textContent = nextLevelInfo.pointsNeeded;
      if (nextLevelElement)
        nextLevelElement.textContent = nextLevelInfo.nextLevel;
    } else {
      const nextLevelInfoElement = document.getElementById("nextLevelInfo");
      if (nextLevelInfoElement)
        nextLevelInfoElement.textContent =
          "Parabéns! Alcançaste o nível máximo!";
    }
  } catch (error) {
    console.error("Erro ao carregar informações do utilizador:", error);
  }
}

/* Marcar níveis atingidos pelo utilizador */
async function markAchievedLevels() {
  try {
    const { getUserLogged, isLogged } = await import("../models/UserModel.js");

    const levelCards = document.querySelectorAll(".level-card");

    if (!isLogged()) {
      /* Utilizador não logado - apenas o primeiro nível desbloqueado */
      levelCards.forEach((card, index) => {
        const checkIconContainer = card.querySelector(".absolute");
        const checkIcon = checkIconContainer.querySelector(
          ".material-symbols-outlined"
        );

        if (index === 0) {
          /* Primeiro card (Explorador) sempre desbloqueado */
          checkIcon.textContent = "check_circle";
          checkIcon.className =
            "material-symbols-outlined text-green-500 text-lg";
        } else {
          /* Outros cards bloqueados */
          checkIcon.textContent = "radio_button_unchecked";
          checkIcon.className =
            "material-symbols-outlined text-gray-400 text-lg";
        }
      });
      return;
    }

    const user = getUserLogged();

    /* Atualizar cada card baseado nos pontos do utilizador */
    levelCards.forEach((card) => {
      const levelName = card.querySelector("h3").textContent;
      const checkIconContainer = card.querySelector(".absolute");
      const checkIcon = checkIconContainer.querySelector(
        ".material-symbols-outlined"
      );

      if (hasReachedLevel(user.points, levelName)) {
        checkIcon.textContent = "check_circle";
        checkIcon.className =
          "material-symbols-outlined text-green-500 text-lg";
      } else {
        checkIcon.textContent = "radio_button_unchecked";
        checkIcon.className = "material-symbols-outlined text-gray-400 text-lg";
      }
    });
  } catch (error) {
    console.error("Erro ao marcar níveis atingidos:", error);
  }
}

/* Função para testar com dados de utilizador */
export function testUserData(userData) {
  /* Simular utilizador logado para testes */
  sessionStorage.setItem("loggedUser", JSON.stringify(userData));

  /* Recarregar informações da página */
  loadUserInfo();
  markAchievedLevels();
}

/* Inicializar página RewardIt */
export function initRewarditPage() {
  loadComponents();
  setTimeout(() => {
    loadUserInfo();
    markAchievedLevels();
  }, 100);
}
