import {
  loadFromLocalStorage,
  saveToLocalStorage,
  getNextId,
} from "./ModelHelpers.js";
const destinations = [];
const STORAGE_KEY = "destinos";
loadFromLocalStorage(STORAGE_KEY, destinations);
/**
 * Obtém todos os destinos do armazenamento local
 * @returns {Array} Array com todos os destinos
 */
export function getAllDestinations() {
  loadFromLocalStorage(STORAGE_KEY, destinations);
  return [...destinations];
}
/**
 * Obtém um destino pelo seu ID
 * @param {number|string} id - ID do destino
 * @returns {Object|undefined} Objeto do destino ou undefined se não encontrado
 */
export function getDestinationById(id) {
  loadFromLocalStorage(STORAGE_KEY, destinations);
  return destinations.find((dest) => dest.id === parseInt(id));
}
/**
 * Pesquisa destinos por cidade, país, aeroporto ou características
 * @param {string} searchTerm - Termo de pesquisa
 * @returns {Array} Array de destinos que correspondem à pesquisa
 */
export function searchDestinations(searchTerm) {
  loadFromLocalStorage(STORAGE_KEY, destinations);
  if (!searchTerm || searchTerm.trim() === "") {
    return [...destinations];
  }
  const term = searchTerm.toLowerCase().trim();
  return destinations.filter(
    (dest) =>
      dest.cidade.toLowerCase().includes(term) ||
      dest.pais.toLowerCase().includes(term) ||
      dest.aeroporto.toLowerCase().includes(term) ||
      dest.tiposTurismo.some((tipo) => tipo.toLowerCase().includes(term)) ||
      dest.acessibilidade.some((acc) => acc.toLowerCase().includes(term))
  );
}
/**
 * Adiciona um novo destino
 * @param {Object} destinationData - Dados do destino
 * @returns {Object} Resultado da operação com success e data/error
 */
export function addDestination(destinationData) {
  try {
    if (
      !destinationData.cidade ||
      !destinationData.pais ||
      !destinationData.aeroporto
    ) {
      throw new Error("Cidade, país e aeroporto são obrigatórios");
    }
    if (!/^[A-Z]{3}$/.test(destinationData.aeroporto.toUpperCase())) {
      throw new Error("Código do aeroporto deve ter exatamente 3 letras");
    }
    loadFromLocalStorage(STORAGE_KEY, destinations);
    const existing = destinations.find(
      (dest) =>
        dest.cidade.toLowerCase() === destinationData.cidade.toLowerCase() &&
        dest.pais.toLowerCase() === destinationData.pais.toLowerCase() &&
        dest.aeroporto.toUpperCase() === destinationData.aeroporto.toUpperCase()
    );
    if (existing) {
      throw new Error("Este destino já existe");
    }
    const newDestination = {
      id: getNextId(destinations),
      cidade: destinationData.cidade.trim(),
      pais: destinationData.pais.trim(),
      aeroporto: destinationData.aeroporto.toUpperCase().trim(),
      tiposTurismo: Array.isArray(destinationData.tiposTurismo)
        ? destinationData.tiposTurismo
        : [],
      imagem:
        destinationData.imagem ||
        `/img/destinos/${destinationData.cidade}/1.jpg`,
      acessibilidade: Array.isArray(destinationData.acessibilidade)
        ? destinationData.acessibilidade
        : [],
    };
    destinations.push(newDestination);
    saveToLocalStorage(STORAGE_KEY, destinations);

    // Adicionar o destino à lista de aeroportos para integração
    const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];
    const novoAeroporto = {
      codigo: newDestination.aeroporto,
      cidade: newDestination.cidade,
      pais: newDestination.pais,
    };

    // Verificar se já existe este aeroporto
    if (!aeroportos.some((a) => a.codigo === novoAeroporto.codigo)) {
      aeroportos.push(novoAeroporto);
      localStorage.setItem("aeroportos", JSON.stringify(aeroportos));
    }

    return { success: true, data: newDestination };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
/**
 * Atualiza um destino existente
 * @param {number|string} id - ID do destino
 * @param {Object} destinationData - Novos dados do destino
 * @returns {Object} Resultado da operação com success e data/error
 */
export function updateDestination(id, destinationData) {
  try {
    loadFromLocalStorage(STORAGE_KEY, destinations);
    const index = destinations.findIndex((dest) => dest.id === parseInt(id));
    if (index === -1) {
      throw new Error("Destino não encontrado");
    }
    if (
      !destinationData.cidade ||
      !destinationData.pais ||
      !destinationData.aeroporto
    ) {
      throw new Error("Cidade, país e aeroporto são obrigatórios");
    }
    if (!/^[A-Z]{3}$/.test(destinationData.aeroporto.toUpperCase())) {
      throw new Error("Código do aeroporto deve ter exatamente 3 letras");
    }
    const existing = destinations.find(
      (dest, idx) =>
        idx !== index &&
        dest.cidade.toLowerCase() === destinationData.cidade.toLowerCase() &&
        dest.pais.toLowerCase() === destinationData.pais.toLowerCase() &&
        dest.aeroporto.toUpperCase() === destinationData.aeroporto.toUpperCase()
    );
    if (existing) {
      throw new Error("Já existe outro destino com estes dados");
    }
    const updatedDestination = {
      ...destinations[index],
      cidade: destinationData.cidade.trim(),
      pais: destinationData.pais.trim(),
      aeroporto: destinationData.aeroporto.toUpperCase().trim(),
      tiposTurismo: Array.isArray(destinationData.tiposTurismo)
        ? destinationData.tiposTurismo
        : [],
      acessibilidade: Array.isArray(destinationData.acessibilidade)
        ? destinationData.acessibilidade
        : [],
      imagem:
        destinationData.imagem ||
        destinations[index].imagem ||
        `/img/destinos/${destinationData.cidade}/1.jpg`,
    };
    destinations[index] = updatedDestination;
    saveToLocalStorage(STORAGE_KEY, destinations);

    // Atualizar o aeroporto correspondente na lista de aeroportos
    const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];
    const aeroportoIndex = aeroportos.findIndex(
      (a) => a.codigo === updatedDestination.aeroporto
    );

    const aeroportoAtualizado = {
      codigo: updatedDestination.aeroporto,
      cidade: updatedDestination.cidade,
      pais: updatedDestination.pais,
    };

    if (aeroportoIndex >= 0) {
      // Atualiza o aeroporto existente
      aeroportos[aeroportoIndex] = aeroportoAtualizado;
    } else {
      // Adiciona um novo aeroporto se não existir
      aeroportos.push(aeroportoAtualizado);
    }

    localStorage.setItem("aeroportos", JSON.stringify(aeroportos));

    return { success: true, data: updatedDestination };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
/**
 * Remove um destino pelo ID
 * @param {number|string} id - ID do destino
 * @returns {Object} Resultado da operação com success e data/error
 */
export function deleteDestination(id) {
  try {
    loadFromLocalStorage(STORAGE_KEY, destinations);
    const index = destinations.findIndex((dest) => dest.id === parseInt(id));
    if (index === -1) {
      throw new Error("Destino não encontrado");
    }
    const deletedDestination = destinations[index];
    destinations.splice(index, 1);
    saveToLocalStorage(STORAGE_KEY, destinations);

    // Remover o aeroporto correspondente da lista de aeroportos
    // Nota: não removemos se houver outros destinos com o mesmo código de aeroporto
    const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];
    const codigoAeroporto = deletedDestination.aeroporto;

    // Verificar se este aeroporto é usado em outros destinos
    const outrosDestinos = destinations.some(
      (d) => d.aeroporto === codigoAeroporto
    );

    if (!outrosDestinos) {
      // Remover apenas se não for usado por outros destinos
      const novaListaAeroportos = aeroportos.filter(
        (a) => a.codigo !== codigoAeroporto
      );
      localStorage.setItem("aeroportos", JSON.stringify(novaListaAeroportos));
    }

    return { success: true, data: deletedDestination };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
/**
 * Obtém destinos por país
 * @param {string} country - Nome do país
 * @returns {Array} Array de destinos do país especificado
 */
export function getDestinationsByCountry(country) {
  loadFromLocalStorage(STORAGE_KEY, destinations);
  return destinations.filter(
    (dest) => dest.pais.toLowerCase() === country.toLowerCase()
  );
}
/**
 * Obtém todos os tipos de turismo disponíveis
 * @returns {Array} Array ordenado com tipos de turismo únicos
 */
export function getAvailableTourismTypes() {
  loadFromLocalStorage(STORAGE_KEY, destinations);
  const allTypes = new Set();
  destinations.forEach((dest) => {
    dest.tiposTurismo.forEach((tipo) => allTypes.add(tipo));
  });
  return Array.from(allTypes).sort();
}
/**
 * Obtém todas as opções de acessibilidade disponíveis
 * @returns {Array} Array ordenado com opções de acessibilidade únicas
 */
export function getAvailableAccessibilityOptions() {
  loadFromLocalStorage(STORAGE_KEY, destinations);
  const allOptions = new Set();
  destinations.forEach((dest) => {
    dest.acessibilidade.forEach((opt) => allOptions.add(opt));
  });
  return Array.from(allOptions).sort();
}
/**
 * Ordena uma lista de destinos por campo específico
 * @param {Array} destinationsList - Lista de destinos para ordenar
 * @param {string} field - Campo para ordenação
 * @param {boolean} ascending - True para ordem crescente, false para decrescente
 * @returns {Array} Array ordenado de destinos
 */
export function sortDestinations(destinationsList, field, ascending = true) {
  return destinationsList.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (ascending) {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}
/**
 * Pagina uma lista de destinos
 * @param {Array} destinationsList - Lista de destinos
 * @param {number} page - Número da página (começando em 1)
 * @param {number} limit - Número de itens por página
 * @returns {Object} Objeto com dados paginados e informações de paginação
 */
export function paginateDestinations(destinationsList, page = 1, limit = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    data: destinationsList.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(destinationsList.length / limit),
      totalItems: destinationsList.length,
      itemsPerPage: limit,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, destinationsList.length),
    },
  };
}
/**
 * Obtém um destino pelo nome da cidade
 * @param {string} cidadeName - Nome da cidade
 * @returns {Object|null} Objeto do destino ou null se não encontrado
 */
export function getDestinationByCity(cidadeName) {
  if (!cidadeName) return null;

  loadFromLocalStorage(STORAGE_KEY, destinations);
  const cidadeLower = cidadeName.toLowerCase().trim();

  return (
    destinations.find(
      (dest) =>
        dest.cidade.toLowerCase() === cidadeLower ||
        dest.cidade.toLowerCase().includes(cidadeLower) ||
        cidadeLower.includes(dest.cidade.toLowerCase())
    ) || null
  );
}
