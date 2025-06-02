import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
} from "./ViewHelpers.js";

/* Código para aumentar e diminuir o número de pessoas na sidebar */
/* em português de portugal */

const btnMais = document.getElementById("btn-mais");
const btnMenos = document.getElementById("btn-menos");
const inputPessoas = document.getElementById("input-pessoas");
const btnReservar = document.querySelector(
  "button.w-full.bg-Button-Main, button.w-full.bg-Button-Main.dark\\:bg-cyan-400"
);

/* verifica se os elementos existem antes de usar */
if (btnMais && btnMenos && inputPessoas) {
  btnMais.onclick = function () {
    /* aumenta o valor até 15 */
    let valor = parseInt(inputPessoas.value, 10);
    if (valor < 15) {
      inputPessoas.value = valor + 1;
    } else {
      /* mostra toast se tentar passar de 15 */
      showToast("O máximo de pessoas é 15.", "error");
    }
  };

  btnMenos.onclick = function () {
    /* diminui o valor até 1 */
    let valor = parseInt(inputPessoas.value, 10);
    if (valor > 1) {
      inputPessoas.value = valor - 1;
    }
  };

  /* quando o input é alterado manualmente */
  inputPessoas.oninput = function () {
    /* converte o valor para número */
    let valor = parseInt(inputPessoas.value, 10);
    /* se não for número ou menor que 1, volta para 1 */
    if (isNaN(valor) || valor < 1) {
      inputPessoas.value = 1;
    }
    /* se for maior que 15, mostra toast e volta para 15 */
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
