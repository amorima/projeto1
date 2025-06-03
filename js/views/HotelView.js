import HotelModel from "../models/HotelModel.js";
import {
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
} from "./ViewHelpers.js";

export default class HotelView {
  static async init() {
    /*  inicializar hotéis  */
    HotelModel.init();

    /*  ver se tem id na url  */
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get("id");

    if (hotelId) {
      /*  mostrar detalhes do hotel  */
      this.renderHotelDetail(hotelId);
    } else {
      /*  mostrar lista de hotéis  */
      this.renderHotelList();
    }
  }

  static renderHotelList() {
    /*  buscar todos os hotéis  */
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

    /*  só adiciona evento se o formulário existir  */
    var form = document.getElementById("add_hotel_form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.create(config);
      });
    }
  }

  static renderHotelDetail(hotelId) {
    /*  buscar hotel pelo id  */
    const hotel = HotelModel.getById(hotelId);

    if (!hotel) {
      /*  se não existir, volta para lista  */
      window.location.href = "hotel-list.html";
      return;
    }

    /*  preencher dados do hotel na página  */
    document.title = hotel.nome + " - Detalhes do Hotel";
    document.getElementById("hotel-nome").textContent = hotel.nome;
    document.getElementById("hotel-foto").src = hotel.foto;
    document.getElementById("hotel-tipo").textContent = hotel.tipo;
    document.getElementById("hotel-camas").textContent = hotel.camas;
    document.getElementById("hotel-capacidade").textContent = hotel.capacidade;
    document.getElementById("hotel-preco").textContent =
      hotel.precoNoite + " €";
    document.getElementById("hotel-preco-noite").textContent =
      hotel.precoNoite + " €";

    /*  destino não preenchido porque não há StorageModel, pode-se tirar ou adaptar se necessário  */

    /*  preencher comodidades  */
    const acessibilidadeContainer = document.getElementById(
      "hotel-acessibilidade"
    );
    acessibilidadeContainer.innerHTML = "";

    /*  ícones simples  */
    const icones = {
      "Wi-Fi": "wifi",
      Piscina: "pool",
      Academia: "fitness_center",
      Restaurante: "restaurant",
      "Ar-condicionado": "ac_unit",
      Estacionamento: "local_parking",
      Acessível: "accessible",
      TV: "tv",
      Bar: "local_bar",
      Spa: "spa",
    };

    hotel.acessibilidade.forEach((item) => {
      /*  criar div para cada comodidade  */
      const div = document.createElement("div");
      div.className = "flex items-center gap-2";
      div.innerHTML =
        '<span class="material-symbols-outlined text-cyan-700 dark:text-cyan-400">' +
        (icones[item] || "check_circle") +
        "</span><span>" +
        item +
        "</span>";
      acessibilidadeContainer.appendChild(div);
    });

    /*  eventos dos botões  */
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

    /*  datas para check-in e check-out  */
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
  }

  static toggleFavorito() {
    /*  marcar/desmarcar favorito  */
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
    /*  aumenta número de hóspedes  */
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
    /*  diminui número de hóspedes  */
    const input = document.getElementById("hospedes");
    let value = parseInt(input.value, 10);
    if (value > 1) {
      input.value = value - 1;
    }
  }

  static reservar(hotel) {
    /*  simula reserva  */
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
    /*  adiciona hotel novo  */
    const data = getFormData("add_hotel_form");
    HotelModel.add(data);
    showToast("Hotel adicionado com sucesso!");
    closeModal("modal-adicionar", "add_hotel_form", "Adicionar Hotel");
    config.data = HotelModel.getAll();
    updateTable(config);
  }

  static edit(id) {
    /*  editar hotel  */
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
    /*  apagar hotel  */
    if (confirm("Tem certeza que deseja eliminar este hotel?")) {
      HotelModel.remove(id);
      showToast("Hotel eliminado com sucesso!");
      config.data = HotelModel.getAll();
      updateTable(config);
    }
  }
}

/*  inicializar quando a página carrega  */
document.addEventListener("DOMContentLoaded", () => {
  HotelView.init();
});
