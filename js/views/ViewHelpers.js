// ViewHelpers.js – funções de UI para as Views

import {
  getUserPreference,
  setUserPreference,
  isSystemDarkTheme,
  getThemePreference,
} from "../models/ModelHelpers.js";

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "Main-Background": "#FFFFFF",
        "Main-Card-Bg-Gami": "#F7F7F7",
        "Main-Primary": "#1B9AAA",
        "Main-Gray": "#F0F0F0",
        "Main-Secondary": "#126B76",
        "brand-secondary": "#126B76",
        "Text-Titles": "#222222",
        "Text-Body": "#222222",
        "Text-Subtitles": "#808080",
        "Button-Main": "#126B76",
        "Components-Limit-Color":
          "linear-gradient(90deg, #1B9AAA 0%, #126B76 100%)",
        "Components-Mapa-Fundo": "#6CD2E7",
        "Background-Card-Bg-Gami": "#F7F7F7",
        primary: "#0891b2",
        "primary-dark": "#0e7490",
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          "Space Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
    },
  },
};

export function showCookieBanner() {
  // Só mostra se ainda não foi aceite
  if (getUserPreference("cookieAccepted") === "true") return;

  // Cria o banner
  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.className = `
    fixed left-1/2 bottom-8 transform -translate-x-1/2 z-50
    w-[95vw] max-w-xl md:max-w-3xl px-4 py-4
    bg-background-background rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-4
  `;

  banner.innerHTML = `
    <div id="banner" class="fixed rounded-xl border border-gray-200 bottom-0 left-0 right-0 z-50 p-4 flex items-center justify-center space-x-4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm">
  <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow">
    <img class="w-7 h-7" src="./img/cookie.svg" alt="cookie">
  </div>
  <div class="flex-1 text-text-body text-xs md:text-sm font-normal font-['IBM_Plex_Sans'] uppercase tracking-wide text-center md:text-left text-black">
    Usamos cookies para personalizar a sua experiência, recomendações e medir o desempenho do site. Ao usar o nosso site, concorda com a nossa política de privacidade.
  </div>
  <button id="accept-cookies-btn"
    class="px-6 py-2 bg-cyan-800 hover:bg-cyan-700 rounded-full text-white text-sm font-bold font-['IBM_Plex_Sans'] uppercase tracking-wider transition"
  >Aceitar</button>
</div>
  `;

  document.body.appendChild(banner);

  document.getElementById("accept-cookies-btn").onclick = () => {
    setUserPreference("cookieAccepted", "true");
    banner.remove();
  };
}

export function getFormData(formId) {
  const form = document.getElementById(formId);
  const data = {};
  for (let el of form.elements) {
    const key = el.name || el.id;
    if (key) data[key] = el.value;
  }
  return data;
}

export function showToast(msg, type = "success") {
  /* mostra um toast com animação suave */
  const toast = document.createElement("div");
  toast.className = `fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg z-50
        ${
          type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }
        transition-all duration-500 ease-in-out opacity-0 translate-y-4
  `;
  toast.innerText = msg;
  document.body.appendChild(toast);

  /* força o reflow para ativar a transição */
  void toast.offsetWidth;

  /* aplica o efeito de fade in */
  toast.classList.remove("opacity-0", "translate-y-4");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    /* fade out */
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-4");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

export function closeModal(modalId, formId, modalTitle) {
  document.getElementById(modalId).classList.add("hidden");
  document.getElementById(formId).reset();
  document.querySelector(`#${modalId} h2`).innerText = modalTitle;
}

export function selectOptions(items, selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = "";
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent =
      item.name ||
      item.destination_city ||
      item.username ||
      item.aero_code ||
      item;
    sel.appendChild(opt);
  });
}

export function updatePaginationControls(config) {
  const { data, rowsPerPage = 10, currentPage = 1, onPageChange } = config;
  const container = document.getElementById("pagination-controls");
  if (!container) return;
  container.innerHTML = "";
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const makeBtn = (label, page, disabled = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled) btn.addEventListener("click", () => onPageChange(page));
    return btn;
  };
  container.appendChild(
    makeBtn("<", currentPage > 1 ? currentPage - 1 : 1, currentPage <= 1)
  );
  for (let p = 1; p <= totalPages; p++) {
    container.appendChild(makeBtn(p, p, p === currentPage));
  }
  container.appendChild(
    makeBtn(
      ">",
      currentPage < totalPages ? currentPage + 1 : totalPages,
      currentPage >= totalPages
    )
  );
}

export function updateTable(config) {
  const {
    data,
    columns,
    actions,
    rowsPerPage = 10,
    currentPage = 1,
    onPageChange,
  } = config;
  const tbody = document.getElementById("tableContent");
  if (!tbody) return;
  tbody.innerHTML = "";
  const start = (currentPage - 1) * rowsPerPage;
  const slice = data.slice(start, start + rowsPerPage);
  slice.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = "table-row h-[42px]";
    columns.forEach((col) => {
      const td = document.createElement("td");
      td.className =
        "table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-[`IBM_Plex_Sans`]";
      td.textContent = item[col.key] ?? "";
      tr.appendChild(td);
    });
    if (actions) {
      const td = document.createElement("td");
      td.className =
        "table-cell w-48 py-3.5 outline outline-[3px] outline-offset-[-3px] outline-neutral-100 inline-flex justify-center items-center text-center";
      actions.forEach((a) => {
        const btn = document.createElement("button");
        btn.textContent = a.icon;
        btn.className = `material-symbols-outlined cursor-pointer mr-6 ${a.class}`;
        btn.addEventListener("click", () => a.handler(item.id));
        td.appendChild(btn);
      });
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  if (typeof onPageChange === "function") {
    updatePaginationControls({ data, rowsPerPage, currentPage, onPageChange });
  }
}

/* navegação dos links do footer */
function initFooterNavigation() {
  const footerLinks = document.querySelectorAll(".footer-link");

  footerLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = this.dataset.staticPage;
      navigateToStatic(page);
    });
  });
}

/* determina o caminho correto baseado na localização atual */
function navigateToStatic(page) {
  const currentPath = window.location.pathname;
  let basePath = "";

  /* se estivermos no index ou root */
  if (
    currentPath.endsWith("/") ||
    currentPath.endsWith("/index.html") ||
    currentPath.split("/").pop() === "index.html"
  ) {
    basePath = "./html/";
  } else {
    /* se estivermos numa página dentro da pasta html */
    basePath = "./";
  }

  window.location.href = basePath + "static_" + page + ".html";
}

// Função para carregar um componente HTML num elemento pelo seu ID
export function loadComponent(componentPath, elementId) {
  fetch(componentPath)
    .then((response) => {
      if (!response.ok)
        throw new Error("Erro ao carregar componente: " + componentPath);
      return response.text();
    })
    .then((html) => {
      document.getElementById(elementId).innerHTML = html;
      /* Se for o header, inicializar */
      if (componentPath.includes("_header.html")) {
        setTimeout(() => {
          /* Inicializar tema */
          const themeToggle = document.getElementById("theme-toggle");
          const profileIcon = document.getElementById("profile");

          if (themeToggle) {
            const isDark = document.documentElement.classList.contains("dark");
            themeToggle.textContent = isDark ? "light_mode" : "dark_mode";
            themeToggle.addEventListener("click", () =>
              toggleThemeIcon(themeToggle)
            );
          }

          if (profileIcon) {
            profileIcon.addEventListener("click", () => {
              console.log("clicked");
            });
          }

          /* Executar scripts do header */
          const scripts = document.querySelectorAll(
            "#header-placeholder script"
          );
          scripts.forEach((script) => {
            try {
              eval(script.innerHTML);
            } catch (error) {
              console.log("Erro ao executar script:", error);
            }
          });

          /* Chamar setupMenu se existir */
          if (typeof window.setupMenu === "function") {
            setTimeout(window.setupMenu, 100);
          }
        }, 200);
      }

      // Se for o footer, inicializar a navegação
      if (componentPath.includes("_footer.html")) {
        initFooterNavigation();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// Alterna o ícone entre dark_mode e light_mode para um elemento passado
export function toggleThemeIcon(element) {
  if (!element) return;
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");
  if (isDark) {
    html.classList.remove("dark");
    element.textContent = "dark_mode";
    setUserPreference("theme", "light");
  } else {
    html.classList.add("dark");
    element.textContent = "light_mode";
    setUserPreference("theme", "dark");
  }
}

// Aplica o tema guardado no localStorage ou a preferência do sistema ao carregar a página
function applyStoredTheme() {
  const html = document.documentElement;
  const theme = getThemePreference();

  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}
applyStoredTheme();

// Carregar header automaticamente se existir o placeholder
document.addEventListener("DOMContentLoaded", () => {
  // Determina o caminho base (root)
  let root = "/"; // Por defeito, para index.html
  if (
    !window.location.pathname.endsWith("/") &&
    !window.location.pathname.endsWith("/index.html")
  ) {
    root = "../";
  }

  if (document.getElementById("header-placeholder")) {
    loadComponent(`${root}html/_header.html`, "header-placeholder");
  }
  if (document.getElementById("footer-placeholder")) {
    loadComponent(`${root}html/_footer.html`, "footer-placeholder");
  }
  if (document.getElementById("menu-placeholder")) {
    loadComponent(`${root}html/_menu.html`, "menu-placeholder");
  }
});

export function getUserLocation(callback) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      callback({ latitude, longitude });
    },
    (error) => {
      console.error("Erro ao obter localização:", error);
      callback(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

export function compareLocation(userLocation, location) {
  if (
    !userLocation ||
    !location ||
    typeof userLocation.latitude !== "number" ||
    typeof userLocation.longitude !== "number" ||
    typeof location.latitude !== "number" ||
    typeof location.longitude !== "number"
  ) {
    return Infinity;
  }
  const distance = Math.sqrt(
    Math.pow(userLocation.latitude - location.latitude, 2) +
      Math.pow(userLocation.longitude - location.longitude, 2)
  );
  return distance;
}

export function closestAirport(userLocation, locationArray) {
  let closest = null;
  let minDistance = Infinity;

  locationArray.forEach((location) => {
    if (!location || !location.location) return;
    const distance = compareLocation(userLocation, location.location);
    if (distance < minDistance) {
      minDistance = distance;
      closest = location;
    }
  });

  return closest;
}
