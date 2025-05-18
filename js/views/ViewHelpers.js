// ViewHelpers.js – funções de UI para as Views

tailwind.config = {
  theme: {
    extend: {
      colors: {
        "Main-Primary": "#1B9AAA", // cor primária
        "Main-Secondary": "#126B76",
        "brand-secondary": "#126B76", // cor secundária
        "Main-Gray": "#F0F0F0",
        "Button-Main": "#126B76", // cor secundária
        "Background-Card-Bg-Gami": "#F7F7F7",
        "Text-Subtitles": "#808080",
        "Components-Limit-Color": "", //Gradiente
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
  if (localStorage.getItem("cookieAccepted") === "true") return;

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
    <img class="w-7 h-7" src="/img/cookie.svg" alt="cookie">
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
    localStorage.setItem("cookieAccepted", "true");
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
  alert(msg);
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
    })
    .catch((error) => {
      console.error(error);
    });
}

// Carregar header automaticamente se existir o placeholder
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("header-placeholder")) {
    loadComponent("../html/_header.html", "header-placeholder");
  }
  if (document.getElementById("footer-placeholder")) {
    loadComponent("../html/_footer.html", "footer-placeholder");
  }
  if (document.getElementById("menu-placeholder")) {
    loadComponent("../html/_menu.html", "menu-placeholder");
  }
});
