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
// Função para carregar HTML de um ficheiro para um elemento
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

// Carregar os componentes quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("_header.html", "header-placeholder").then(() => {
    LoginNav();
  });
  loadComponent("_footer.html", "footer-placeholder");
  loadComponent("_menu.html", "menu-placeholder");
});

export function LoginNav() {
  document.getElementById("profile").addEventListener("click", () => {
    console.log("clicked");
    if (User.isLogged()) {
      //go to profile
      if(isAdmin(User.getUserLogged())){
        window.location.href = "dashboard_admin.html"
      }else{
        window.location.href = "profile.html";
      }
    } else {
      openModal("profile-modal");
      document.getElementById("").addEventListener("submit", (e) => {
        //TODO: When modal Ready add o id do form
        e.preventDefault();
        data = getFormData(""); //TODO: When modal Ready add o id do form
        username = data.username;
        email = data.email;
        password = data.password;
        User.add(username, password, email);
        User.login(username, password);
        closeModal(""); //id modal
        openModal("newletter-modal");
        document.getElementById("").addEventListener("click", () => {
          //add yes button id
          //sign for newletter
          closeModal("newsletter-modal");
        });
        document.getElementById("").addEventListener("click", () => {
          //add no button id
          closeModal("newsletter-modal");
        });
      });
    }
  });
}

export function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    // Atualiza o ícone do tema de acordo com o tema atual
    const isDark = document.documentElement.classList.contains("dark");
    themeToggle.textContent = isDark ? "light_mode" : "dark_mode";
    themeToggle.addEventListener("click", () => toggleThemeIcon(themeToggle));
  }
}

window.navbarView = {
  initThemeToggle,
  LoginNav,
};
