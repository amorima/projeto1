import { loadFromLocalStorage, saveToLocalStorage, getNextId } from './ModelHelpers.js';
let atividades = [];
const STORAGE_KEY = 'atividades';
/**
 * Inicializa o modelo de atividades carregando dados do localStorage
 */
export function init() {
    loadFromLocalStorage(STORAGE_KEY, atividades);
}
/**
 * Obtém todas as atividades
 * @returns {Array} Lista de todas as atividades
 */
export function getAll() {
    loadFromLocalStorage(STORAGE_KEY, atividades);
    return [...atividades];
}
/**
 * Obtém uma atividade pelo ID
 * @param {number} id - ID da atividade
 * @returns {Object|undefined} Atividade encontrada ou undefined
 */
export function getById(id) {
    loadFromLocalStorage(STORAGE_KEY, atividades);
    return atividades.find(atividade => atividade.id === parseInt(id));
}
/**
 * Procura atividades com base num termo de pesquisa
 * @param {string} termoPesquisa - Termo para pesquisar
 * @returns {Array} Lista de atividades que correspondem à pesquisa
 */
export function search(termoPesquisa) {
    loadFromLocalStorage(STORAGE_KEY, atividades);
    if (!termoPesquisa || termoPesquisa.trim() === '') {
        return [...atividades];
    }
    const termo = termoPesquisa.toLowerCase().trim();
    return atividades.filter(atividade => 
        atividade.nome.toLowerCase().includes(termo) ||
        atividade.descricao.toLowerCase().includes(termo) ||
        atividade.tipoTurismo.toLowerCase().includes(termo) ||
        (atividade.acessibilidade && atividade.acessibilidade.some(acc => 
            acc.toLowerCase().includes(termo)
        ))
    );
}
/**
 * Ordena uma lista de atividades
 * @param {Array} listaAtividades - Lista de atividades para ordenar
 * @param {string} campo - Campo para ordenação
 * @param {boolean} ascendente - Se true ordena ascendente, se false descendente
 * @returns {Array} Lista ordenada de atividades
 */
export function sort(listaAtividades, campo, ascendente = true) {
    const ordenada = [...listaAtividades].sort((a, b) => {
        let valorA = '';
        let valorB = '';
        switch (campo) {
            case 'act_name':
                valorA = a.nome || '';
                valorB = b.nome || '';
                break;
            case 'act_turism':
                valorA = a.tipoTurismo || '';
                valorB = b.tipoTurismo || '';
                break;
            case 'act_description':
                valorA = a.descricao || '';
                valorB = b.descricao || '';
                break;
            case 'act_destinoId':
                valorA = a.destinoId || 0;
                valorB = b.destinoId || 0;
                break;
            case 'act_acess':
                valorA = Array.isArray(a.acessibilidade) ? a.acessibilidade.join(', ') : '';
                valorB = Array.isArray(b.acessibilidade) ? b.acessibilidade.join(', ') : '';
                break;
            default:
                valorA = a.nome || '';
                valorB = b.nome || '';
        }
        if (typeof valorA === 'string') {
            return ascendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        } else {
            return ascendente ? valorA - valorB : valorB - valorA;
        }
    });
    return ordenada;
}
/**
 * Adiciona uma nova atividade
 * @param {Object} dadosAtividade - Dados da nova atividade
 * @returns {Object} Resultado da operação com success e data/error
 */
export function add(dadosAtividade) {
    try {
        if (!dadosAtividade.nome || !dadosAtividade.destinoId || !dadosAtividade.tipoTurismo) {
            throw new Error('Nome, destino e tipo de turismo são obrigatórios');
        }
        loadFromLocalStorage(STORAGE_KEY, atividades);
        const existente = atividades.find(atividade => 
            atividade.nome.toLowerCase() === dadosAtividade.nome.toLowerCase() &&
            atividade.destinoId === parseInt(dadosAtividade.destinoId)
        );
        if (existente) {
            throw new Error('Esta atividade já existe para este destino');
        }
        const novaAtividade = {
            id: getNextId(atividades),
            destinoId: parseInt(dadosAtividade.destinoId),
            tipoTurismo: dadosAtividade.tipoTurismo.trim(),
            nome: dadosAtividade.nome.trim(),
            foto: dadosAtividade.foto || `https://placehold.co/600x400/A0522D/FFFFFF?text=${encodeURIComponent(dadosAtividade.nome)}`,
            descricao: dadosAtividade.descricao ? dadosAtividade.descricao.trim() : '',
            acessibilidade: Array.isArray(dadosAtividade.acessibilidade) ? dadosAtividade.acessibilidade : [dadosAtividade.acessibilidade || 'Não especificado']
        };
        atividades.push(novaAtividade);
        saveToLocalStorage(STORAGE_KEY, atividades);
        return { success: true, data: novaAtividade };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Atualiza uma atividade existente
 * @param {number} id - ID da atividade a atualizar
 * @param {Object} dadosAtividade - Novos dados da atividade
 * @returns {Object} Resultado da operação com success e data/error
 */
export function update(id, dadosAtividade) {
    try {
        loadFromLocalStorage(STORAGE_KEY, atividades);
        const indice = atividades.findIndex(atividade => atividade.id === parseInt(id));
        if (indice === -1) {
            throw new Error('Atividade não encontrada');
        }
        if (!dadosAtividade.nome || !dadosAtividade.destinoId || !dadosAtividade.tipoTurismo) {
            throw new Error('Nome, destino e tipo de turismo são obrigatórios');
        }
        const existente = atividades.find(atividade => 
            atividade.id !== parseInt(id) &&
            atividade.nome.toLowerCase() === dadosAtividade.nome.toLowerCase() &&
            atividade.destinoId === parseInt(dadosAtividade.destinoId)
        );
        if (existente) {
            throw new Error('Esta atividade já existe para este destino');
        }
        atividades[indice] = {
            ...atividades[indice],
            destinoId: parseInt(dadosAtividade.destinoId),
            tipoTurismo: dadosAtividade.tipoTurismo.trim(),
            nome: dadosAtividade.nome.trim(),
            foto: dadosAtividade.foto || atividades[indice].foto,
            descricao: dadosAtividade.descricao ? dadosAtividade.descricao.trim() : '',
            acessibilidade: Array.isArray(dadosAtividade.acessibilidade) ? dadosAtividade.acessibilidade : [dadosAtividade.acessibilidade || 'Não especificado']
        };
        saveToLocalStorage(STORAGE_KEY, atividades);
        return { success: true, data: atividades[indice] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Remove uma atividade
 * @param {number} id - ID da atividade a remover
 * @returns {Object} Resultado da operação com success e data/error
 */
export function remove(id) {
    try {
        loadFromLocalStorage(STORAGE_KEY, atividades);
        const indice = atividades.findIndex(atividade => atividade.id === parseInt(id));
        if (indice === -1) {
            throw new Error('Atividade não encontrada');
        }
        const atividadeRemovida = atividades[indice];
        atividades.splice(indice, 1);
        saveToLocalStorage(STORAGE_KEY, atividades);
        return { success: true, data: atividadeRemovida };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Obtém o nome do destino pelo ID
 * @param {number} destinoId - ID do destino
 * @returns {string} Nome do destino ou mensagem de erro
 */
export function getDestinationName(destinoId) {
    try {
        const destinos = JSON.parse(localStorage.getItem('destinos') || '[]');
        const destino = destinos.find(d => d.id === parseInt(destinoId));
        return destino ? `${destino.cidade}, ${destino.pais}` : 'Destino não encontrado';
    } catch {
        return 'Destino não encontrado';
    }
}
/**
 * Obtém as primeiras atividades para o dashboard
 * @param {number} quantidade - Número de atividades a retornar
 * @returns {Array} Lista das primeiras atividades
 */
export function getFirst(quantidade = 5) {
    loadFromLocalStorage(STORAGE_KEY, atividades);
    return atividades.slice(0, quantidade);
}
