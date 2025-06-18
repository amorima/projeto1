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
import * as User from "../models/UserModel.js";
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
    "Explorador": 0,
    "Viajante": 250,
    "Aventureiro": 1500,
    "Globetrotter": 3000,
    "Embaixador": 5000
  };
  // Normalize the target level name (trim whitespace and handle variations)
  const normalizedTarget = targetLevel.trim();
  // Check if the level exists in our thresholds
  if (levelThresholds.hasOwnProperty(normalizedTarget)) {
    return points >= levelThresholds[normalizedTarget];
  }
  // Fallback: try to match by partial name or alternative spellings
  const levelEntries = Object.entries(levelThresholds);
  for (const [level, threshold] of levelEntries) {
    if (level.toLowerCase().includes(normalizedTarget.toLowerCase()) || 
        normalizedTarget.toLowerCase().includes(level.toLowerCase())) {
      return points >= threshold;
    }
  }
  return false;
}
/* Obter nível do utilizador baseado nos pontos */
export function getUserLevelByPoints(points) {
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
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  if (!progressBar) return;
  let progress = 0;
  let maxPoints = 0;
  if (points < 250) {
    progress = (points / 250) * 20; // 0-20%
    maxPoints = 250;
  } else if (points < 1500) {
    progress = 20 + ((points - 250) / 1250) * 20; // 20-40%
    maxPoints = 1500;
  } else if (points < 3000) {
    progress = 40 + ((points - 1500) / 1500) * 20; // 40-60%
    maxPoints = 3000;
  } else if (points < 5000) {
    progress = 60 + ((points - 3000) / 2000) * 20; // 60-80%
    maxPoints = 5000;
  } else {
    progress = 100; // 100%
    maxPoints = 5000;
  }
  progressBar.style.width = `${Math.min(progress, 100)}%`;
  if (progressText) {
    progressText.textContent = `${points} / ${maxPoints} pontos`;
  }
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
    const userPointsElement = document.getElementById("userPoints");
    if (!isLogged()) {
      /* Utilizador não logado - manter valores por defeito */
      if (userNameElement) userNameElement.textContent = "Utilizador";
      if (userLevelElement) userLevelElement.textContent = "Explorador";
      if (userLevelIcon) userLevelIcon.textContent = "explore";
      if (pointsNeededElement) pointsNeededElement.textContent = "250";
      if (nextLevelElement) nextLevelElement.textContent = "Viajante";
      if (userPointsElement) userPointsElement.textContent = "0";
      return;
    }
    const user = getUserLogged();
    const userPoints = parseInt(user.pontos) || 0;
    const userLevel = getUserLevelByPoints(userPoints);
    /* Atualizar nome, nível e pontos do utilizador */
    if (userNameElement) userNameElement.textContent = user.username || user.name || "Utilizador";
    if (userLevelElement) userLevelElement.textContent = userLevel;
    if (userLevelIcon) userLevelIcon.textContent = getLevelSymbol(userLevel);
    if (userPointsElement) userPointsElement.textContent = userPoints;
    /* Calcular pontos necessários para próximo nível */
    const nextLevelInfo = getNextLevelInfo(userPoints);
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
    /* Atualizar barra de progresso */
    updateProgressBar(userPoints);
  } catch (error) {
  }
}
/* Marcar níveis atingidos pelo utilizador */
async function markAchievedLevels() {
  try {
    const { getUserLogged, isLogged } = await import("../models/UserModel.js");
    const levelCards = document.querySelectorAll(".level-card");
    let userPoints = 0;
    if (isLogged()) {
      const user = getUserLogged();
      userPoints = parseInt(user.pontos) || 0;
    }    /* Atualizar cada card baseado nos pontos do utilizador */
    levelCards.forEach((card) => {
      const levelNameElement = card.querySelector("h3");
      if (!levelNameElement) return;
      const levelName = levelNameElement.textContent.trim();
      const checkIconContainer = card.querySelector(".absolute");
      const checkIcon = checkIconContainer?.querySelector(
        ".material-symbols-outlined"
      );
      if (checkIcon && hasReachedLevel(userPoints, levelName)) {
        // Update check icon
        checkIcon.textContent = "check_circle";
        checkIcon.className = "material-symbols-outlined text-green-500 text-lg";
        // Update card visual state (unlocked)
        card.classList.remove("opacity-50");
        card.classList.add("ring-2", "ring-green-500");
        // Update card content colors
        const mainIcon = card.querySelector(".text-center > .material-symbols-outlined");
        const title = card.querySelector("h3");
        const pointsText = card.querySelector("p.uppercase");
        const benefitTexts = card.querySelectorAll(".mt-4 p");
        const cumulativeText = card.querySelector("p.font-bold.uppercase");
        if (mainIcon) {
          mainIcon.className = mainIcon.className.replace("text-gray-500 dark:text-gray-400", "text-cyan-600 dark:text-cyan-400");
        }
        if (title) {
          title.className = title.className.replace("text-gray-500 dark:text-gray-400", "text-gray-800 dark:text-gray-200");
        }
        if (pointsText) {
          pointsText.className = pointsText.className.replace("text-gray-500 dark:text-gray-400", "text-gray-600 dark:text-gray-400");
        }
        benefitTexts.forEach(text => {
          if (text.parentElement.classList.contains("mt-4") && !text.classList.contains("font-bold")) {
            text.className = text.className.replace("text-gray-500 dark:text-gray-400", "text-gray-700 dark:text-gray-300");
          }
        });
        if (cumulativeText) {
          cumulativeText.className = cumulativeText.className.replace("text-gray-500 dark:text-gray-400", "text-gray-600 dark:text-gray-400");
        }
      } else if (checkIcon) {
        // Update check icon
        checkIcon.textContent = "radio_button_unchecked";
        checkIcon.className = "material-symbols-outlined text-gray-400 text-lg";
        // Update card visual state (locked)
        card.classList.add("opacity-50");
        card.classList.remove("ring-2", "ring-green-500");
        // Update card content colors to gray
        const mainIcon = card.querySelector(".text-center > .material-symbols-outlined");
        const title = card.querySelector("h3");
        const pointsText = card.querySelector("p.uppercase");
        const benefitTexts = card.querySelectorAll(".mt-4 p");
        const cumulativeText = card.querySelector("p.font-bold.uppercase");
        if (mainIcon) {
          mainIcon.className = mainIcon.className.replace("text-cyan-600 dark:text-cyan-400", "text-gray-500 dark:text-gray-400");
        }
        if (title) {
          title.className = title.className.replace("text-gray-800 dark:text-gray-200", "text-gray-500 dark:text-gray-400");
        }
        if (pointsText) {
          pointsText.className = pointsText.className.replace("text-gray-600 dark:text-gray-400", "text-gray-500 dark:text-gray-400");
        }
        benefitTexts.forEach(text => {
          if (text.parentElement.classList.contains("mt-4") && !text.classList.contains("font-bold")) {
            text.className = text.className.replace("text-gray-700 dark:text-gray-300", "text-gray-500 dark:text-gray-400");
          }
        });
        if (cumulativeText) {
          cumulativeText.className = cumulativeText.className.replace("text-gray-600 dark:text-gray-400", "text-gray-500 dark:text-gray-400");
        }
      }
    });
  } catch (error) {
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
  // Aguardar que os modelos estejam carregados
  setTimeout(() => {
    loadUserInfo();
    markAchievedLevels();
    updateUserAvatar();
    loadUserBenefits();
  }, 100);
}
/* Recarregar dados do utilizador (útil após login/logout) */
export function refreshUserData() {
  loadUserInfo();
  markAchievedLevels();
  updateUserAvatar();
  loadUserBenefits();
}
/* Atualizar avatar do utilizador */
async function updateUserAvatar() {
  try {
    const { getUserLogged, isLogged, getUserImage } = await import("../models/UserModel.js");
    const userAvatarElement = document.getElementById("userAvatar");
    if (!userAvatarElement) return;
      if (!isLogged()) {
      // Avatar padrão para utilizador não logado
      userAvatarElement.src = "https://placehold.co/80x80/6b7280/ffffff?text=U";
      return;
    }
      const user = getUserLogged();
    const avatarUrl = getUserImage(user.username) || user.avatar || 
      "https://placehold.co/80x80/6b7280/ffffff?text=" + encodeURIComponent((user.username || 'U').charAt(0).toUpperCase());
    userAvatarElement.src = avatarUrl;
    userAvatarElement.alt = `Avatar de ${user.username || 'Utilizador'}`;
  } catch (error) {
  }
}
/* Carregar benefícios específicos do utilizador */
async function loadUserBenefits() {
  try {
    const { getUserLogged, isLogged } = await import("../models/UserModel.js");
    const benefitsContainer = document.getElementById("userBenefits");
    if (!benefitsContainer) return;
    let userLevel = "Explorador";
    let userPoints = 0;
    if (isLogged()) {
      const user = getUserLogged();
      userPoints = parseInt(user.pontos) || 0;
      userLevel = getUserLevelByPoints(userPoints);
    }
    const benefits = getUserBenefitsByLevel(userLevel);
    benefitsContainer.innerHTML = benefits.map(benefit => `
      <div class="benefit-item p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-cyan-600 dark:text-cyan-400">${benefit.icon}</span>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white">${benefit.title}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">${benefit.description}</p>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
  }
}
/* Obter benefícios baseados no nível do utilizador */
function getUserBenefitsByLevel(level) {
  const allBenefits = {
    "Explorador": [
      { icon: "explore", title: "Exploração Básica", description: "Acesso a destinos básicos" },
      { icon: "star", title: "Pontos Base", description: "Ganha pontos em cada viagem" }
    ],
    "Viajante": [
      { icon: "flight_takeoff", title: "Prioridade de Embarque", description: "Embarque prioritário em voos" },
      { icon: "luggage", title: "Bagagem Extra", description: "5kg extras de bagagem gratuita" },
      { icon: "percent", title: "Desconto 5%", description: "5% de desconto em todas as reservas" }
    ],
    "Aventureiro": [
      { icon: "hiking", title: "Atividades Premium", description: "Acesso a atividades exclusivas" },
      { icon: "hotel", title: "Upgrade de Quarto", description: "Upgrade gratuito quando disponível" },
      { icon: "percent", title: "Desconto 10%", description: "10% de desconto em todas as reservas" }
    ],
    "Globetrotter": [
      { icon: "public", title: "Lounge VIP", description: "Acesso a lounges em aeroportos" },
      { icon: "restaurant", title: "Refeições Premium", description: "Refeições especiais em voos" },
      { icon: "percent", title: "Desconto 15%", description: "15% de desconto em todas as reservas" }
    ],
    "Embaixador": [
      { icon: "military_tech", title: "Concierge Pessoal", description: "Assistente pessoal de viagem" },
      { icon: "diamond", title: "Experiências Exclusivas", description: "Acesso a experiências únicas" },
      { icon: "percent", title: "Desconto 20%", description: "20% de desconto em todas as reservas" }
    ]
  };
  const userBenefits = [];
  const levels = ["Explorador", "Viajante", "Aventureiro", "Globetrotter", "Embaixador"];
  const currentLevelIndex = levels.indexOf(level);
  // Adicionar benefícios de todos os níveis até o atual
  for (let i = 0; i <= currentLevelIndex; i++) {
    userBenefits.push(...allBenefits[levels[i]]);
  }
  return userBenefits;
}
