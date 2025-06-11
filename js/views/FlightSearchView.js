// Preenche os campos do topo da página de pesquisa com os dados vindos do sessionStorage
function preencherCamposPesquisa() {
  const params = sessionStorage.getItem('planit_search');
  if (!params) return;
  const dados = JSON.parse(params);

  // Origem
  const origemBtn = document.querySelector('#btn-open p');
  if (origemBtn && dados.origem) origemBtn.textContent = dados.origem;

  // Destino
  const destinoBtn = document.querySelector('#btn-destino p');
  if (destinoBtn && dados.destino) destinoBtn.textContent = dados.destino;
  // Caso o destino seja um div (como no HTML), procurar pelo texto
  const destinoDiv = document.querySelector('div[aria-label="destino"] p') || document.querySelectorAll('form > div')[0]?.querySelector('p');
  if (destinoDiv && dados.destino) destinoDiv.textContent = dados.destino;

  // Datas e viajantes
  const datasDiv = document.querySelectorAll('form > div')[1];
  if (datasDiv && dados.dataPartida && dados.dataRegresso) {
    const datasP = datasDiv.querySelector('p');
    if (datasP) datasP.textContent = `${dados.dataPartida} - ${dados.dataRegresso}`;
    const viajantesP = datasDiv.querySelectorAll('p')[1];
    if (viajantesP) viajantesP.textContent = `${dados.adultos} Adulto(s), ${dados.criancas} Criança(s), ${dados.bebes} Bebé(s)`;
  }

  // Tipo de turismo
  const tipoTurismoP = document.querySelectorAll('form > div')[2]?.querySelectorAll('p')[1];
  if (tipoTurismoP && dados.tipoTurismo) tipoTurismoP.textContent = dados.tipoTurismo;

  // Acessibilidade
  const acessibilidadeP = document.querySelectorAll('form > div')[3]?.querySelectorAll('p')[1];
  if (acessibilidadeP && dados.acessibilidade) acessibilidadeP.textContent = dados.acessibilidade;
}

document.addEventListener('DOMContentLoaded', preencherCamposPesquisa);