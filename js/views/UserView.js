import * as UserModel from "../models/UserModel.js";
import { loadComponent } from "./ViewHelpers.js";

/* Inicializar quando a página carrega */
window.onload = function () {
  UserModel.init();
  loadComponent("_header.html", "header-placeholder");
  loadComponent("_footer.html", "footer-placeholder");
  setupLoginPage();
};

/* Configurar a página de login */
function setupLoginPage() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegisto = document.getElementById("tab-registo");
  const formLogin = document.getElementById("form-login");
  const formRegisto = document.getElementById("form-registo");
  const loginForm = document.getElementById("login-form");
  const registoForm = document.getElementById("registo-form");
  const forgotPasswordBtn = document.getElementById("forgot-password");
  const forgotModal = document.getElementById("forgot-modal");
  const closeForgotModal = document.getElementById("close-forgot-modal");
  const cancelForgot = document.getElementById("cancel-forgot");
  const forgotForm = document.getElementById("forgot-form");

  /* Alternar entre abas */
  tabLogin.onclick = function () {
    switchTab("login");
  };

  tabRegisto.onclick = function () {
    switchTab("registo");
  };

  /* Formulário de login */
  loginForm.onsubmit = function (e) {
    e.preventDefault();
    handleLogin();
  };

  /* Formulário de registo */
  registoForm.onsubmit = function (e) {
    e.preventDefault();
    handleRegisto();
  };

  /* Modal de recuperação de palavra-passe */
  forgotPasswordBtn.onclick = function () {
    forgotModal.classList.remove("hidden");
    forgotModal.classList.add("flex");
  };

  closeForgotModal.onclick = function () {
    closeForgotPasswordModal();
  };

  cancelForgot.onclick = function () {
    closeForgotPasswordModal();
  };

  forgotForm.onsubmit = function (e) {
    e.preventDefault();
    handleForgotPassword();
  };

  /* Fechar modal ao clicar fora */
  forgotModal.onclick = function (e) {
    if (e.target === forgotModal) {
      closeForgotPasswordModal();
    }
  };
}

/* Alternar entre abas */
function switchTab(tab) {
  const tabLogin = document.getElementById("tab-login");
  const tabRegisto = document.getElementById("tab-registo");
  const formLogin = document.getElementById("form-login");
  const formRegisto = document.getElementById("form-registo");

  if (tab === "login") {
    tabLogin.className =
      "flex-1 py-2 px-4 text-white text-sm font-medium rounded-md bg-white/20 dark:bg-gray-500/50 transition-all";
    tabRegisto.className =
      "flex-1 py-2 px-4 text-white/70 text-sm font-medium rounded-md transition-all hover:bg-white/10";
    formLogin.classList.remove("hidden");
    formRegisto.classList.add("hidden");
  } else {
    tabRegisto.className =
      "flex-1 py-2 px-4 text-white text-sm font-medium rounded-md bg-white/20 dark:bg-gray-500/50 transition-all";
    tabLogin.className =
      "flex-1 py-2 px-4 text-white/70 text-sm font-medium rounded-md transition-all hover:bg-white/10";
    formRegisto.classList.remove("hidden");
    formLogin.classList.add("hidden");
  }
}

/* Helper to get redirect param from URL */
function getRedirectParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect");
}

/* Processar login */
function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");
  const errorText = errorDiv.querySelector("p");

  try {
    UserModel.login(email, password);

    /* Redirecionar para a página principal ou perfil */
    const user = UserModel.getUserLogged();
    const redirect = getRedirectParam();
    if (redirect) {
      window.location.href = redirect;
    } else if (user.admin) {
      window.location.href = "dashboard_admin.html";
    } else {
      window.location.href = "user_pro.html";
    }
  } catch (error) {
    errorText.textContent = error.message;
    errorDiv.classList.remove("hidden");

    /* Esconder erro após 5 segundos */
    setTimeout(function () {
      errorDiv.classList.add("hidden");
    }, 5000);
  }
}

/* Processar registo */
function handleRegisto() {
  const nome = document.getElementById("registo-nome").value;
  const email = document.getElementById("registo-email").value;
  const password = document.getElementById("registo-password").value;
  const newsletter = document.getElementById("newsletter").checked;
  const errorDiv = document.getElementById("registo-error");
  const successDiv = document.getElementById("registo-success");
  const errorText = errorDiv.querySelector("p");
  const successText = successDiv.querySelector("p");

  try {
    UserModel.add(nome, email, password, newsletter);

    /* Mostrar sucesso */
    successText.textContent = "Conta criada com sucesso! A fazer login...";
    successDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    /* Fazer login automático */
    setTimeout(function () {
      try {
        UserModel.login(email, password);
        const redirect = getRedirectParam();
        if (redirect) {
          window.location.href = redirect;
        } else {
          window.location.href = "user_pro.html";
        }
      } catch (loginError) {
        switchTab("login");
        document.getElementById("login-email").value = email;
      }
    }, 2000);
  } catch (error) {
    errorText.textContent = error.message;
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");

    /* Esconder erro após 5 segundos */
    setTimeout(function () {
      errorDiv.classList.add("hidden");
    }, 5000);
  }
}

/* Processar recuperação de palavra-passe */
function handleForgotPassword() {
  const email = document.getElementById("forgot-email").value;
  const newPassword = document.getElementById("forgot-new-password").value;
  const errorDiv = document.getElementById("forgot-error");
  const successDiv = document.getElementById("forgot-success");
  const errorText = errorDiv.querySelector("p");
  const successText = successDiv.querySelector("p");

  try {
    UserModel.changePassword(email, newPassword);

    successText.textContent = "Palavra-passe alterada com sucesso!";
    successDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");

    /* Fechar modal após 2 segundos */
    setTimeout(function () {
      closeForgotPasswordModal();
      /* Preencher email no login */
      document.getElementById("login-email").value = email;
      switchTab("login");
    }, 2000);
  } catch (error) {
    errorText.textContent = error.message;
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");
  }
}

/* Fechar modal de recuperação */
function closeForgotPasswordModal() {
  const forgotModal = document.getElementById("forgot-modal");
  const form = document.getElementById("forgot-form");
  const errorDiv = document.getElementById("forgot-error");
  const successDiv = document.getElementById("forgot-success");

  forgotModal.classList.add("hidden");
  forgotModal.classList.remove("flex");
  form.reset();
  errorDiv.classList.add("hidden");
  successDiv.classList.add("hidden");
}
