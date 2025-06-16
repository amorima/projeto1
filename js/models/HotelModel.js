import {
  loadFromLocalStorage,
  saveToLocalStorage,
  getNextId,
} from "./ModelHelpers.js";

/* array para os hoteis */
let hoteis = [];

/* Dados para pesquisa de hotéis */
let selectedDestination = null;
let hotelDates = {
  checkin: "",
  checkout: ""
};
let hotelGuests = {
  adultos: 2,
  criancas: 0,
  quartos: 1
};
let selectedAccessibilities = [];

/* função para iniciar o modelo com dados da localStorage */
export function init() {
  hoteis = localStorage.hoteis ? loadFromLocalStorage("hoteis", hoteis) : [];
  
  // Carregar acessibilidades selecionadas se existirem
  const savedAccessibilities = localStorage.getItem("acessibilidadesSelecionadasHotel");
  if (savedAccessibilities) {
    selectedAccessibilities = JSON.parse(savedAccessibilities);
  }
  
  return hoteis;
}

/* função para obter todos os hoteis */
export function getAll() {
  return hoteis;
}

/* função para obter os primeiros X hoteis */
export function getFirst(quantidade = 5) {
  return hoteis.slice(0, quantidade);
}

/* obter hoteis por cidade */
export function getHoteisByCidade(cidade) {
  return hoteis.filter((hotel) => hotel.cidade === cidade);
}

/* obter um hotel por id */
export function getById(id) {
  return hoteis.find((hotel) => hotel.id === Number(id));
}

/* adicionar um novo hotel */
export function add(dados) {
  /* cria um novo id único */
  const id = getNextId(hoteis);

  /* cria objecto de hotel a partir dos dados do formulário */
  const hotel = new Hotel(
    id,
    Number(dados.destinoId),
    dados.nome,
    dados.foto,
    dados.tipo,
    Number(dados.camas),
    Number(dados.capacidade),
    Number(dados.precoNoite),
    dados.acessibilidade ? dados.acessibilidade.split(",") : [],
    true
  );

  /* adiciona o hotel ao array */
  hoteis.push(hotel);

  /* guarda os hoteis atualizados na localStorage */
  saveToLocalStorage("hoteis", hoteis);

  return hotel;
}

/* atualizar um hotel existente */
export function update(id, dados) {
  /* encontra o indice do hotel no array */
  const index = hoteis.findIndex((h) => h.id === Number(id));

  if (index !== -1) {
    /* atualiza os dados do hotel */
    hoteis[index].destinoId = Number(dados.destinoId);
    hoteis[index].nome = dados.nome;
    hoteis[index].foto = dados.foto;
    hoteis[index].tipo = dados.tipo;
    hoteis[index].camas = Number(dados.camas);
    hoteis[index].capacidade = Number(dados.capacidade);
    hoteis[index].precoNoite = Number(dados.precoNoite);
    hoteis[index].acessibilidade = dados.acessibilidade
      ? dados.acessibilidade.split(",")
      : [];
    hoteis[index].available =
      dados.available === true || dados.available === "true";

    /* guarda os hoteis atualizados na localStorage */
    saveToLocalStorage("hoteis", hoteis);

    return hoteis[index];
  }

  return null;
}

/* remover um hotel */
export function remove(id) {
  /* filtra o array para remover o hotel com o id especificado */
  hoteis = hoteis.filter((h) => h.id !== Number(id));

  /* guarda os hoteis atualizados na localStorage */
  saveToLocalStorage("hoteis", hoteis);

  return true;
}

/**
 * Obtém uma lista de hotéis filtrados por destino.
 * @param {number} destinoId - ID do destino para filtrar os hotéis.
 * @param {number} perPage - Número de hotéis por página (padrão é 18).
 * @param {number} page - Número da página a ser retornada (padrão é 1).
 * @return {Array} - Lista de hotéis filtrados e embaralhados, limitada ao número de itens por página.
 * @description
 * Esta função filtra os hotéis disponíveis com base no ID do destino fornecido.
 * Em seguida, embaralha a lista de hotéis e retorna apenas os itens correspondentes à página solicitada.
 * Se o número de hotéis for menor que o número solicitado, retorna todos os disponíveis.
 * @example
 * import { getHotelsFrom } from './HotelModel.js';
 * const hotels = getHotelsFrom(1, 10, 2);
 * Neste exemplo, a função retorna os hotéis do destino com ID 1,
 * limitados a 10 por página, e retorna a segunda página de resultados.
 */
export function getHotelsFrom(destinoId, perPage = 18, page = 1) {
  // Filtra hoteis cuja origem é OPO (Porto)
  const Hotels = hoteis.filter((h) => h.destinoId === destinoId);
  // Embaralha o array
  const shuffled = Hotels.sort(() => 0.5 - Math.random());
  // Retorna os primeiros 'count' voos
  return shuffled.slice(perPage * (page - 1), perPage * page);
}

/* === FUNCOES PARA PESQUISA DE HOTÉIS === */

/* Funcoes para gestao de destinos */
export function getDestinations() {
  return JSON.parse(localStorage.getItem("destinos")) || [];
}

export function filterDestinations(searchTerm) {
  const destinations = getDestinations();
  return destinations.filter((destino) =>
    destino.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destino.aeroporto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destino.pais.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export function setDestination(destino) {
  selectedDestination = destino;
}

export function getSelectedDestination() {
  return selectedDestination;
}

/* Funcoes para gestao de datas */
export function setDates(checkin, checkout) {
  hotelDates.checkin = checkin;
  hotelDates.checkout = checkout;
}

export function getDates() {
  return hotelDates;
}

export function getDatesText() {
  if (!hotelDates.checkin || !hotelDates.checkout) {
    return { checkin: "Check-in", checkout: "Check-out" };
  }
  
  const checkinFormatted = new Date(hotelDates.checkin).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const checkoutFormatted = new Date(hotelDates.checkout).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
  
  return { checkin: checkinFormatted, checkout: checkoutFormatted };
}

/* Funcoes para gestao de hospedes */
export function setGuests(adultos, criancas, quartos) {
  hotelGuests.adultos = adultos;
  hotelGuests.criancas = criancas;
  hotelGuests.quartos = quartos;
}

export function getGuests() {
  return hotelGuests;
}

export function getGuestsText() {
  const { adultos, criancas, quartos } = hotelGuests;
  let texto = `${adultos} adulto${adultos > 1 ? 's' : ''}`;
  if (criancas > 0) {
    texto += `, ${criancas} criança${criancas > 1 ? 's' : ''}`;
  }
  texto += `, ${quartos} quarto${quartos > 1 ? 's' : ''}`;
  return texto;
}

/* Funcoes para gestao de acessibilidade */
export function getAccessibilities() {
  return JSON.parse(localStorage.getItem("acessibilidade")) || [];
}

export function filterAccessibilities(searchTerm) {
  const accessibilities = getAccessibilities();
  return accessibilities.filter((acessibilidade) =>
    acessibilidade.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export function toggleAccessibility(index) {
  const position = selectedAccessibilities.indexOf(index);
  if (position > -1) {
    selectedAccessibilities.splice(position, 1);
  } else {
    selectedAccessibilities.push(index);
  }
}

export function confirmAccessibilities() {
  localStorage.setItem(
    "acessibilidadesSelecionadasHotel",
    JSON.stringify(selectedAccessibilities)
  );
}

export function getSelectedAccessibilities() {
  return selectedAccessibilities;
}

export function getAccessibilitiesText() {
  const quantidade = selectedAccessibilities.length;
  if (quantidade === 0) return "Nenhum";
  if (quantidade === 1) return "1 selecionado";
  return `${quantidade} selecionados`;
}

/* Função para obter dados completos da pesquisa */
export function getSearchData() {
  return {
    destination: selectedDestination,
    dates: hotelDates,
    guests: hotelGuests,
    accessibilities: selectedAccessibilities
  };
}

/* Filtrar hotéis baseado nos dados de pesquisa */
export function filterHotelsBySearchData(searchData) {
  let hotels = getAll();
  
  // Filtrar por destino (cidade)
  if (searchData.destination) {
    const cidadeDestino = searchData.destination.cidade;
    hotels = hotels.filter(hotel => 
      hotel.cidade && hotel.cidade.toLowerCase() === cidadeDestino.toLowerCase()
    );
  }
  
  // Filtrar por capacidade baseado no número de hóspedes
  if (searchData.guests) {
    const totalHospedes = searchData.guests.adultos + searchData.guests.criancas;
    hotels = hotels.filter(hotel => {
      if (!hotel.quartos || hotel.quartos.length === 0) return false;
      
      // Verificar se algum quarto tem capacidade suficiente
      return hotel.quartos.some(quarto => 
        quarto.capacidade >= totalHospedes
      );
    });
  }
  
  // Filtrar por acessibilidades selecionadas
  if (searchData.accessibilities && searchData.accessibilities.length > 0) {
    const accessibilityList = getAccessibilities();
    const selectedAccessibilityTexts = searchData.accessibilities.map(index => 
      accessibilityList[index]
    ).filter(Boolean);
    
    if (selectedAccessibilityTexts.length > 0) {
      hotels = hotels.filter(hotel => {
        if (!hotel.quartos || hotel.quartos.length === 0) return false;
        
        // Verificar se algum quarto tem pelo menos uma das acessibilidades selecionadas
        return hotel.quartos.some(quarto => {
          if (!quarto.acessibilidade) return false;
          
          const quartoAccessibilities = Array.isArray(quarto.acessibilidade) 
            ? quarto.acessibilidade 
            : [quarto.acessibilidade];
            
          return selectedAccessibilityTexts.some(selectedAcc =>
            quartoAccessibilities.some(quartoAcc => 
              quartoAcc.toLowerCase().includes(selectedAcc.toLowerCase())
            )
          );
        });
      });
    }
  }
  
  // Filtrar por datas (verificar disponibilidade)
  if (searchData.dates && searchData.dates.checkin && searchData.dates.checkout) {
    const checkinDate = new Date(searchData.dates.checkin);
    const checkoutDate = new Date(searchData.dates.checkout);
    
    hotels = hotels.filter(hotel => {
      if (!hotel.quartos || hotel.quartos.length === 0) return true; // Se não há quartos definidos, considera disponível
      
      // Verificar se algum quarto está disponível nas datas selecionadas
      return hotel.quartos.some(quarto => {
        // Se não há data de check-in definida no quarto, considera disponível
        if (!quarto.dataCheckin) return true;
        
        const quartoCheckin = new Date(quarto.dataCheckin);
        const quartoCheckout = new Date(quartoCheckin);
        quartoCheckout.setDate(quartoCheckout.getDate() + (quarto.numeroNoites || 1));
        
        // Verificar se as datas não se sobrepõem
        return checkoutDate <= quartoCheckin || checkinDate >= quartoCheckout;
      });
    });
  }
  
  console.log(`Filtrados ${hotels.length} hotéis de ${getAll().length} total`);
  return hotels;
}

/* Limpar filtros de pesquisa */
export function clearSearchFilters() {
  selectedDestination = null;
  hotelDates.checkin = "";
  hotelDates.checkout = "";
  hotelGuests.adultos = 2;
  hotelGuests.criancas = 0;
  hotelGuests.quartos = 1;
  selectedAccessibilities.length = 0; // Limpar array
  
  // Remover do localStorage
  localStorage.removeItem("acessibilidadesSelecionadasHotel");
}

/**
 * CLASSE QUE MODELA UM HOTEL NA APLICAÇÃO
 * @param {number} id - ID do hotel
 * @param {number} destinoId - ID do destino
 * @param {string} nome - Nome do hotel
 * @param {string} foto - URL da foto do hotel
 * @param {string} tipo - Tipo de hotel
 * @param {number} camas - Número de camas
 * @param {number} capacidade - Capacidade do hotel
 * @param {number} precoNoite - Preço por noite
 * @param {Array} acessibilidade - Lista de acessibilidade
 * @param {boolean} available - Disponibilidade do hotel
 * @description
 * Esta classe representa um hotel na aplicação, contendo informações como ID, destino, nome, foto, tipo, número de camas, capacidade, preço por noite e acessibilidade.
 * Além disso, possui métodos para ocupar e liberar o hotel.
 * @example
 * const hotel = new Hotel(1, 2, 'Hotel Exemplo', 'https://example.com/hotel.jpg', 'Luxo', 2, 4, 150, ['Wi-Fi', 'Acessível'], true);
 * hotel.occupy(); // Marca o hotel como ocupado
 * hotel.free(); // Marca o hotel como disponível novamente
 */
class Hotel {
  id = 0;
  destinoId = 0;
  nome = "";
  foto = ""; // Improvement => []
  tipo = "";
  camas = 0;
  capacidade = 0;
  precoNoite = 0;
  acessibilidade = [];
  available = true;
  constructor(
    id,
    destinoId,
    nome,
    foto,
    tipo,
    camas,
    capacidade,
    precoNoite,
    acessibilidade = [],
    available = true
  ) {
    this.id = id;
    this.destinoId = destinoId;
    this.nome = nome;
    this.foto = foto;
    this.tipo = tipo;
    this.camas = camas;
    this.capacidade = capacidade;
    this.precoNoite = precoNoite;
    this.acessibilidade = acessibilidade;
    this.available = available;
  }
  occupy() {
    this.available = false;
  }
  free() {
    this.available = true;
  }
}

/* exporta um objeto com todas as funções */
export default {
  init,
  getAll,
  getFirst,
  getHoteisByCidade,
  getHotelsFrom,
  getById,
  add,
  update,
  remove,
  getDestinations,
  filterDestinations,
  setDestination,
  getSelectedDestination,
  setDates,
  getDates,
  getDatesText,
  setGuests,
  getGuests,
  getGuestsText,
  getAccessibilities,
  filterAccessibilities,
  toggleAccessibility,
  confirmAccessibilities,
  getSelectedAccessibilities,
  getAccessibilitiesText,
  getSearchData,
  filterHotelsBySearchData,
  clearSearchFilters
};
