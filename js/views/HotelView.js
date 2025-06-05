import * as HotelModel from "../models/HotelModel.js";
import {
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
} from "./ViewHelpers.js";

/*  Classe para gerir a visualização dos hotéis  */
export default class HotelView {
  static async init() {
    /*  Inicializa os hotéis  */
    HotelModel.init();

    /*  Verifica se existe id na url  */
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = Number(urlParams.get("id")) || 1; // Se não houver id, usa 1 para testes

    if (hotelId) {
      this.renderHotelDetail(hotelId);
    } else {
      this.renderHotelList();
    }
  }

  static renderHotelList() {
    /*  Busca todos os hotéis  */
    const data = HotelModel.getAll();
    const config = {
      data,
      columns: [
        { key: "id", label: "ID" },
        { key: "nome", label: "Nome" },
        { key: "tipo", label: "Tipo" },
        { key: "capacidade", label: "Capacidade" },
        { key: "precoNoite", label: "Preço/Noite" },
        {
          key: "available",
          label: "Disponível",
          render: (value) => (value ? "Sim" : "Não"),
        },
      ],
      actions: [
        { label: "✏️", class: "btn-edit", handler: (id) => this.edit(id) },
        { label: "❌", class: "btn-del", handler: (id) => this.delete(id) },
      ],
      rowsPerPage: 10,
      currentPage: 1,
      onPageChange: (page) => {
        config.currentPage = page;
        updateTable(config);
      },
    };
    updateTable(config);

    /*  Só adiciona evento se o formulário existir  */
    var form = document.getElementById("add_hotel_form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.create(config);
      });
    }
  }

  static renderHotelDetail(hotelId) {
    /*  Vai buscar o hotel ao modelo  */
    const hotel = HotelModel.getById(hotelId);

    if (!hotel) {
      /*  Se o hotel não for encontrado, limpa o conteúdo principal e mostra uma mensagem de erro.  */
      /*  Isto evita o erro de tentar ir para uma página que não existe.  */
      const corpoPrincipal =
        document.querySelector("main") ||
        document.body; /*  Tenta encontrar o <main>, senão usa o <body>  */

      /*  Limpa qualquer conteúdo que já exista no corpoPrincipal  */
      corpoPrincipal.innerHTML = "";

      const mensagemErro = document.createElement("div");
      mensagemErro.textContent =
        "Desculpe, o hotel que procura não foi encontrado.";
      mensagemErro.style.textAlign = "center";
      mensagemErro.style.marginTop = "50px";
      mensagemErro.style.fontSize = "1.5rem";
      mensagemErro.style.color = "red";

      corpoPrincipal.appendChild(mensagemErro);

      document.title =
        "Hotel Não Encontrado"; /*  Atualiza o título da página  */
      return;
    }

    /*  Preenche os dados básicos do hotel na página  */
    document.title = hotel.nome + " - Detalhes do Hotel";
    document.getElementById("hotel-nome").textContent = hotel.nome;
    document.getElementById("hotel-foto").src = hotel.foto;
    document.getElementById("hotel-tipo").textContent = hotel.tipo;

    /*  Vai buscar dados do primeiro quarto  */
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

    /*  Renderiza as comodidades  */
    this.renderIconsList("hotel-acessibilidade", comodidades);

    /*  Renderiza a acessibilidade  */
    this.renderIconsList("hotel-acessibilidade-extra", acessibilidade);

    /*  Eventos dos botões  */
    document
      .getElementById("fav-hotel")
      .addEventListener("click", () => this.toggleFavorito());
    document
      .getElementById("btn-mais-hospedes")
      .addEventListener("click", () => this.aumentarHospedes());
    document
      .getElementById("btn-menos-hospedes")
      .addEventListener("click", () => this.diminuirHospedes());
    document
      .getElementById("btn-reservar")
      .addEventListener("click", () => this.reservar(hotel));

    /*  Datas para check-in e check-out  */
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

    /*  Mostra o mapa com Leaflet  */
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

  static renderIconsList(containerId, lista) {
    /*  Mostra lista de ícones numa grelha  */
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

  static toggleFavorito() {
    /*  Marcar/desmarcar favorito  */
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

  static aumentarHospedes() {
    /*  Aumenta número de hóspedes  */
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

  static diminuirHospedes() {
    /*  Diminui número de hóspedes  */
    const input = document.getElementById("hospedes");
    let value = parseInt(input.value, 10);
    if (value > 1) {
      input.value = value - 1;
    }
  }

  static reservar(hotel) {
    /*  Simula reserva  */
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

    hotel.occupy();
    HotelModel.update(hotel.id, hotel);

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
  }

  static create(config) {
    /*  Adiciona hotel novo  */
    const data = getFormData("add_hotel_form");
    HotelModel.add(data);
    showToast("Hotel adicionado com sucesso!");
    closeModal("modal-adicionar", "add_hotel_form", "Adicionar Hotel");
    config.data = HotelModel.getAll();
    updateTable(config);
  }

  static edit(id) {
    /*  Editar hotel  */
    const hotel = HotelModel.getById(id);
    if (hotel) {
      document.getElementById("edit_id").value = hotel.id;
      document.getElementById("edit_nome").value = hotel.nome;
      document.getElementById("edit_destinoId").value = hotel.destinoId;
      document.getElementById("edit_foto").value = hotel.foto;
      document.getElementById("edit_tipo").value = hotel.tipo;
      document.getElementById("edit_camas").value = hotel.camas;
      document.getElementById("edit_capacidade").value = hotel.capacidade;
      document.getElementById("edit_precoNoite").value = hotel.precoNoite;
      document.getElementById("edit_acessibilidade").value =
        hotel.acessibilidade.join(", ");
      document.getElementById("edit_available").checked = hotel.available;

      document.getElementById("modal-editar").classList.remove("hidden");

      document
        .getElementById("edit_hotel_form")
        .addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = getFormData("edit_hotel_form");
          HotelModel.update(id, formData);
          showToast("Hotel atualizado com sucesso!");
          closeModal("modal-editar", "edit_hotel_form");
          config.data = HotelModel.getAll();
          updateTable(config);
        });
    }
  }

  static delete(id) {
    /*  Apagar hotel  */
    if (confirm("Tem certeza que deseja eliminar este hotel?")) {
      HotelModel.remove(id);
      showToast("Hotel eliminado com sucesso!");
      config.data = HotelModel.getAll();
      updateTable(config);
    }
  }
}

/*  Inicializar quando a página carrega  */
document.addEventListener("DOMContentLoaded", () => {
  HotelView.init();
});
