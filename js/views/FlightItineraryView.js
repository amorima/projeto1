import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
} from "./ViewHelpers.js";

import * as HotelModel from "../models/HotelModel.js";
import * as ActivityModel from "../models/ActivityModel.js";
import * as FlightModel from "../models/FlightModel.js";

const btnMais = document.getElementById("btn-mais");
const btnMenos = document.getElementById("btn-menos");
const inputPessoas = document.getElementById("input-pessoas");
const btnReservar = document.querySelector(
  "button.w-full.bg-Button-Main, button.w-full.bg-Button-Main.dark\\:bg-cyan-400"
);

if (btnMais && btnMenos && inputPessoas) {
  btnMais.onclick = function () {
    let valor = parseInt(inputPessoas.value, 10);
    if (valor < 15) {
      inputPessoas.value = valor + 1;
    } else {
      showToast("O máximo de pessoas é 15.", "error");
    }
  };

  btnMenos.onclick = function () {
    let valor = parseInt(inputPessoas.value, 10);
    if (valor > 1) {
      inputPessoas.value = valor - 1;
    }
  };

  inputPessoas.oninput = function () {
    let valor = parseInt(inputPessoas.value, 10);
    if (isNaN(valor) || valor < 1) {
      inputPessoas.value = 1;
    }
    if (valor > 15) {
      showToast("O máximo de pessoas é 15.", "error");
      inputPessoas.value = 15;
    }
  };
}

if (btnReservar) {
  btnReservar.onclick = function () {
    showToast("Viagem reservada!", "success");

    if (
      !window.customElements ||
      !window.customElements.get("dotlottie-player")
    ) {
      let script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      script.onload = function () {
        mostrarConfettiNoToast();
      };
      document.body.appendChild(script);
      setTimeout(mostrarConfettiNoToast, 500);
    } else {
      mostrarConfettiNoToast();
    }
  };
}

function mostrarConfettiNoToast() {
  let toast = document.querySelector(".fixed.bottom-5.right-5");

  let confettiDiv = document.createElement("div");
  confettiDiv.style.position = "fixed";
  confettiDiv.style.right = "-50px"; /* um pouco para dentro do canto */
  confettiDiv.style.bottom = "-50px"; /* um pouco para dentro do canto */
  confettiDiv.style.width = "300px";
  confettiDiv.style.height = "300px";
  confettiDiv.style.zIndex = "49"; /* abaixo do toast (que é z-50) */
  confettiDiv.style.pointerEvents =
    "none"; /* para não interferir com cliques */
  confettiDiv.innerHTML = `
      <dotlottie-player src="https://lottie.host/639683f1-4beb-47c3-bda1-a0270b3a9600/Qg9ZzwHWqP.lottie" background="transparent" speed="1" style="width: 300px; height: 300px" loop autoplay></dotlottie-player>
    `;
  document.body.appendChild(confettiDiv);

  setTimeout(function () {
    confettiDiv.remove();
  }, 2000);
}

const favItinerary = document.getElementById("fav-itinerary");
if (favItinerary) {
  favItinerary.style.userSelect = "none";
  favItinerary.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });
  favItinerary.addEventListener("click", function () {
    const icon = favItinerary.querySelector("span");
    const isFav = favItinerary.getAttribute("data-favorito") === "true";
    favItinerary.setAttribute("data-favorito", String(!isFav));
    if (!isFav) {
      icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      icon.style.fontVariationSettings = "'FILL' 0";
    }
    icon.classList.add("scale-110");
    setTimeout(function () {
      icon.classList.remove("scale-110");
    }, 150);
  });
}

function carregarHoteis() {
  try {
    const hoteis = HotelModel.init();
    const primeirosHoteis = HotelModel.getFirst(5);

    const containerHoteis = document.getElementById("container-hoteis");

    if (containerHoteis && primeirosHoteis.length > 0) {
      containerHoteis.innerHTML = "";

      primeirosHoteis.forEach((hotel) => {
        const divHotel = document.createElement("div");
        divHotel.className =
          "flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700";

        const divInfo = document.createElement("div");
        divInfo.className = "flex items-center gap-3";

        const imgHotel = document.createElement("img");
        imgHotel.src = hotel.foto || "https://placehold.co/60x40";
        imgHotel.alt = hotel.nome;
        imgHotel.className = "w-16 h-10 object-cover rounded-lg";

        const divNomeInfo = document.createElement("div");
        divNomeInfo.className = "flex flex-col";

        const spanNome = document.createElement("span");
        spanNome.className = "font-semibold";
        spanNome.textContent = hotel.nome;

        const divDetalhes = document.createElement("div");
        divDetalhes.className =
          "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300";

        if (hotel.quartos && hotel.quartos.length > 0) {
          const quarto = hotel.quartos[0];

          const spanCama = document.createElement("span");
          spanCama.className = "flex items-center gap-1";
          spanCama.innerHTML = `<span class="material-symbols-outlined text-sm">bed</span>${quarto.camas}`;

          const spanPessoa = document.createElement("span");
          spanPessoa.className = "flex items-center gap-1";
          spanPessoa.innerHTML = `<span class="material-symbols-outlined text-sm">person</span>${quarto.capacidade}`;

          divDetalhes.appendChild(spanCama);
          divDetalhes.appendChild(spanPessoa);
        }

        divNomeInfo.appendChild(spanNome);
        divNomeInfo.appendChild(divDetalhes);

        divInfo.appendChild(imgHotel);
        divInfo.appendChild(divNomeInfo);

        const divPreco = document.createElement("div");
        divPreco.className = "flex items-center gap-3";

        if (hotel.quartos && hotel.quartos.length > 0) {
          const spanPreco = document.createElement("span");
          spanPreco.className = "font-bold text-cyan-700 dark:text-cyan-400";
          spanPreco.textContent = `${hotel.quartos[0].precoNoite}€/noite`;
          divPreco.appendChild(spanPreco);
        }

        const spanAdicionar = document.createElement("span");
        spanAdicionar.className =
          "material-symbols-outlined text-2xl text-gray-400 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400";
        spanAdicionar.textContent = "add_circle";

        spanAdicionar.onclick = function (e) {
          e.stopPropagation();
          showToast("Hotel adicionado!", "success");
        };

        divPreco.appendChild(spanAdicionar);

        divHotel.appendChild(divInfo);
        divHotel.appendChild(divPreco);

        containerHoteis.appendChild(divHotel);
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar hoteis:", erro);
  }
}

function carregarActividades() {
  try {
    const atividades = ActivityModel.init();
    const primeirasAtividades = ActivityModel.getFirst(5);

    const containerAtividades = document.getElementById("container-atividades");

    if (containerAtividades && primeirasAtividades.length > 0) {
      containerAtividades.innerHTML = "";

      primeirasAtividades.forEach((atividade) => {
        const divAtividade = document.createElement("div");
        divAtividade.className =
          "flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700";

        const divInfo = document.createElement("div");
        divInfo.className = "flex items-center gap-3";

        const imgAtividade = document.createElement("img");
        imgAtividade.src = atividade.foto || "https://placehold.co/60x40";
        imgAtividade.alt = atividade.nome;
        imgAtividade.className = "w-16 h-10 object-cover rounded-lg";

        const divNomeInfo = document.createElement("div");
        divNomeInfo.className = "flex flex-col";

        const spanNome = document.createElement("span");
        spanNome.className = "font-semibold";
        spanNome.textContent = atividade.nome;

        const divDetalhes = document.createElement("div");
        divDetalhes.className =
          "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300";

        let icone = "tour";
        if (atividade.tipoTurismo.includes("Gastronomic")) {
          icone = "restaurant";
        } else if (atividade.tipoTurismo.includes("Cultural")) {
          icone = "museum";
        } else if (atividade.tipoTurismo.includes("Urbano")) {
          icone = "location_city";
        } else if (atividade.tipoTurismo.includes("Religioso")) {
          icone = "church";
        }

        const spanTipo = document.createElement("span");
        spanTipo.className = "flex items-center gap-1";
        spanTipo.innerHTML = `<span class="material-symbols-outlined text-sm">${icone}</span>${atividade.tipoTurismo}`;

        divDetalhes.appendChild(spanTipo);
        divNomeInfo.appendChild(spanNome);
        divNomeInfo.appendChild(divDetalhes);
        divInfo.appendChild(imgAtividade);
        divInfo.appendChild(divNomeInfo);

        const divBotoes = document.createElement("div");
        divBotoes.className = "flex items-center gap-3";

        const spanAdicionar = document.createElement("span");
        spanAdicionar.className =
          "material-symbols-outlined text-2xl text-gray-400 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400";
        spanAdicionar.textContent = "add_circle";

        spanAdicionar.onclick = function (e) {
          e.stopPropagation();
          showToast("Atividade adicionada!", "success");
        };

        divBotoes.appendChild(spanAdicionar);

        divAtividade.appendChild(divInfo);
        divAtividade.appendChild(divBotoes);

        containerAtividades.appendChild(divAtividade);
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar atividades:", erro);
  }
}

function adicionarEventosCarros() {
  const botoesCarro = document.querySelectorAll(".material-symbols-outlined");

  botoesCarro.forEach(function (botao) {
    if (botao.textContent === "add_circle") {
      let elementoPai = botao.parentElement;
      while (elementoPai && !elementoPai.querySelector("h2")) {
        elementoPai = elementoPai.parentElement;
      }

      if (
        elementoPai &&
        elementoPai.querySelector("h2") &&
        elementoPai.querySelector("h2").textContent.includes("Aluguer de Carro")
      ) {
        botao.onclick = function () {
          showToast("Carro adicionado!", "success");
        };
      }
    }
  });

  const seccaoCarros = document.querySelectorAll(
    "div.flex.items-center.justify-between"
  );
  seccaoCarros.forEach(function (carro) {
    const botao = carro.querySelector(".material-symbols-outlined");
    if (botao && botao.textContent === "add_circle") {
      botao.onclick = function () {
        showToast("Carro adicionado!", "success");
      };
    }
  });
}

function adicionarEventoSeguro() {
  const h2Seguro = Array.from(document.querySelectorAll("h2")).find((h2) =>
    h2.textContent.includes("Seguro")
  );

  if (h2Seguro) {
    const secaoSeguro = h2Seguro.closest("div");

    if (secaoSeguro) {
      const botaoSeguro = secaoSeguro.querySelector(
        ".material-symbols-outlined"
      );
      if (botaoSeguro && botaoSeguro.textContent === "arrow_circle_right") {
        botaoSeguro.textContent = "add_circle";
        botaoSeguro.id = "btn-add-seguro";
        botaoSeguro.className =
          "material-symbols-outlined text-2xl text-gray-400 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 cursor-pointer";

        botaoSeguro.onclick = function () {
          showToast("Seguro SecureIt adicionado!", "success");
        };
      }
    }
  }

  const btnAddSeguro = document.getElementById("btn-add-seguro");
  if (btnAddSeguro) {
    btnAddSeguro.onclick = function () {
      showToast("Seguro SecureIt adicionado!", "success");
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Buscar o numeroVoo da query string
  const params = new URLSearchParams(window.location.search);
  const numeroVoo = params.get("id");
  if (numeroVoo) {
    FlightModel.init();
    const voo = FlightModel.getByNumeroVoo(numeroVoo);
    if (voo) {
      atualizarHeroVoo(voo);
      atualizarItinerarioVoo(voo);
    }
  }
  carregarHoteis();
  carregarActividades();
  setTimeout(function () {
    adicionarEventosCarros();
    adicionarEventoSeguro();
  }, 500);
});

function atualizarHeroVoo(voo) {
  // Hero: cidade destino, datas, imagem
  // Seleciona o destino no hero (ajustado para o HTML real)
  const heroCidade = document.querySelector(
    ".flex.items-center.gap-2 > div > .text-2xl.font-bold"
  );
  if (heroCidade) heroCidade.textContent = voo.destino?.split(" - ").pop() || voo.destino;
  const heroDatas = document.querySelector(
    ".flex.items-center.gap-2 > div > .inline-flex .text-base"
  );
  if (heroDatas) {
    heroDatas.textContent = FlightModel.formatDatesForDisplay(voo.partida, voo.dataVolta || voo.chegada);
  }
  const heroImg = document.querySelector(
    ".w-full.h-full.object-cover"
  );
  if (heroImg && voo.imagem) heroImg.src = voo.imagem;
}

function getLogoCompanhia(nome) {
  try {
    const companhias = JSON.parse(localStorage.getItem("companhiasAereas")) || [];
    const comp = companhias.find(c => c.nome.toLowerCase() === nome.toLowerCase());
    return comp ? comp.logo : null;
  } catch {
    return null;
  }
}

function atualizarItinerarioVoo(voo) {
  // Itinerário principal
  const itinerarioDiv = document.querySelector(
    ".bg-white.dark\\:bg-gray-900.rounded-xl.shadow-md.outline"
  );
  if (!itinerarioDiv) return;
  const img = itinerarioDiv.querySelector("img");
  if (img && voo.imagem) img.src = voo.imagem;
  // Conteúdo à esquerda
  const conteudo = itinerarioDiv.querySelector(".flex.flex-col.gap-2.text-left.flex-1");
  if (conteudo) {
    conteudo.innerHTML = `
      <span class='font-bold text-lg'>${voo.origem} → ${voo.destino}</span>
      <span class='text-gray-500'>${FlightModel.formatDatesForDisplay(voo.partida, voo.dataVolta || voo.chegada)}</span>
      <span class='text-gray-700 dark:text-gray-300'>Companhia: <b>${voo.companhia}</b></span>
      <span class='text-gray-700 dark:text-gray-300'>Nº Voo: <b>${voo.numeroVoo}</b></span>
      <span class='text-gray-700 dark:text-gray-300'>${voo.direto === 'S' ? 'Direto' : 'Com escalas'}</span>
    `;
  }
  // Imagem da companhia aérea à direita
  const companhiaDiv = itinerarioDiv.querySelector(".pl-4.flex-shrink-0.flex.items-center");
  if (companhiaDiv) {
    const logo = getLogoCompanhia(voo.companhia);
    companhiaDiv.innerHTML = logo
      ? `<img src="${logo}" alt="${voo.companhia}" class="w-16 h-16 object-contain rounded-full bg-white">`
      : `<span class='font-semibold'>${voo.companhia}</span>`;
  }
}

window.onload = function () {
  adicionarEventosCarros();
  adicionarEventoSeguro();
};
