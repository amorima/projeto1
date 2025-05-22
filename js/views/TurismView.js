// Importação de helpers e modelos necessários para a renderização dos componentes e manipulação dos dados das viagens
import { loadComponent } from "./ViewHelpers.js";
import * as Flight from "../models/FlightModel.js";

// Importa apenas a função de renderização dos cards do FlightView
import { renderRandomOPOCards as _renderRandomOPOCards } from "./FlightView.js";

// Dicionário de tradução para os tipos de turismo, utilizado para apresentar os nomes de forma amigável nos cards
const TURISMO_LABELS = {
  TurismodeSolePraia: "turismo de sol e praia",
  Turismoreligioso: "turismo religioso",
  TurismoUrbano: "turismo urbano",
  Turismogastronomico: "turismo gastronómico",
  TurismoNatureza: "turismo natureza",
  TurismoAventura: "turismo aventura",
  Turismocultural: "turismo cultural",
  TurismoRural: "turismo rural",
  TurismoDesportivo: "turismo desportivo",
  TurismoSaude: "turismo saúde",
};

// Função responsável por filtrar as viagens de acordo com o tipo de turismo selecionado
function getTripsByTurismo(turismoTipo) {
  const all = Flight.getAll();
  // O campo turismo é um array de strings, pode ter nomes como "TurismodeSolePraia"
  return all.filter(
    (v) =>
      Array.isArray(v.turismo) &&
      v.turismo.some((t) => t.toLowerCase() === turismoTipo.toLowerCase())
  );
}

// Função principal para renderizar os cards das viagens filtradas, incluindo a apresentação dos "pills" de turismo
function renderFilteredCards(tipoTurismo) {
  const container = document.querySelector(".card-viagens");
  if (!container) return;
  const viagens = getTripsByTurismo(tipoTurismo);
  container.innerHTML = "";
  viagens.forEach((viagem) => {
    // Copiado do renderRandomOPOCards, mas para viagens filtradas
    const cidade = viagem.destino || "Destino";
    const formatarData = (dataStr) => {
      if (!dataStr) return "";
      const [dia, mes, anoHora] = dataStr.split("/");
      const [ano, hora] = anoHora.split(" ");
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
      return `${dia} ${meses[parseInt(mes, 10) - 1]}`;
    };
    const dataPartida = formatarData(viagem.partida);
    const dataVolta = formatarData(viagem.dataVolta);
    const datas =
      dataPartida && dataVolta ? `${dataPartida} - ${dataVolta}` : "";
    const preco = viagem.custo || "-";
    const imagem = viagem.imagem || "https://placehold.co/413x327";
    // Novo: gerar os pills dos tipos de turismo
    const turismoPills = Array.isArray(viagem.turismo)
      ? viagem.turismo
          .map((tipo) => {
            const nome = TURISMO_LABELS[tipo] || tipo;
            return `
                <span class="bg-Main-Secondary text-white text-xs font-semibold rounded-full px-3 py-1 mr-1 mb-1 shadow-sm whitespace-nowrap" style="backdrop-filter: blur(2px); opacity: 0.95;">
                  ${nome}
                </span>
              `;
          })
          .join("")
      : "";

    container.innerHTML += `
      <div class="bg-white w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
        <div class="relative w-full h-80">
          <img class="w-full h-80 object-cover" src="${imagem}" alt="Imagem do destino">
          <div class="absolute bottom-2 right-2 flex flex-wrap justify-end items-end gap-1 z-10">
            ${turismoPills}
          </div>
        </div>
        <div class="p-4">
          <p class="text-Text-Body text-2xl font-bold font-['Space_Mono'] mb-2">${cidade}</p>
          <div class="inline-flex">
            <span class="material-symbols-outlined text-Text-Subtitles">calendar_month</span>
            <p class="text-Text-Subtitles align-bottom font-normal font-['IBM_Plex_Sans'] mb-4">${datas}</p>
          </div>
          <p class="text-Button-Main text-3xl font-bold font-['IBM_Plex_Sans']">${preco} €</p>
          <p class="justify-start text-Text-Subtitles text-xs font-light font-['IBM_Plex_Sans'] leading-none">Transporte para 1 pessoa</p>
          <a href="#" class="absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary transition duration-300 ease-in-out">Ver oferta</a>
          <span 
            class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon"
            data-favorito="false" 
          >favorite</span>
        </div>
      </div>
    `;
  });
  // Ativar toggle de favorito (igual ao FlightView)
  container.querySelectorAll(".favorite-icon").forEach((icon) => {
    const initialIsFav = icon.getAttribute("data-favorito") === "true";
    icon.style.fontVariationSettings = initialIsFav ? "'FILL' 1" : "'FILL' 0";
    icon.addEventListener("click", function () {
      const currentIsFav = this.getAttribute("data-favorito") === "true";
      const newIsFav = !currentIsFav;
      this.setAttribute("data-favorito", String(newIsFav));
      this.style.fontVariationSettings = newIsFav ? "'FILL' 1" : "'FILL' 0";
      this.classList.add("scale-110");
      setTimeout(() => this.classList.remove("scale-110"), 150);
    });
  });
}

// Função auxiliar para obter o tipo de turismo a partir da query string da URL
function getTipoTurismoFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("turismo") || "";
}

// Evento que garante o carregamento dos componentes principais da página e inicialização dos dados ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("../html/_header.html", "header-placeholder");
  loadComponent("../html/_footer.html", "footer-placeholder");
  loadComponent("../html/_slider.html", "slider-placeholder");

  // Inicializar modelo de viagens
  Flight.init();

  // Obter tipo de turismo da query string
  const tipoTurismo = getTipoTurismoFromURL();
  if (tipoTurismo) {
    renderFilteredCards(tipoTurismo);
  }
});
