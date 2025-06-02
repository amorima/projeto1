import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
} from "./ViewHelpers.js";

import * as HotelModel from "../models/HotelModel.js";

/* Controlos de número de pessoas */
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

/* efeito ao reservar viagem */
if (btnReservar) {
  btnReservar.onclick = function () {
    /* mostra toast verde */
    showToast("Viagem reservada!", "success");

    /* carrega o dotlottie-player só se não existir */
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
      /* fallback para o caso de o onload não disparar a tempo */
      setTimeout(mostrarConfettiNoToast, 500);
    } else {
      mostrarConfettiNoToast();
    }
  };
}

/* função para mostrar o lottie atrás do toast */
function mostrarConfettiNoToast() {
  /* procura o toast mais recente para referência, embora não seja estritamente necessário para posicionar o lottie */
  let toast = document.querySelector(".fixed.bottom-5.right-5");

  /* cria o container do lottie */
  let confettiDiv = document.createElement("div");
  /* posiciona o lottie no canto inferior direito, atrás do toast */
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
  /* adiciona o lottie ao corpo do documento */
  document.body.appendChild(confettiDiv);

  /* remove o lottie depois de 2.5s */
  setTimeout(function () {
    confettiDiv.remove();
  }, 2000);
}

/* toggle do coração favorito no itinerário */
const favItinerary = document.getElementById("fav-itinerary");
if (favItinerary) {
  /* impede que o coração seja selecionável */
  favItinerary.style.userSelect = "none";
  favItinerary.addEventListener("mousedown", function (e) {
    /* impede seleção de texto ao clicar rápido */
    e.preventDefault();
  });
  favItinerary.addEventListener("click", function () {
    /* apanha o span do ícone */
    const icon = favItinerary.querySelector("span");
    /* verifica o estado atual */
    const isFav = favItinerary.getAttribute("data-favorito") === "true";
    /* alterna o estado */
    favItinerary.setAttribute("data-favorito", String(!isFav));
    /* muda o FILL do ícone */
    if (!isFav) {
      icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      icon.style.fontVariationSettings = "'FILL' 0";
    }
    /* animação simples */
    icon.classList.add("scale-110");
    setTimeout(function () {
      icon.classList.remove("scale-110");
    }, 150);
  });
}

/* Carrega os hoteis quando a página carrega */
document.addEventListener("DOMContentLoaded", () => {
  carregarHoteis();
});

/* Função para carregar hoteis */
function carregarHoteis() {
  try {
    /* inicializar o modelo e obter os primeiros 5 hoteis */
    const hoteis = HotelModel.init();
    const primeirosHoteis = HotelModel.getFirst(5);

    /* seleciona o elemento onde os hoteis serão mostrados */
    const containerHoteis = document.getElementById("container-hoteis");

    if (containerHoteis && primeirosHoteis.length > 0) {
      /* esvazia o container */
      containerHoteis.innerHTML = "";

      /* cria os elementos de hotel */
      primeirosHoteis.forEach((hotel) => {
        /* cria um elemento para o hotel */
        const divHotel = document.createElement("div");
        divHotel.className =
          "flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700";

        /* informação base do hotel (primeira coluna) */
        const divInfo = document.createElement("div");
        divInfo.className = "flex items-center gap-3";

        /* foto do hotel */
        const imgHotel = document.createElement("img");
        imgHotel.src = hotel.foto || "https://placehold.co/60x40";
        imgHotel.alt = hotel.nome;
        imgHotel.className = "w-16 h-10 object-cover rounded-lg";

        /* nome e informações do hotel */
        const divNomeInfo = document.createElement("div");
        divNomeInfo.className = "flex flex-col";

        const spanNome = document.createElement("span");
        spanNome.className = "font-semibold";
        spanNome.textContent = hotel.nome;

        /* info de quartos e acessibilidade */
        const divDetalhes = document.createElement("div");
        divDetalhes.className =
          "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300";

        /* verifica se há quartos */
        if (hotel.quartos && hotel.quartos.length > 0) {
          const quarto = hotel.quartos[0];

          /* span para camas */
          const spanCama = document.createElement("span");
          spanCama.className = "flex items-center gap-1";
          spanCama.innerHTML = `<span class="material-symbols-outlined text-sm">bed</span>${quarto.camas}`;

          /* span para capacidade */
          const spanPessoa = document.createElement("span");
          spanPessoa.className = "flex items-center gap-1";
          spanPessoa.innerHTML = `<span class="material-symbols-outlined text-sm">person</span>${quarto.capacidade}`;

          divDetalhes.appendChild(spanCama);
          divDetalhes.appendChild(spanPessoa);
        }

        /* monta a div de nome e info */
        divNomeInfo.appendChild(spanNome);
        divNomeInfo.appendChild(divDetalhes);

        /* monta a primeira coluna */
        divInfo.appendChild(imgHotel);
        divInfo.appendChild(divNomeInfo);

        /* informação de preço e botão (segunda coluna) */
        const divPreco = document.createElement("div");
        divPreco.className = "flex items-center gap-3";

        /* preço (se tiver quartos) */
        if (hotel.quartos && hotel.quartos.length > 0) {
          const spanPreco = document.createElement("span");
          spanPreco.className = "font-bold text-cyan-700 dark:text-cyan-400";
          spanPreco.textContent = `${hotel.quartos[0].precoNoite}€/noite`;
          divPreco.appendChild(spanPreco);
        }

        /* botão de adicionar */
        const spanAdicionar = document.createElement("span");
        spanAdicionar.className =
          "material-symbols-outlined text-2xl text-gray-400 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400";
        spanAdicionar.textContent = "add_circle";
        spanAdicionar.onclick = function () {
          showToast("Hotel adicionado!", "success");
        };
        divPreco.appendChild(spanAdicionar);

        /* monta o hotel */
        divHotel.appendChild(divInfo);
        divHotel.appendChild(divPreco);

        /* adiciona o hotel ao container */
        containerHoteis.appendChild(divHotel);
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar hoteis:", erro);
  }
}
