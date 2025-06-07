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

// Função para associar o evento de login ao ícone de perfil
export function LoginNav() {
  const profileIcon = document.getElementById("profile");
  if (!profileIcon) return;
  // Remove todos os event listeners antigos
  const newProfileIcon = profileIcon.cloneNode(true);
  profileIcon.parentNode.replaceChild(newProfileIcon, profileIcon);
  newProfileIcon.addEventListener("click", () => {
    if (User.isLogged()) {
      if (isAdmin(User.getUserLogged())) {
        window.location.href = "dashboard_admin.html";
      } else {
        window.location.href = "profile.html";
      }
    } else {
      openModal("profile-modal");
      const loginForm = document.getElementById("login-form");
      if (!loginForm) return;
      const newLoginForm = loginForm.cloneNode(true);
      loginForm.parentNode.replaceChild(newLoginForm, loginForm);
      newLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = getFormData("login-form");
        const username = data.username;
        const email = data.email;
        const password = data.password;
        User.add(username, password, email);
        User.login(username, password);
        closeModal("profile-modal");
        openModal("newsletter-modal");
        // Newsletter buttons
        const yesBtn = document.getElementById("newsletter-yes");
        const noBtn = document.getElementById("newsletter-no");
        if (yesBtn) {
          const newYesBtn = yesBtn.cloneNode(true);
          yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
          newYesBtn.addEventListener("click", () => {
            closeModal("newsletter-modal");
          });
        }
        if (noBtn) {
          const newNoBtn = noBtn.cloneNode(true);
          noBtn.parentNode.replaceChild(newNoBtn, noBtn);
          newNoBtn.addEventListener("click", () => {
            closeModal("newsletter-modal");
          });
        }
      });
    }
  });
}

// Função para associar o evento de alternância de tema
export function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;
  const newThemeToggle = themeToggle.cloneNode(true);
  themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
  const isDark = document.documentElement.classList.contains("dark");
  newThemeToggle.textContent = isDark ? "light_mode" : "dark_mode";
  newThemeToggle.addEventListener("click", () => toggleThemeIcon(newThemeToggle));
}

window.navbarView = {
  initThemeToggle,
  LoginNav,
};
