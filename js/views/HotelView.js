import * as HotelModel from "../models/HotelModel.js";
import {
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
} from "./ViewHelpers.js";

async function initHotelView() {
  HotelModel.init();

  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = Number(urlParams.get("id")) || 1;

  if (hotelId) {
    renderHotelDetail(hotelId);
  } else {
    renderHotelList();
  }
}

/**
 * Carrega o hotel selecionado do hotel_search.html
 * @param {number} hotelId - ID do hotel a ser carregado.
 * @returns {void}
 * @description
 * Carrega os detalhes de um hotel específico e exibe na página.
 * Se o hotel não for encontrado, exibe uma mensagem de erro.
 * Exibe também um mapa com a localização do hotel, se disponível.
 * Exibe os detalhes do hotel, incluindo nome, foto, tipo, camas, capacidade,
 * comodidades, acessibilidade e preço.
 * Adiciona funcionalidades para reservar o hotel, aumentar e diminuir o número de hóspedes,
 * e adicionar/remover o hotel dos favoritos.
 * Exibe um mapa com a localização do hotel, se a biblioteca Leaflet estiver carregada.
 * Exibe um toast de confirmação ao reservar o hotel ou ao adicionar/remover dos favoritos.
 * Exibe um formulário para selecionar as datas de check-in e check-out,
 * e o número de hóspedes.
 * @example
 * renderHotelDetail(1);
 * @example
 * renderHotelDetail(2);
 */
function renderHotelDetail(hotelId) {
  const hotel = HotelModel.getById(hotelId);

  if (!hotel) {
    const corpoPrincipal =
      document.querySelector("main") ||
      document.body;

    corpoPrincipal.innerHTML = "";

    const mensagemErro = document.createElement("div");
    mensagemErro.textContent =
      "Desculpe, o hotel que procura não foi encontrado.";
    mensagemErro.style.textAlign = "center";
    mensagemErro.style.marginTop = "50px";
    mensagemErro.style.fontSize = "1.5rem";
    mensagemErro.style.color = "red";

    corpoPrincipal.appendChild(mensagemErro);

    document.title = "Hotel Não Encontrado";
    return;
  }

  document.title = hotel.nome + " - Detalhes do Hotel";
  document.getElementById("hotel-nome").textContent = hotel.nome;
  document.getElementById("hotel-foto").src = hotel.foto;
  document.getElementById("hotel-tipo").textContent = hotel.tipo;

  let camas = 0;
  let capacidade = 0;
  let comodidades = [];
  let acessibilidade = [];
  let preco = 0;
  if (hotel.quartos && hotel.quartos.length > 0) {
    camas = hotel.quartos[0].camas || 0;
    capacidade = hotel.quartos[0].capacidade || 0;
    comodidades = hotel.quartos[0].comodidades || [];
    acessibilidade = hotel.quartos[0].acessibilidade || [];
    preco = hotel.quartos[0].precoNoite || 0;
  }

  document.getElementById("hotel-camas").textContent = camas;
  document.getElementById("hotel-capacidade").textContent = capacidade;
  document.getElementById("preco-desconto").textContent = preco * 0.9 + " €";
  document.getElementById("hotel-preco").textContent = preco + " €";
  document.getElementById("hotel-preco-noite").textContent = preco + " €";

  renderIconsList("hotel-acessibilidade", comodidades);
  renderIconsList("hotel-acessibilidade-extra", acessibilidade);

  document
    .getElementById("fav-hotel")
    .addEventListener("click", toggleFavorito);
  document
    .getElementById("btn-mais-hospedes")
    .addEventListener("click", aumentarHospedes);
  document
    .getElementById("btn-menos-hospedes")
    .addEventListener("click", diminuirHospedes);
  document
    .getElementById("btn-reservar")
    .addEventListener("click", () => reservar(hotel));

  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const doisDias = new Date(hoje);
  doisDias.setDate(hoje.getDate() + 2);

  const formatarData = (data) => {
    return data.toISOString().split("T")[0];
  };

  const checkIn = document.getElementById("check-in");
  const checkOut = document.getElementById("check-out");

  checkIn.min = formatarData(hoje);
  checkIn.value = formatarData(amanha);
  checkOut.min = formatarData(amanha);
  checkOut.value = formatarData(doisDias);

  checkIn.addEventListener("change", () => {
    const novaDataMin = new Date(checkIn.value);
    novaDataMin.setDate(novaDataMin.getDate() + 1);
    checkOut.min = formatarData(novaDataMin);

    if (new Date(checkOut.value) <= new Date(checkIn.value)) {
      checkOut.value = formatarData(novaDataMin);
    }
  });

  setTimeout(() => {
    if (hotel.cidade && window.L) {
      const cidades = {
        Lisboa: [38.7223, -9.1393],
        Porto: [41.1579, -8.6291],
        Londres: [51.5074, -0.1278],
        Madrid: [40.4168, -3.7038],
        Paris: [48.8566, 2.3522],
      };
      let coords = cidades[hotel.cidade] || [38.7223, -9.1393];
      let mapaDiv = document.getElementById("hotel-mapa");
      if (!mapaDiv) {
        mapaDiv = document.createElement("div");
        mapaDiv.id = "hotel-mapa";
        mapaDiv.style.width = "100%";
        mapaDiv.style.height = "250px";
        const locDiv = document.querySelector(".w-full.h-64.bg-gray-200");
        if (locDiv) {
          locDiv.innerHTML = "";
          locDiv.appendChild(mapaDiv);
        }
      }
      const map = L.map("hotel-mapa").setView(coords, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.marker(coords).addTo(map).bindPopup(hotel.nome).openPopup();
    }
  }, 500);
}

/**
 * Renderiza uma lista de ícones representando comodidades e acessibilidade de um hotel.
 * @param {string} containerId - ID do elemento onde a lista de ícones será renderizada.
 * @param {Array} lista - Lista de strings representando as comodidades e acessibilidade.
 * @returns {void}
 * @description
 * Renderiza uma lista de ícones dentro de um contêiner HTML especificado.
 * Cada ícone é representado por um elemento `<span>` com uma classe de ícone do Material Symbols.
 * A lista de ícones é baseada em um objeto que mapeia nomes de comodidades e acessibilidade para seus respectivos ícones.
 * O contêiner é estilizado para exibir os ícones em um layout de grade responsivo.
 * Exibe os ícones com um tamanho e cor específicos, e cada ícone é acompanhado por um texto descritivo.
 * @example
 * renderIconsList("hotel-acessibilidade", ["Wi-Fi", "Piscina", "Ginásio"]);
 */
function renderIconsList(containerId, lista) {
  const icones = {
    "Wi-Fi": "wifi",
    Piscina: "pool",
    Ginásio: "fitness_center",
    Restaurante: "restaurant",
    "Ar-condicionado": "ac_unit",
    Estacionamento: "local_parking",
    Acessível: "accessible",
    TV: "tv",
    Bar: "local_bar",
    Spa: "spa",
    Cofre: "lock",
    "Serviço de quartos": "room_service",
    "Mini-bar": "local_drink",
    Secador: "dry",
    Varanda: "balcony",
    "Vista mar": "waves",
    "Restaurante Gourmet": "restaurant",
    "Elevadores Disponíveis": "elevator",
    "Acesso Sem Degraus": "stairs",
    "Casas de Banho Adaptadas": "wc",
    "Quartos Adaptados": "hotel",
    "Transporte Acessível": "directions_bus",
    "Informação em Braille/Áudio": "braille",
    "Alarmes Visuais/Vibratórios": "vibration",
    "Aceita Cães-Guia/Assistência": "pets",
    "Ambientes Sensoriais Calmos": "spa",
    "Opções Alimentares Específicas": "restaurant_menu",
    "Comunicação Visual/Simplificada": "visibility",
    "Aluguer de Equipamento de Mobilidade": "wheelchair_pickup",
    "Superfícies Táteis/Guia": "touch_app",
    "Proximidade a Serviços Médicos": "local_hospital",
    "Ambiente Acolhedor LGBTQIA+": "diversity_3",
    "Alojamento Inclusivo Declarado": "diversity_1",
    "Negócios de Proprietários de Minorias": "groups",
    "Casas de Banho Neutras em Género": "wc",
    "Pátio Acessível": "yard",
    "Spa Acessível": "spa",
    "Piscina Acessível": "pool",
    Terraço: "roofing",
  };

  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns =
    "repeat(auto-fit, minmax(120px, 1fr))";
  container.style.gap = "24px";

  for (let i = 0; i < lista.length; i++) {
    let item = lista[i];
    let div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.padding = "8px 0";
    let spanIcon = document.createElement("span");
    spanIcon.className = "material-symbols-outlined";
    spanIcon.style.color = "#0891b2";
    spanIcon.style.fontSize = "44px";
    spanIcon.style.marginBottom = "6px";
    spanIcon.textContent = icones[item] || "check_circle";
    let spanText = document.createElement("span");
    spanText.style.fontSize = "15px";
    spanText.style.textAlign = "center";
    spanText.style.marginTop = "2px";
    spanText.textContent = item;
    div.appendChild(spanIcon);
    div.appendChild(spanText);
    container.appendChild(div);
  }
}

/**
 * Alterna o estado de favorito de um hotel.
 * @returns {void}
 * @description
 * Alterna o estado de favorito de um hotel ao clicar no botão de favorito.
 * Atualiza o ícone do botão e exibe um toast de confirmação.
 * O estado de favorito é armazenado no atributo `data-favorito` do botão.
 */
function toggleFavorito() {
  const favBtn = document.getElementById("fav-hotel");
  const isFavorito = favBtn.getAttribute("data-favorito") === "true";
  const iconElement = favBtn.querySelector(".material-symbols-outlined");

  if (isFavorito) {
    favBtn.setAttribute("data-favorito", "false");
    iconElement.style.fontVariationSettings = "'FILL' 0";
    showToast("Removido dos favoritos");
  } else {
    favBtn.setAttribute("data-favorito", "true");
    iconElement.style.fontVariationSettings = "'FILL' 1";
    showToast("Adicionado aos favoritos");
  }
}

/**
 * Aumenta o número de hóspedes no input.
 * @returns {void}
 * @description
 * Aumenta o valor do input de hóspedes em 1, respeitando o máximo permitido.
 * Se o valor máximo for atingido, exibe um toast informando o limite.
 * Se o valor já for o máximo, não faz nada.
 * O valor máximo é obtido do elemento com ID "hotel-capacidade".
 */
function aumentarHospedes() {
  const input = document.getElementById("hospedes");
  const maxValue = Number(
    document.getElementById("hotel-capacidade").textContent
  );
  let value = parseInt(input.value, 10);
  if (value < maxValue) {
    input.value = value + 1;
  } else {
    showToast("Máximo de " + maxValue + " hóspedes permitido.");
  }
}

/**
 * Diminui o número de hóspedes no input.
 * @returns {void}
 * @description
 * Diminui o valor do input de hóspedes em 1, respeitando o mínimo permitido.
 * Se o valor mínimo for atingido, não faz nada.
 * O valor mínimo é 1, portanto, se o valor atual for 1, não será possível diminuir.
 * O valor mínimo é definido diretamente no input de hóspedes.
 */
function diminuirHospedes() {
  const input = document.getElementById("hospedes");
  let value = parseInt(input.value, 10);
  if (value > 1) {
    input.value = value - 1;
  }
}

/**
 * Reserva um hotel com as informações fornecidas pelo usuário.
 * @param {Object} hotel - O objeto do hotel a ser reservado.
 * @returns {void}
 * @description
 * Coleta as informações de check-in, check-out e número de hóspedes do formulário.
 * Exibe um toast de confirmação com os detalhes da reserva.
 * Marca o hotel como ocupado e atualiza o modelo de hotel.
 * Redireciona o usuário para a página principal após 2 segundos.
 */
function reservar(hotel) {
  const checkIn = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;
  const hospedes = document.getElementById("hospedes").value;

  showToast(
    "Reserva confirmada: " +
      hotel.nome +
      " de " +
      checkIn +
      " a " +
      checkOut +
      " para " +
      hospedes +
      " hóspedes."
  );

  //! hotel.occupy(); Este metodo só existe no modelo Hotel, não nos objetos init para consistensia de resultados está desativado
  HotelModel.update(hotel.id, hotel);

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 2000);
}

// Inicializar quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  initHotelView();
});
