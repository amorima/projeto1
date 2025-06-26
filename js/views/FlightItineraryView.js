import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
  loadComponent,
} from "./ViewHelpers.js";
import * as HotelModel from "../models/HotelModel.js";
import * as ActivityModel from "../models/ActivityModel.js";
import * as FlightModel from "../models/FlightModel.js";
import * as User from "../models/UserModel.js";
import { getDestinationByCity } from "../models/DestinationModel.js";
let vooShallow = {};
let valor = 1;
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
    if (User.isLogged()) {
      const utilizador = User.getUserLogged();
      // Get points from the calculated value, not from DOM
      const pontos = vooShallow.pointsAR || 0;
      // Create descriptive message for points
      let description = `Reserva de voo: ${vooShallow.destino || "Voo"}`;
      if (vooShallow.hotel) description += ` + Hotel`;
      if (vooShallow.car) description += ` + Carro`;
      if (vooShallow.seguro) description += ` + Seguro`;
      User.addPontos(utilizador, pontos, description);
      User.addReservation(utilizador, vooShallow);
      // Persist the change in the main users array
      User.update(utilizador.id, utilizador);
      // Update session user
      sessionStorage.setItem("loggedUser", JSON.stringify(utilizador));
    }
    showToast("Viagem reservada!", "success");
    mostrarConfettiNoToast();
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
    if (!User.isLogged()) {
      showToast("Faça login para adicionar aos favoritos");
      window.location.href =
        "_login.html?redirect=" +
        encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    const user = User.getUserLogged();
    // Check if this flight is already a favorite
    const isFav =
      user.favoritos &&
      user.favoritos.some((fav) => fav.numeroVoo === vooShallow.numeroVoo);
    if (isFav) {
      User.removeFavorite(user, vooShallow);
      favItinerary.setAttribute("data-favorito", "false");
      icon.style.fontVariationSettings = "'FILL' 0";
      showToast("Removido dos favoritos");
    } else {
      User.addFavorite(user, vooShallow);
      favItinerary.setAttribute("data-favorito", "true");
      icon.style.fontVariationSettings = "'FILL' 1";
      showToast("Adicionado aos favoritos");
    }
    icon.classList.remove("scale-110");
    void icon.offsetWidth;
    icon.classList.add("scale-110");
    setTimeout(function () {
      icon.classList.remove("scale-110");
    }, 150);
  });
}
function updateFavItineraryState(flight) {
  const favItinerary = document.getElementById("fav-itinerary");
  if (!favItinerary || !flight || !flight.numeroVoo) return;
  if (User.isLogged()) {
    const user = User.getUserLogged();
    const isFav =
      user.favoritos &&
      user.favoritos.some((fav) => fav.numeroVoo === flight.numeroVoo);
    favItinerary.setAttribute("data-favorito", isFav ? "true" : "false");
    const icon = favItinerary.querySelector("span");
    if (icon)
      icon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
  }
}
function carregarHoteis(destino) {
  try {
    HotelModel.init();
    let hoteis = [];
    if (destino) {
      // Extract city name if in "XXX - City" format
      const cidadeNome = destino.includes(" - ")
        ? destino.split(" - ").pop()
        : destino;

      hoteis = HotelModel.getHoteisByCidade(cidadeNome);
      // fallback: tentar por destinoId se não encontrar por cidade
      if (!hoteis.length) {
        // procurar destinoId pelo nome da cidade
        const destinos = JSON.parse(localStorage.getItem("destinos") || "[]");
        const destinoObj = destinos.find(
          (d) => d.cidade && d.cidade.toLowerCase() === cidadeNome.toLowerCase()
        );
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
        // Usar a foto do hotel se disponível, ou a foto do quarto como fallback
        const quarto =
          hotel.quartos && hotel.quartos.length > 0 ? hotel.quartos[0] : {};
        imgHotel.src =
          hotel.foto || quarto.foto || "https://placehold.co/60x40";
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
        spanAdicionar.className = `material-symbols-outlined text-2xl ${
          isSelected
            ? "text-cyan-700 dark:text-cyan-400"
            : "text-gray-400 dark:text-gray-300"
        } hover:text-cyan-700 dark:hover:text-cyan-400`;
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
      containerHoteis.innerHTML =
        '<div class="text-gray-500 dark:text-gray-300 text-center py-4">Nenhum hotel disponível para este destino.</div>';
    }
  } catch (erro) {}
}
function carregarActividades(destino) {
  try {
    ActivityModel.init(); // Initialize the model first
    let todasAtividades = ActivityModel.getAll();
    let atividadesDestino = [];
    if (destino) {
      // Extract city name if in "XXX - City" format
      const cidadeNome = destino.includes(" - ")
        ? destino.split(" - ").pop()
        : destino;

      // Get the destination object to find its ID
      const destinos = JSON.parse(localStorage.getItem("destinos") || "[]");
      const destinoObj = destinos.find(
        (d) => d.cidade && d.cidade.toLowerCase() === cidadeNome.toLowerCase()
      );

      if (destinoObj) {
        // Filter activities by destinoId
        atividadesDestino = todasAtividades.filter(
          (a) => a.destinoId === destinoObj.id
        );
      } else {
        // Fallback: try to match by string comparison for older data
        atividadesDestino = todasAtividades.filter((a) => {
          // Match por nome da cidade (caso antigo)
          if (
            typeof a.destino === "string" &&
            a.destino.toLowerCase() === cidadeNome.toLowerCase()
          )
            return true;
          return false;
        });
      }
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
        if (
          atividade.tipoTurismo &&
          atividade.tipoTurismo.includes("Gastronomic")
        )
          icone = "restaurant";
        else if (
          atividade.tipoTurismo &&
          atividade.tipoTurismo.includes("Cultural")
        )
          icone = "museum";
        else if (
          atividade.tipoTurismo &&
          atividade.tipoTurismo.includes("Nature")
        )
          icone = "park";
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
        let isSelected =
          Array.isArray(vooShallow.atividade) &&
          vooShallow.atividade.some((a) => a.id === atividade.id);
        spanAdicionar.className = `material-symbols-outlined text-2xl ${
          isSelected
            ? "text-cyan-700 dark:text-cyan-400"
            : "text-gray-400 dark:text-gray-300"
        } hover:text-cyan-700 dark:hover:text-cyan-400`;
        spanAdicionar.textContent = isSelected ? "check_circle" : "add_circle";
        spanAdicionar.onclick = function (e) {
          e.stopPropagation();
          if (!Array.isArray(vooShallow.atividade)) vooShallow.atividade = [];
          const idx = vooShallow.atividade.findIndex(
            (a) => a.id === atividade.id
          );
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
      containerAtividades.innerHTML =
        '<div class="text-gray-500 dark:text-gray-300 text-center py-4">Nenhuma atividade disponível para este destino.</div>';
    }
  } catch (erro) {}
}
function adicionarEventosCarros() {
  // Encontra a seção de carros procurando pelo texto do título
  const headings = document.querySelectorAll("h2");
  let carSection = null;
  for (let heading of headings) {
    if (heading.textContent.includes("Aluguer de Carro")) {
      carSection = heading.nextElementSibling;
      break;
    }
  }
  if (!carSection) {
    return;
  }
  // Seleciona apenas os cartões de carro dentro da seção de carros
  const carOptions = carSection.querySelectorAll(
    ".flex.items-center.justify-between.py-3.px-2.rounded-lg"
  );
  // Lista de nomes dos carros na ordem dos cartões
  const carNames = [
    "Ford Fiesta",
    "Volkswagen Golf",
    "Hyundai Tucson",
    "Peugeot 5008",
    "Mercedes Classe C",
  ];
  const carPrices = [24, 32, 45, 52, 68];
  function setupCarCard(option, idx) {
    const icon = option.querySelector(".material-symbols-outlined.text-2xl");
    if (!icon) return;
    // Verifica se este carro está selecionado
    const isSelected = vooShallow.car && vooShallow.car.nome === carNames[idx];
    icon.textContent = isSelected ? "check_circle" : "add_circle";
    icon.className = `material-symbols-outlined text-2xl ${
      isSelected
        ? "text-cyan-700 dark:text-cyan-400"
        : "text-gray-400 dark:text-gray-300"
    } hover:text-cyan-700 dark:hover:text-cyan-400`;
    option.onclick = function (e) {
      // Evita conflito com outros botões internos
      if (e.target.tagName === "SPAN" && e.target !== icon) return;
      if (isSelected) {
        delete vooShallow.car;
        atualizarSidebarVoo(vooShallow);
        showToast("Carro removido!", "info");
      } else {
        vooShallow.car = {
          nome: carNames[idx],
          preco: carPrices[idx],
          // Adicione outros dados se necessário
        };
        atualizarSidebarVoo(vooShallow);
        showToast("Carro adicionado!", "success");
      }
      adicionarEventosCarros(); // Atualiza ícones
    };
  }
  carOptions.forEach((option, idx) => {
    setupCarCard(option, idx);
  });
}
function adicionarEventoSeguro() {
  // Seleciona o botão correto pelo id
  const btnAddSeguro = document.getElementById("btn-add-seguro");
  if (btnAddSeguro) {
    const isSelected = !!vooShallow.seguro;
    btnAddSeguro.textContent = isSelected ? "check_circle" : "add_circle";
    btnAddSeguro.className = `material-symbols-outlined text-2xl ${
      isSelected
        ? "text-cyan-700 dark:text-cyan-400"
        : "text-gray-400 dark:text-gray-300"
    } hover:text-cyan-700 dark:hover:text-cyan-400 cursor-pointer`;
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
  const sidebar =
    document.querySelector(
      ".bg-Background-Background.rounded-2xl.shadow-md.p-6.sticky.top-\\[120px\\].flex.flex-col.space-y-6.outline"
    ) ||
    document.querySelector(
      ".bg-Background-Background.dark\\:bg-gray-900.rounded-2xl.shadow-md.p-6.sticky.top-\\[120px\\].flex.flex-col.space-y-6.outline"
    );
  if (!sidebar) return;
  // User info
  let user = null;
  let nivel = "Explorador";
  let pontos = 0;
  let desconto = 0;
  try {
    const users = JSON.parse(localStorage.getItem("user"));
    if (Array.isArray(users) && users.length > 0) {
      user = users.find((u) => u.private === false) || users[0];
      pontos = parseInt(user.pontos, 10) || 0;
      if (pontos >= 5000) (nivel = "Embaixador"), (desconto = 20);
      else if (pontos >= 3000) (nivel = "Globetrotter"), (desconto = 15);
      else if (pontos >= 1500) (nivel = "Aventureiro"), (desconto = 10);
      else if (pontos >= 250) (nivel = "Viajante"), (desconto = 5);
      else (nivel = "Explorador"), (desconto = 0);
    }
  } catch {
    /* fallback para anónimo */
  }
  // Preço e pontos
  let numPessoas = voo.nPessoas || 1;
  let precoBase = voo.custo
    ? Math.round(parseFloat(voo.custo) * numPessoas)
    : 0;
  function parseDatePt(dateStr) {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    let hours = 0,
      minutes = 0;
    if (timePart) {
      [hours, minutes] = timePart.split(":").map(Number);
    }
    return new Date(year, month - 1, day, hours, minutes);
  }
  let numNoites = 1;
  if (voo.partida && (voo.dataVolta || voo.chegada)) {
    const dataInicio = parseDatePt(voo.partida);
    const dataFim = parseDatePt(voo.dataVolta || voo.chegada);
    if (dataInicio && dataFim && !isNaN(dataInicio) && !isNaN(dataFim)) {
      numNoites = Math.max(
        1,
        Math.round((dataFim - dataInicio) / (1000 * 60 * 60 * 24))
      );
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
  // Fix car pricing - use car price * number of days
  if (voo.car && voo.car.preco) {
    precoBase += voo.car.preco * numNoites;
  }
  if (voo.seguro) precoBase = Math.round(precoBase * 1.2);
  const precoComDesconto = desconto
    ? Math.round(precoBase * (1 - desconto / 100))
    : precoBase;
  // Calculate points based on new rules
  let pointsMultiplier = 1.0; // Base: 1 point per euro for flight only
  // Check what's included to determine multiplier
  const hasCar = !!(voo.car && voo.car.preco);
  const hasHotel = !!(
    voo.hotel &&
    voo.hotel.quartos &&
    voo.hotel.quartos.length > 0
  );
  if (hasCar && hasHotel) {
    pointsMultiplier = 1.25; // Flight + car + hotel
  } else if (hasCar || hasHotel) {
    pointsMultiplier = 1.1; // Flight + car OR flight + hotel
  }
  // Apply insurance bonus if present
  if (voo.seguro) {
    pointsMultiplier *= 1.05;
  }
  const pontosAcumular = Math.round(precoComDesconto * pointsMultiplier);
  vooShallow.pointsAR = pontosAcumular;

  /* Determinar tipo de viagem baseado na nova propriedade tipoViagem */
  let tipoVoo = "Ida e volta"; /* Valor padrão */
  if (voo.tipoViagem) {
    switch (voo.tipoViagem) {
      case "ida":
        tipoVoo = "Só ida";
        break;
      case "ida-volta":
        tipoVoo = "Ida e volta";
        break;
      case "multitrip":
        tipoVoo = "Multidestino";
        break;
      default:
        tipoVoo = "Ida e volta";
    }
  } else {
    /* Se não tiver tipoViagem, verificar o tipo de pesquisa para determinar */
    const searchData = sessionStorage.getItem("planit_search");
    if (searchData) {
      const parsedData = JSON.parse(searchData);
      if (parsedData.tripType === "so-ida") {
        tipoVoo = "Só ida";
      }
    }
  }
  const dataFormatada = formatDatesForDisplayPt(
    voo.partida,
    voo.dataVolta || voo.chegada
  );
  const descontoBadge = desconto
    ? `<span class="inline-block bg-Button-Main dark:bg-cyan-400 text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded ml-2">${desconto}% desconto</span>`
    : "";
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
      <input id="input-pessoas" class="appearance-none w-32 sm:w-40 text-center bg-white dark:bg-gray-800 border border-Components-Limit-Color rounded-lg p-2 text-Text-Body dark:text-gray-200 outline outline-1 outline-gray-200 dark:outline-gray-700" value="${
        voo.nPessoas ? voo.nPessoas : 1
      }" />
      <button id="btn-mais" type="button" class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition outline outline-1 outline-gray-200 dark:outline-gray-700"><span class="material-symbols-outlined">add</span></button>
    </div>
    <button class="w-full bg-Button-Main dark:bg-cyan-400 text-white dark:text-gray-900 font-bold py-3 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-500 transition outline outline-1 outline-gray-200 dark:outline-gray-700 mt-2">Reservar</button>
  `;
  // Reativar eventos dos botões
  const btnMais = document.getElementById("btn-mais");
  const btnMenos = document.getElementById("btn-menos");
  const inputPessoas = document.getElementById("input-pessoas");
  const btnReservar = sidebar.querySelector(
    "button.w-full.bg-Button-Main, button.w-full.bg-Button-Main.dark\\:bg-cyan-400"
  );
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
      if (User.isLogged()) {
        const utilizador = User.getUserLogged();
        // Get points from the calculated value, not from DOM
        const pontos = vooShallow.pointsAR || 0;
        // Create descriptive message for points
        let description = `Reserva de voo: ${vooShallow.destino || "Voo"}`;
        if (vooShallow.hotel) description += ` + Hotel`;
        if (vooShallow.car) description += ` + Carro`;
        if (vooShallow.seguro) description += ` + Seguro`;
        User.addPontos(utilizador, pontos, description);
        User.addReservation(utilizador, vooShallow);
        // Persist the change in the main users array
        User.update(utilizador.id, utilizador);
        // Update session user
        sessionStorage.setItem("loggedUser", JSON.stringify(utilizador));
        mostrarConfettiNoToast();
        showToast("Viagem reservada!", "success");
        if (
          !window.customElements ||
          !window.customElements.get("dotlottie-player")
        ) {
          let script = document.createElement("script");
          script.type = "module";
          script.src =
            "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
          script.onload = function () {};
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
      } else {
        // Se o utilizador não estiver logado, redirecionar para login
        showToast("Por favor, faça login para reservar.", "warning");
        setTimeout(() => {
          window.location.href =
            "_login.html?redirect=flight_itinerary.html?id=" + voo.numeroVoo;
        }, 3000);
      }
    };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // Buscar o numeroVoo da query string
  User.init();
  const params = new URLSearchParams(window.location.search);
  const numeroVoo = params.get("id");
  let destinoVoo = null;
  let voo = null;
  let isRoundTrip = false;

  if (numeroVoo) {
    FlightModel.init();

    /* Verificar se é uma viagem ida-volta (formato: VOO1-VOO2) */
    if (numeroVoo.includes("-")) {
      isRoundTrip = true;
      const [vooIda, vooVolta] = numeroVoo.split("-");

      /* Obter voos individuais */
      const flightIda = FlightModel.getByNumeroVoo(vooIda);
      const flightVolta = FlightModel.getByNumeroVoo(vooVolta);

      if (flightIda && flightVolta) {
        /* Criar objeto viagem ida-volta */
        voo = {
          numeroVoo: numeroVoo,
          origem: flightIda.origem,
          destino: flightIda.destino,
          partida: flightIda.partida,
          chegada: flightVolta.chegada,
          dataVolta: flightVolta.partida,
          companhia: flightIda.companhia,
          imagem: flightIda.imagem,
          turismo: flightIda.turismo,
          tripType: "ida-volta",
          tipoViagem: "ida-volta",
          custo: flightIda.custo + flightVolta.custo,
          segments: [flightIda, flightVolta],
          segmentos: [
            {
              ...flightIda,
              tipo: "ida",
            },
            {
              ...flightVolta,
              tipo: "volta",
            },
          ],
        };

        console.log("🔄 Viagem ida-volta criada:", voo);
      }
    } else {
      /* Voo individual */
      voo = FlightModel.getByNumeroVoo(numeroVoo);
    }

    if (voo) {
      vooShallow = { ...voo };
      /* Extrair nome da cidade do destino */
      destinoVoo = voo.destino?.includes(" - ")
        ? voo.destino.split(" - ").pop()
        : voo.destino;

      atualizarHeroVoo(voo);
      atualizarItinerarioVoo(voo);
      atualizarSidebarVoo(voo);
      updateFavItineraryState(
        vooShallow && vooShallow.numeroVoo ? vooShallow : voo
      );
    } else {
      console.error("❌ Voo não encontrado:", numeroVoo);
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
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  let hours = 0,
    minutes = 0;
  if (timePart) {
    [hours, minutes] = timePart.split(":").map(Number);
  }
  // JS: mês começa em 0
  return new Date(year, month - 1, day, hours, minutes);
}
function formatDatesForDisplayPt(dataPartida, dataRegresso) {
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const partida = parseDatePt(dataPartida);
  const regresso = parseDatePt(dataRegresso);
  if (!partida || !regresso || isNaN(partida) || isNaN(regresso)) return "";
  const dataPartidaFormatada = `${partida.getDate()} ${
    meses[partida.getMonth()]
  }`;
  const dataRegressoFormatada = `${regresso.getDate()} ${
    meses[regresso.getMonth()]
  }`;
  return `${dataPartidaFormatada} - ${dataRegressoFormatada}`;
}
function atualizarHeroVoo(voo) {
  /* Hero: cidade destino, datas, imagem */
  const heroCidade = document.querySelector(
    ".flex.items-center.gap-2 > div > .text-2xl.font-bold"
  );

  /* Extrair a cidade do destino (remove o código do aeroporto se presente) */
  const cidadeDestino = voo.destino?.split(" - ").pop() || voo.destino;
  if (heroCidade) heroCidade.textContent = cidadeDestino;

  const heroDatas = document.querySelector(
    ".flex.items-center.gap-2 > div > .inline-flex .text-base"
  );
  if (heroDatas) {
    /* Melhorar formatação de datas baseada no tipo de viagem */
    let datasTexto = "";

    if (voo.tripType === "ida-volta" || voo.segments?.length >= 2) {
      /* Ida e volta: mostrar data de ida e volta */
      const dataIda = voo.partida || voo.segments[0]?.partida;
      const dataVolta = voo.dataVolta || voo.segments[1]?.partida;
      datasTexto = formatDatesForDisplayPt(dataIda, dataVolta);
    } else {
      /* Só ida: mostrar data de partida e chegada */
      datasTexto = formatDatesForDisplayPt(voo.partida, voo.chegada);
    }

    heroDatas.textContent = datasTexto;
  }

  const heroImg = document.querySelector(".w-full.h-full.object-cover");
  const itineraryImg = document.getElementById("itinerary-card-img");

  if (heroImg) {
    /* Extrair nome limpo da cidade */
    const cleanCityName = voo.destino?.includes(" - ")
      ? voo.destino.split(" - ").pop()
      : voo.destino;

    /* Priorizar imagem do destino carregada pelo admin */
    const destinoEncontrado = getDestinationByCity(cleanCityName);

    let imgSrc = "";
    if (destinoEncontrado && destinoEncontrado.imagem) {
      imgSrc = destinoEncontrado.imagem;
    } else if (voo.imagem) {
      imgSrc = voo.imagem;
    } else {
      imgSrc = `../img/destinos/${cleanCityName}/1.jpg`;
    }

    heroImg.src = imgSrc;
    /* Fallback para placeholder se a imagem falhar */
    heroImg.onerror = () => {
      heroImg.src = "https://placehold.co/1920x480";
      heroImg.onerror = null;
    };

    if (itineraryImg) {
      itineraryImg.src = imgSrc;
      itineraryImg.onerror = () => {
        itineraryImg.src = "https://placehold.co/200x200";
        itineraryImg.onerror = null;
      };
    }
  }
}
function getLogoCompanhia(nome) {
  try {
    const companhias =
      JSON.parse(localStorage.getItem("companhiasAereas")) || [];
    const comp = companhias.find(
      (c) => c.nome.toLowerCase() === nome.toLowerCase()
    );
    return comp ? comp.logo : null;
  } catch {
    return null;
  }
}
function atualizarItinerarioVoo(voo) {
  /* Atualizar card principal com informações gerais */
  const mainCard = document.querySelector(
    ".bg-white.dark\\:bg-gray-900.rounded-xl.shadow-md.outline"
  );
  if (!mainCard) return;

  /* Atualizar imagem do card principal */
  const img = mainCard.querySelector("img");
  if (img && voo.imagem) img.src = voo.imagem;

  /* Conteúdo à esquerda do card principal */
  const conteudo = mainCard.querySelector(
    ".flex.flex-col.gap-2.text-left.flex-1"
  );
  if (conteudo) {
    const origemCidade = voo.origem?.includes(" - ")
      ? voo.origem.split(" - ").pop()
      : voo.origem;
    const destinoCidade = voo.destino?.includes(" - ")
      ? voo.destino.split(" - ").pop()
      : voo.destino;

    /* Determinar o tipo de viagem para exibição */
    let tipoViagemTexto = "Ida";
    if (
      voo.tripType === "ida-volta" ||
      voo.tipoViagem === "ida-volta" ||
      voo.segments?.length >= 2
    ) {
      tipoViagemTexto = "Ida e Volta";
    } else if (voo.tripType === "multitrip" || voo.tipoViagem === "multitrip") {
      tipoViagemTexto = "Multi-destino";
    }

    conteudo.innerHTML = `
      <span class='text-3xl font-bold font-["Space_Mono"] text-Main-Primary dark:text-cyan-400'>${destinoCidade}</span>
      <span class='text-sm font-semibold text-Main-Secondary dark:text-cyan-200'>${formatDatesForDisplayPt(
        voo.partida,
        voo.dataVolta || voo.chegada
      )}</span>
      <span class='text-base font-light text-Main-Secondary dark:text-cyan-100'>Tipo: ${tipoViagemTexto}</span>
    `;
  }

  /* Imagem da companhia aérea à direita - removida conforme solicitado */

  /* Limpar cards de segmentos existentes */
  const itinerarioContainer = mainCard.parentElement;
  const cardsSegmentos = itinerarioContainer.querySelectorAll(
    ".flight-segment-card"
  );
  cardsSegmentos.forEach((card) => card.remove());

  /* Renderizar cards de segmentos baseado no tipo de viagem */
  if (voo.segments && voo.segments.length >= 2) {
    /* Viagem ida-volta */
    const vooIda = voo.segments[0];
    const vooVolta = voo.segments[1];

    /* Criar card de ida */
    const cardIda = criarCardVoo(vooIda, "Ida");
    itinerarioContainer.appendChild(cardIda);

    /* Criar card de volta */
    const cardVolta = criarCardVoo(vooVolta, "Volta");
    itinerarioContainer.appendChild(cardVolta);
  } else if (voo.segmentos && voo.segmentos.length > 0) {
    /* Usar estrutura de segmentos se disponível */
    voo.segmentos.forEach((segmento, index) => {
      const tipoSegmento = segmento.tipo || (index === 0 ? "Ida" : "Volta");
      const cardSegmento = criarCardVoo(segmento, tipoSegmento);
      itinerarioContainer.appendChild(cardSegmento);
    });
  } else {
    /* Voo único */
    const cardVoo = criarCardVoo(voo, "Ida");
    itinerarioContainer.appendChild(cardVoo);
  }
}

/* Função para renderizar segmentos individuais */
function renderizarSegmentos(segmentos, container, tipoViagem) {
  const segmentosIda = segmentos.filter((s) => s.tipo === "ida");
  const segmentosVolta = segmentos.filter((s) => s.tipo === "volta");

  /* Renderizar segmentos de ida */
  if (segmentosIda.length > 0) {
    const cardIda = criarCardSegmento(segmentosIda, "Ida", "ida");
    container.appendChild(cardIda);
  }

  /* Renderizar segmentos de volta se existirem */
  if (segmentosVolta.length > 0 && tipoViagem !== "ida") {
    const cardVolta = criarCardSegmento(segmentosVolta, "Volta", "volta");
    container.appendChild(cardVolta);
  }
}

/* Função para criar um card de segmento */
function criarCardSegmento(segmentos, titulo, tipo) {
  const primeiroSegmento = segmentos[0];
  const ultimoSegmento = segmentos[segmentos.length - 1];

  const origemCidade = primeiroSegmento.origem?.includes(" - ")
    ? primeiroSegmento.origem.split(" - ").pop()
    : primeiroSegmento.origem;
  const destinoCidade = ultimoSegmento.destino?.includes(" - ")
    ? ultimoSegmento.destino.split(" - ").pop()
    : ultimoSegmento.destino;

  const temEscalas = segmentos.length > 1;
  const tipoVoo = temEscalas
    ? `Com ${segmentos.length - 1} escala${segmentos.length > 2 ? "s" : ""}`
    : "Direto";

  const cardElement = document.createElement("div");
  cardElement.className =
    "bg-white dark:bg-gray-900 rounded-xl shadow-md outline outline-1 outline-gray-200 dark:outline-gray-700 p-4 mt-4";

  cardElement.innerHTML = `
    <div class="flex gap-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
          <span class="material-symbols-outlined text-cyan-600 dark:text-cyan-400">
            ${tipo === "ida" ? "flight_takeoff" : "flight_land"}
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-2 text-left flex-1">
        <span class='font-bold text-lg'>${titulo}: ${origemCidade} → ${destinoCidade}</span>
        <span class='text-gray-500'>${primeiroSegmento.partida} - ${
    ultimoSegmento.chegada
  }</span>
        <span class='text-gray-700 dark:text-gray-300'>Companhia: <b>${
          primeiroSegmento.companhia
        }</b></span>
        <span class='text-gray-700 dark:text-gray-300'>Nº Voo: <b>${segmentos
          .map((s) => s.numeroVoo)
          .join(", ")}</b></span>
        <span class='text-gray-700 dark:text-gray-300'>${tipoVoo}</span>
        ${temEscalas ? renderizarEscalas(segmentos) : ""}
      </div>
      <div class="pl-4 flex-shrink-0 flex items-center">
        ${
          getLogoCompanhia(primeiroSegmento.companhia)
            ? `<img src="${getLogoCompanhia(
                primeiroSegmento.companhia
              )}" alt="${
                primeiroSegmento.companhia
              }" class="w-16 h-16 object-contain rounded-full bg-white">`
            : `<span class='font-semibold'>${primeiroSegmento.companhia}</span>`
        }
      </div>
    </div>
  `;

  return cardElement;
}

/* Função para renderizar informações de escalas */
function renderizarEscalas(segmentos) {
  if (segmentos.length <= 1) return "";

  let escalasHtml =
    '<div class="mt-2 text-sm text-gray-600 dark:text-gray-400">';
  escalasHtml += '<span class="font-medium">Escalas:</span><br>';

  for (let i = 0; i < segmentos.length - 1; i++) {
    const chegada = segmentos[i].chegada;
    const proximaPartida = segmentos[i + 1].partida;
    const aeroportoEscala = segmentos[i].destino;

    escalasHtml += `• ${aeroportoEscala} (${chegada} - ${proximaPartida})<br>`;
  }

  escalasHtml += "</div>";
  return escalasHtml;
}

/* Função para criar card individual de voo */
function criarCardVoo(voo, tipo) {
  const origemCidade = voo.origem?.includes(" - ")
    ? voo.origem.split(" - ")[1]
    : voo.origem;
  const destinoCidade = voo.destino?.includes(" - ")
    ? voo.destino.split(" - ")[1]
    : voo.destino;
  const origemCodigo = voo.origem?.includes(" - ")
    ? voo.origem.split(" - ")[0]
    : voo.origem;
  const destinoCodigo = voo.destino?.includes(" - ")
    ? voo.destino.split(" - ")[0]
    : voo.destino;

  /* Formatação da data e hora */
  const dataPartida = voo.partida || "";
  const dataChegada = voo.chegada || "";

  const card = document.createElement("div");
  card.className =
    "flight-segment-card bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6";

  /* Obter logo da companhia */
  const logo = getLogoCompanhia(voo.companhia);

  card.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-br from-Main-Primary to-Main-Secondary dark:from-cyan-400 dark:to-cyan-600 rounded-full">
          <span class="material-symbols-outlined text-white text-lg">flight_takeoff</span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${tipo}</h3>
      </div>
      <div class="text-right">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium block">${
          voo.numeroVoo
        }</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">${
          voo.companhia
        }</span>
      </div>
    </div>
    
    <div class="flex items-center justify-between mb-6">
      <div class="text-center flex-1">
        <div class="text-3xl font-black text-Main-Primary dark:text-cyan-400 mb-1">${origemCodigo}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">${origemCidade}</div>
        <div class="text-xs text-gray-500 dark:text-gray-500 mt-2 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full inline-block">${dataPartida}</div>
      </div>
      
      <div class="flex-1 flex flex-col items-center mx-8">
        <div class="w-full flex items-center mb-2">
          <div class="h-1 bg-gradient-to-r from-Main-Primary to-Main-Secondary dark:from-cyan-400 dark:to-cyan-600 flex-1 rounded-full"></div>
          <div class="p-2 bg-white dark:bg-gray-900 border-4 border-Main-Primary dark:border-cyan-400 rounded-full mx-3">
            <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400 text-lg">flight</span>
          </div>
          <div class="h-1 bg-gradient-to-r from-Main-Secondary to-Main-Primary dark:from-cyan-600 dark:to-cyan-400 flex-1 rounded-full"></div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          ${voo.direto ? "Voo Direto" : "Com Escalas"}
        </div>
      </div>
      
      <div class="text-center flex-1">
        <div class="text-3xl font-black text-Main-Primary dark:text-cyan-400 mb-1">${destinoCodigo}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">${destinoCidade}</div>
        <div class="text-xs text-gray-500 dark:text-gray-500 mt-2 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full inline-block">${dataChegada}</div>
      </div>
    </div>
    
    <div class="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-3">
        ${
          logo
            ? `<div class="p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <img src="${logo}" alt="${voo.companhia}" class="w-8 h-8 object-contain">
        </div>`
            : ""
        }
        <div class="flex flex-col">
          <span class="text-sm font-bold text-gray-800 dark:text-gray-200">${
            voo.companhia
          }</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">Companhia Aérea</span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-Main-Primary dark:text-cyan-400">€${
          voo.custo
        }</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">por pessoa</div>
      </div>
    </div>
  `;

  return card;
}

// Disable automatic header loading since we handle it manually
window.skipAutoHeaderLoad = true;
window.onload = function () {
  // Manually load header and footer since we're using window.onload
  loadComponent("../html/_header.html", "header-placeholder");
  loadComponent("../html/_footer.html", "footer-placeholder");
  adicionarEventosCarros();
  adicionarEventoSeguro();

  const btnBack = document.getElementById("btn-back");
  if (btnBack) {
    btnBack.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }
};
