import * as User from "../models/UserModel.js";
import {
  showCookieBanner,
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
  getUserLocation,
  closestAirport,
  openModal,
  toggleThemeIcon,
} from "./ViewHelpers.js";

/* Função para carregar HTML de um ficheiro para um elemento */
const loadComponent = async (url, placeholderId) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) {
    console.error(`Placeholder element with ID "${placeholderId}" not found.`);
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const html = await response.text();
    placeholder.innerHTML = html;
    console.log(`Component ${url} loaded into #${placeholderId}`);
  } catch (error) {
    console.error(`Error loading component ${url}:`, error);
    placeholder.innerHTML = `<p class="text-red-500">Error loading component.</p>`;
  }
};

/* Carregar os componentes quando o DOM estiver pronto - apenas se não existir header */
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("header-placeholder")) {
    loadComponent("_header.html", "header-placeholder").then(() => {
      User.init();
      updateNavbarUser();
      LoginNav();
      initThemeToggle();
    });
    loadComponent("_footer.html", "footer-placeholder");
  }
});

/* Atualizar informações do utilizador no navbar */
export function updateNavbarUser() {
  const profileElement = document.getElementById("profile");
  const profileIcon = profileElement.querySelector(
    "span.material-symbols-outlined"
  );
  const profileText = profileElement.querySelector(
    "span:not(.material-symbols-outlined)"
  );
  const mobileProfile = document.getElementById("mobile-profile");
  const mobileProfileIcon = mobileProfile
    ? mobileProfile.querySelector("span.material-symbols-outlined")
    : null;
  const mobileProfileText = mobileProfile
    ? mobileProfile.querySelector("span:not(.material-symbols-outlined)")
    : null;

  /* Elementos de logout */
  const desktopLogoutSection = document.getElementById(
    "desktop-logout-section"
  );
  const mobileLogoutSection = document.getElementById("mobile-logout-section");

  if (User.isLogged()) {
    const user = User.getUserLogged();

    /* Atualizar perfil desktop */
    if (user.avatar && user.avatar !== "") {
      profileIcon.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover">`;
      profileIcon.className = "flex items-center justify-center";
    } else {
      profileIcon.textContent = "account_circle";
      profileIcon.className =
        "material-symbols-outlined text-white dark:text-gray-100";
    }

    if (profileText) {
      profileText.textContent = user.username;
    }

    /* Atualizar perfil mobile */
    if (mobileProfileIcon) {
      if (user.avatar && user.avatar !== "") {
        mobileProfileIcon.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="w-6 h-6 rounded-full object-cover">`;
        mobileProfileIcon.className = "flex items-center justify-center";
      } else {
        mobileProfileIcon.textContent = "account_circle";
        mobileProfileIcon.className =
          "material-symbols-outlined text-white dark:text-gray-100 text-2xl";
      }
    }

    if (mobileProfileText) {
      mobileProfileText.textContent = "Perfil";
    }

    /* Mostrar logout */
    if (desktopLogoutSection) {
      desktopLogoutSection.classList.remove("hidden");
    }
    if (mobileLogoutSection) {
      mobileLogoutSection.classList.remove("hidden");
    }
  } else {
    /* Utilizador não logado - mostrar padrão */
    profileIcon.textContent = "account_circle";
    profileIcon.className =
      "material-symbols-outlined text-white dark:text-gray-100";

    if (profileText) {
      profileText.textContent = "Iniciar sessão";
    }

    if (mobileProfileIcon) {
      mobileProfileIcon.textContent = "account_circle";
      mobileProfileIcon.className =
        "material-symbols-outlined text-white dark:text-gray-100 text-2xl";
    }

    if (mobileProfileText) {
      mobileProfileText.textContent = "Perfil";
    }

    /* Esconder logout */
    if (desktopLogoutSection) {
      desktopLogoutSection.classList.add("hidden");
    }
    if (mobileLogoutSection) {
      mobileLogoutSection.classList.add("hidden");
    }
  }
}

export function LoginNav() {
  const profileElement = document.getElementById("profile");
  const mobileProfile = document.getElementById("mobile-profile");
  const desktopLogoutBtn = document.getElementById("desktop-logout-btn");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");
  const favoritesBtn = document.getElementById("favorites-btn");
  const mobileFavoritesBtn = document.getElementById("mobile-favorites-btn");

  if (profileElement) {
    /* Remover listeners antigos */
    profileElement.replaceWith(profileElement.cloneNode(true));
    const newProfileElement = document.getElementById("profile");
    newProfileElement.addEventListener("click", handleProfileClick);
  }

  if (mobileProfile) {
    /* Remover listeners antigos */
    mobileProfile.replaceWith(mobileProfile.cloneNode(true));
    const newMobileProfile = document.getElementById("mobile-profile");
    newMobileProfile.addEventListener("click", handleProfileClick);
  }

  /* Configurar botões de logout */
  if (desktopLogoutBtn) {
    desktopLogoutBtn.addEventListener("click", handleLogout);
  }

  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", handleLogout);
  }

  /* Configurar botões de favoritos */
  if (favoritesBtn) {
    favoritesBtn.addEventListener("click", handleFavoritesClick);
  }

  if (mobileFavoritesBtn) {
    mobileFavoritesBtn.addEventListener("click", handleFavoritesClick);
  }
}

function handleProfileClick() {
  if (User.isLogged()) {
    const user = User.getUserLogged();

    /* Determinar o caminho correto baseado na localização atual */
    const currentPath = window.location.pathname;
    let basePath = "";

    if (
      currentPath.endsWith("/") ||
      currentPath.endsWith("/index.html") ||
      currentPath.split("/").pop() === "index.html"
    ) {
      /* Se estivermos no index ou root */
      basePath = "./html/";
    } else {
      /* Se estivermos numa página dentro da pasta html */
      basePath = "./";
    }

    if (user.admin) {
      window.location.href = basePath + "dashboard_admin.html";
    } else {
      window.location.href = basePath + "user_pro.html";
    }
  } else {
    /* Determinar o caminho correto baseado na localização atual */
    const currentPath = window.location.pathname;
    if (
      currentPath.endsWith("/") ||
      currentPath.endsWith("/index.html") ||
      currentPath.split("/").pop() === "index.html"
    ) {
      /* Se estivermos no index ou root */
      window.location.href = "./html/_login.html";
    } else {
      /* Se estivermos numa página dentro da pasta html */
      window.location.href = "_login.html";
    }
  }
}

export function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const mobileThemeToggle = document.getElementById("mobile-theme-toggle");

  if (themeToggle) {
    /* Atualizar o ícone do tema de acordo com o tema atual */
    const isDark = document.documentElement.classList.contains("dark");
    themeToggle.textContent = isDark ? "light_mode" : "dark_mode";
    themeToggle.addEventListener("click", () => toggleThemeIcon(themeToggle));
  }

  if (mobileThemeToggle) {
    const isDark = document.documentElement.classList.contains("dark");
    const mobileIcon = mobileThemeToggle.querySelector(
      "span.material-symbols-outlined"
    );
    if (mobileIcon) {
      mobileIcon.textContent = isDark ? "light_mode" : "dark_mode";
    }
    mobileThemeToggle.addEventListener("click", () => {
      if (themeToggle) {
        themeToggle.click();
      }
    });
  }
}

/* Processar logout */
function handleLogout() {
  User.logout();

  /* Fechar menu mobile se estiver aberto */
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.style.transform = "translateX(100%)";
    document.body.style.overflow = "";
  }

  /* Atualizar navbar */
  updateNavbarUser();

  /* Redirecionar para a página principal */
  const currentPath = window.location.pathname;
  if (
    currentPath.endsWith("/") ||
    currentPath.endsWith("/index.html") ||
    currentPath.split("/").pop() === "index.html"
  ) {
    /* Se estivermos no index, apenas recarregar */
    window.location.reload();
  } else {
    /* Se estivermos numa página dentro da pasta html, voltar ao index */
    window.location.href = "../index.html";
  }
}

/* Processar clique nos favoritos */
function handleFavoritesClick() {
  /* Fechar menu mobile se estiver aberto */
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.style.transform = "translateX(100%)";
    document.body.style.overflow = "";
  }

  if (User.isLogged()) {
    /* Utilizador logado - ir para user_pro.html */
    const currentPath = window.location.pathname;

    if (
      currentPath.endsWith("/") ||
      currentPath.endsWith("/index.html") ||
      currentPath.split("/").pop() === "index.html"
    ) {
      /* Se estivermos no index ou root */
      window.location.href = "./html/user_pro.html";
    } else {
      /* Se estivermos numa página dentro da pasta html */
      window.location.href = "user_pro.html";
    }
  } else {
    /* Utilizador não logado - ir para login */
    const currentPath = window.location.pathname;

    if (
      currentPath.endsWith("/") ||
      currentPath.endsWith("/index.html") ||
      currentPath.split("/").pop() === "index.html"
    ) {
      /* Se estivermos no index ou root */
      window.location.href = "./html/_login.html";
    } else {
      /* Se estivermos numa página dentro da pasta html */
      window.location.href = "_login.html";
    }
  }
}

window.navbarView = {
  initThemeToggle,
  LoginNav,
  updateNavbarUser,
};
