import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
} from "./ViewHelpers.js";

import * as HotelModel from "../models/HotelModel.js";
import * as ActivityModel from "../models/ActivityModel.js";
import * as FlightModel from "../models/FlightModel.js";
import * as User from "../models/UserModel.js";

let vooShallow = {}
let valor = 1
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
    console.log("hello?")
    if(User.isLogged()){
      console.log("hello?")
      const utilizador = User.getUserLogged();
      const pontos = Number(document.getElementById("pontos-add").textContent);
      User.addPontos(utilizador, pontos);
      User.addReservation(utilizador, vooShallow);
      // Persist the change in the main users array
      User.update(utilizador.id, utilizador);
      // Update session user
      sessionStorage.setItem("loggedUser", JSON.stringify(utilizador));
    }
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

function carregarHoteis(destino) {
  try {
    HotelModel.init();
    let hoteis = [];
    if (destino) {
      hoteis = HotelModel.getHoteisByCidade(destino);
      // fallback: tentar por destinoId se não encontrar por cidade
      if (!hoteis.length) {
        // procurar destinoId pelo nome da cidade
        const destinos = JSON.parse(localStorage.getItem('destinos') || '[]');
        const destinoObj = destinos.find(d => d.cidade && d.cidade.toLowerCase() === destino.toLowerCase());
        if (destinoObj && destinoObj.id) {
          hoteis = HotelModel.getHotelsFrom(destinoObj.id);
        }
      }
    } else {
      hoteis = HotelModel.getFirst(5);
    }
    const containerHoteis = document.getElementById("container-hoteis");
    if (containerHoteis && hoteis && hoteis.length > 0) {
      containerHoteis.innerHTML = "";
      hoteis.forEach((hotel) => {
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
        // Icon style changes if selected
        const isSelected = vooShallow.hotel && vooShallow.hotel.id === hotel.id;
        spanAdicionar.className =
          `material-symbols-outlined text-2xl ${isSelected ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-300'} hover:text-cyan-700 dark:hover:text-cyan-400`;
        spanAdicionar.textContent = isSelected ? "check_circle" : "add_circle";
        spanAdicionar.onclick = function (e) {
          e.stopPropagation();
          if (vooShallow.hotel && vooShallow.hotel.id === hotel.id) {
            delete vooShallow.hotel;
            atualizarSidebarVoo(vooShallow);
            showToast("Hotel removido!", "info");
          } else {
            vooShallow.hotel = hotel;
            atualizarSidebarVoo(vooShallow);
            showToast("Hotel adicionado!", "success");
          }
          carregarHoteis(destino); // Refresh icons
        };
        divPreco.appendChild(spanAdicionar);
        divHotel.appendChild(divInfo);
        divHotel.appendChild(divPreco);
        containerHoteis.appendChild(divHotel);
      });
    } else if (containerHoteis) {
      containerHoteis.innerHTML = '<div class="text-gray-500 dark:text-gray-300 text-center py-4">Nenhum hotel disponível para este destino.</div>';
    }
  } catch (erro) {
    console.error("Erro ao carregar hoteis:", erro);
  }
}

function carregarActividades(destino) {
  try {
    ActivityModel.init();
    let todasAtividades = ActivityModel.getAll();
    let atividadesDestino = [];
    if (destino) {
      // Tentar filtrar por cidade OU por destinoId
      const destinos = JSON.parse(localStorage.getItem('destinos') || '[]');
      const destinoObj = destinos.find(d => d.cidade && d.cidade.toLowerCase() === destino.toLowerCase());
      atividadesDestino = todasAtividades.filter(a => {
        // Match por nome da cidade (caso antigo)
        if (typeof a.destino === 'string' && a.destino.toLowerCase() === destino.toLowerCase()) return true;
        // Match por destinoId (caso novo)
        if ((a.destinoId || a.destino) && destinoObj && (a.destinoId === destinoObj.id || a.destino === destinoObj.id)) return true;
        return false;
      });
    } else {
      atividadesDestino = ActivityModel.getFirst(5);
    }
    const containerAtividades = document.getElementById("container-atividades");
    if (containerAtividades && atividadesDestino.length > 0) {
      containerAtividades.innerHTML = "";
      atividadesDestino.forEach((atividade) => {
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
        if (atividade.tipoTurismo && atividade.tipoTurismo.includes("Gastronomic")) icone = "restaurant";
        else if (atividade.tipoTurismo && atividade.tipoTurismo.includes("Cultural")) icone = "museum";
        else if (atividade.tipoTurismo && atividade.tipoTurismo.includes("Nature")) icone = "park";
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
        // Check if selected
        let isSelected = Array.isArray(vooShallow.atividade) && vooShallow.atividade.some(a => a.id === atividade.id);
        spanAdicionar.className = `material-symbols-outlined text-2xl ${isSelected ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-300'} hover:text-cyan-700 dark:hover:text-cyan-400`;
        spanAdicionar.textContent = isSelected ? "check_circle" : "add_circle";
        spanAdicionar.onclick = function (e) {
          e.stopPropagation();
          if (!Array.isArray(vooShallow.atividade)) vooShallow.atividade = [];
          const idx = vooShallow.atividade.findIndex(a => a.id === atividade.id);
          if (idx !== -1) {
            vooShallow.atividade.splice(idx, 1);
            showToast("Atividade removida!", "info");
          } else {
            vooShallow.atividade.push(atividade);
            showToast("Atividade adicionada!", "success");
          }
          carregarActividades(destino); // Refresh icons
        };
        divBotoes.appendChild(spanAdicionar);
        divAtividade.appendChild(divInfo);
        divAtividade.appendChild(divBotoes);
        containerAtividades.appendChild(divAtividade);
      });
    } else if (containerAtividades) {
      containerAtividades.innerHTML = '<div class="text-gray-500 dark:text-gray-300 text-center py-4">Nenhuma atividade disponível para este destino.</div>';
    }
  } catch (erro) {
    console.error("Erro ao carregar atividades:", erro);
  }
}

function adicionarEventosCarros() {
  // Seleciona todos os cartões de carro
  const carOptions = document.querySelectorAll(
    '.flex.items-center.justify-between.py-3.px-2.rounded-lg'
  );
  // Lista de nomes dos carros na ordem dos cartões
  const carNames = [
    'Ford Fiesta',
    'Volkswagen Golf',
    'Hyundai Tucson',
    'Peugeot 5008',
    'Mercedes Classe C'
  ];
  const carPrices = [24, 32, 45, 52, 68];
  carOptions.forEach((option, idx) => {
    const icon = option.querySelector('.material-symbols-outlined.text-2xl');
    if (!icon) return;
    // Verifica se este carro está selecionado
    const isSelected = vooShallow.car && vooShallow.car.nome === carNames[idx];
    icon.textContent = isSelected ? 'check_circle' : 'add_circle';
    icon.className = `material-symbols-outlined text-2xl ${isSelected ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-300'} hover:text-cyan-700 dark:hover:text-cyan-400`;
    option.onclick = function (e) {
      // Evita conflito com outros botões internos
      if (e.target.tagName === 'SPAN' && e.target !== icon) return;
      if (isSelected) {
        delete vooShallow.car;
        atualizarSidebarVoo(vooShallow);
        showToast('Carro removido!', 'info');
      } else {
        vooShallow.car = {
          nome: carNames[idx],
          preco: carPrices[idx],
          // Adicione outros dados se necessário
        };
        atualizarSidebarVoo(vooShallow);
        showToast('Carro adicionado!', 'success');
      }
      adicionarEventosCarros(); // Atualiza ícones
    };
  });
}

function adicionarEventoSeguro() {
  // Seleciona o botão correto pelo id
  const btnAddSeguro = document.getElementById("btn-add-seguro");
  if (btnAddSeguro) {
    const isSelected = !!vooShallow.seguro;
    btnAddSeguro.textContent = isSelected ? "check_circle" : "add_circle";
    btnAddSeguro.className =
      `material-symbols-outlined text-2xl ${isSelected ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-300'} hover:text-cyan-700 dark:hover:text-cyan-400 cursor-pointer`;
    btnAddSeguro.onclick = function () {
      if (vooShallow.seguro) {
        delete vooShallow.seguro;
        atualizarSidebarVoo(vooShallow);
        showToast("Seguro SecureIt removido!", "info");
      } else {
        vooShallow.seguro = true;
        atualizarSidebarVoo(vooShallow);
        showToast("Seguro SecureIt adicionado!", "success");
      }
      adicionarEventoSeguro(); // Atualiza o ícone
    };
  }
}

function atualizarSidebarVoo(voo) {
  const sidebar = document.querySelector(
    ".bg-Background-Background.rounded-2xl.shadow-md.p-6.sticky.top-\\[120px\\].flex.flex-col.space-y-6.outline"
  ) || document.querySelector(".bg-Background-Background.dark\\:bg-gray-900.rounded-2xl.shadow-md.p-6.sticky.top-\\[120px\\].flex.flex-col.space-y-6.outline");
  if (!sidebar) return;

  // User info
  let user = null;
  let nivel = 'Explorador';
  let pontos = 0;
  let desconto = 0;
  try {
    const users = JSON.parse(localStorage.getItem('user'));
    if (Array.isArray(users) && users.length > 0) {
      user = users.find(u => u.private === false) || users[0];
      pontos = parseInt(user.pontos, 10) || 0;
      if (pontos >= 5000) nivel = 'Embaixador', desconto = 20;
      else if (pontos >= 3000) nivel = 'Globetrotter', desconto = 15;
      else if (pontos >= 1500) nivel = 'Aventureiro', desconto = 10;
      else if (pontos >= 250) nivel = 'Viajante', desconto = 5;
      else nivel = 'Explorador', desconto = 0;
    }
  } catch { /* fallback para anónimo */ }

  // Preço e pontos
  let numPessoas = voo.nPessoas || 1;
  let precoBase = voo.custo ? Math.round(parseFloat(voo.custo) * numPessoas) : 0;

  function parseDatePt(dateStr) {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    let hours = 0, minutes = 0;
    if (timePart) {
      [hours, minutes] = timePart.split(':').map(Number);
    }
    return new Date(year, month - 1, day, hours, minutes);
  }

  let numNoites = 1;
  if (voo.partida && (voo.dataVolta || voo.chegada)) {
    const dataInicio = parseDatePt(voo.partida);
    const dataFim = parseDatePt(voo.dataVolta || voo.chegada);
    if (dataInicio && dataFim && !isNaN(dataInicio) && !isNaN(dataFim)) {
      numNoites = Math.max(1, Math.round((dataFim - dataInicio) / (1000 * 60 * 60 * 24)));
    } else {
      numNoites = 1;
    }
  }

  if (voo.hotel && voo.hotel.quartos && voo.hotel.quartos.length > 0) {
    const quarto = voo.hotel.quartos[0];
    let multiplicadorQuartos = 1;
    if (numPessoas > quarto.capacidade) {
      multiplicadorQuartos = Math.ceil(numPessoas / quarto.capacidade);
    }
    precoBase += quarto.precoNoite * numNoites * multiplicadorQuartos;
  }
  if (voo.car) precoBase += 1 //!Read car price
  if (voo.seguro) precoBase = precoBase * 1.2
  const precoComDesconto = desconto ? Math.round(precoBase * (1 - desconto / 100)) : precoBase;
  const pontosAcumular = precoComDesconto;
  const tipoVoo = voo.tipo ? (voo.tipo === 'ida' ? 'Só ida' : voo.tipo === 'ida e volta' ? 'Ida e volta' : 'Multitryp') : 'Só ida';
  const dataFormatada = formatDatesForDisplayPt(voo.partida, voo.dataVolta || voo.chegada);
  const descontoBadge = desconto ? `<span class="inline-block bg-Button-Main dark:bg-cyan-400 text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded ml-2">${desconto}% desconto</span>` : '';

  sidebar.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-baseline gap-2">
        <div class="text-3xl font-bold text-Button-Main dark:text-cyan-400">${precoComDesconto} €</div>
        <div class="text-base font-bold text-Text-Subtitles line-through dark:text-gray-400">${precoBase} €</div>
      </div>
      <div class="flex items-center gap-1">
        <span class="material-symbols-outlined text-Button-Main dark:text-cyan-400">globe</span>
        ${descontoBadge}
      </div>
    </div>
    <ul class="space-y-3 text-sm text-Text-Body font-medium dark:text-gray-200 mt-2">
      <li class="flex items-center gap-2">
        <span class="material-symbols-outlined">flight</span>
        ${tipoVoo}
      </li>
      <li class="flex items-center gap-2">
        <span class="material-symbols-outlined">calendar_month</span>
        ${dataFormatada}
      </li>
      <li class="flex items-center gap-2">
        <span class="material-symbols-outlined">star</span>
        Acumula <b id="pontos-add">${pontosAcumular}</b> pontos
      </li>
    </ul>
    <div class="flex items-center justify-between gap-2 mt-6">
      <button id="btn-menos" type="button" class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition outline outline-1 outline-gray-200 dark:outline-gray-700"><span class="material-symbols-outlined">remove</span></button>
      <input id="input-pessoas" class="appearance-none w-32 sm:w-40 text-center bg-white dark:bg-gray-800 border border-Components-Limit-Color rounded-lg p-2 text-Text-Body dark:text-gray-200 outline outline-1 outline-gray-200 dark:outline-gray-700" value="${voo.nPessoas ? voo.nPessoas : 1}" />
      <button id="btn-mais" type="button" class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition outline outline-1 outline-gray-200 dark:outline-gray-700"><span class="material-symbols-outlined">add</span></button>
    </div>
    <button class="w-full bg-Button-Main dark:bg-cyan-400 text-white dark:text-gray-900 font-bold py-3 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-500 transition outline outline-1 outline-gray-200 dark:outline-gray-700 mt-2">Reservar</button>
  `;
  // Reativar eventos dos botões
  const btnMais = document.getElementById("btn-mais");
  const btnMenos = document.getElementById("btn-menos");
  const inputPessoas = document.getElementById("input-pessoas");
  const btnReservar = sidebar.querySelector("button.w-full.bg-Button-Main, button.w-full.bg-Button-Main.dark\\:bg-cyan-400");
  if (btnMais && btnMenos && inputPessoas) {
    btnMais.onclick = function () {
      let valor = parseInt(inputPessoas.value, 10);
      if (valor < 15) {
        vooShallow.nPessoas = valor + 1;
        atualizarSidebarVoo(vooShallow);
      } else {
        showToast("O máximo de pessoas é 15.", "error");
      }
    };
    btnMenos.onclick = function () {
      let valor = parseInt(inputPessoas.value, 10);
      if (valor > 1) {
        vooShallow.nPessoas = valor - 1;
        atualizarSidebarVoo(vooShallow);
      }
    };
    inputPessoas.oninput = function () {
      let valor = parseInt(inputPessoas.value, 10);
      if (isNaN(valor) || valor < 1) {
        valor = 1;
      }
      if (valor > 15) {
        showToast("O máximo de pessoas é 15.", "error");
        valor = 15;
      }
      vooShallow.nPessoas = valor;
      atualizarSidebarVoo(vooShallow);
    };
  }
  if (btnReservar) {
    btnReservar.onclick = function () {
      
      User.init();
      if(User.isLogged()){
        const utilizador = User.getUserLogged();
        const pontos = Number(document.getElementById("pontos-add").textContent)
        User.addPontos(utilizador, pontos);
        User.addReservation(utilizador, vooShallow);
        // Persist the change in the main users array
        User.update(utilizador.id, utilizador);
        // Update session user
        sessionStorage.setItem("loggedUser", JSON.stringify(utilizador));

        showToast("Viagem reservada!", "success");
        if (!window.customElements || !window.customElements.get("dotlottie-player")) {
        let script = document.createElement("script");
        script.type = "module";
        script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
        script.onload = function () { };
        document.body.appendChild(script);
        setTimeout(mostrarConfettiNoToast, 3000);
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 3000);
      } else {
        mostrarConfettiNoToast();
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 3000);
      }
      }else{
        // Se o utilizador não estiver logado, redirecionar para login
        showToast("Por favor, faça login para reservar.", "warning");
        setTimeout(() => {
          window.location.href = "_login.html?redirect=flight_itinerary.html?id=" + voo.numeroVoo;
        }, 3000);
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Buscar o numeroVoo da query string
  const params = new URLSearchParams(window.location.search);
  const numeroVoo = params.get("id");
  let destinoVoo = null;
  if (numeroVoo) {
    FlightModel.init();
    const voo = FlightModel.getByNumeroVoo(numeroVoo);
    if (voo) {
      vooShallow = {...voo}
      destinoVoo = voo.destino;
      atualizarHeroVoo(voo);
      atualizarItinerarioVoo(voo);
      atualizarSidebarVoo(voo);
    }
  }
  carregarHoteis(destinoVoo);
  carregarActividades(destinoVoo);
  setTimeout(function () {
    adicionarEventosCarros();
    adicionarEventoSeguro();
  }, 500);
});

function parseDatePt(dateStr) {
  // Aceita formatos 'dd/mm/yyyy' ou 'dd/mm/yyyy hh:mm'
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  let hours = 0, minutes = 0;
  if (timePart) {
    [hours, minutes] = timePart.split(':').map(Number);
  }
  // JS: mês começa em 0
  return new Date(year, month - 1, day, hours, minutes);
}

function formatDatesForDisplayPt(dataPartida, dataRegresso) {
  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  const partida = parseDatePt(dataPartida);
  const regresso = parseDatePt(dataRegresso);
  if (!partida || !regresso || isNaN(partida) || isNaN(regresso)) return '';
  const dataPartidaFormatada = `${partida.getDate()} ${meses[partida.getMonth()]}`;
  const dataRegressoFormatada = `${regresso.getDate()} ${meses[regresso.getMonth()]}`;
  return `${dataPartidaFormatada} - ${dataRegressoFormatada}`;
}

function atualizarHeroVoo(voo) {
  // Hero: cidade destino, datas, imagem
  const heroCidade = document.querySelector(
    ".flex.items-center.gap-2 > div > .text-2xl.font-bold"
  );
  if (heroCidade) heroCidade.textContent = voo.destino?.split(" - ").pop() || voo.destino;
  const heroDatas = document.querySelector(
    ".flex.items-center.gap-2 > div > .inline-flex .text-base"
  );
  if (heroDatas) {
    heroDatas.textContent = formatDatesForDisplayPt(voo.partida, voo.dataVolta || voo.chegada);
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
      <span class='text-gray-500'>${formatDatesForDisplayPt(voo.partida, voo.dataVolta || voo.chegada)}</span>
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
