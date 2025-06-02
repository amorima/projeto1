import {
  showCookieBanner,
  getFormData,
  showToast,
  getUserLocation,
} from "./ViewHelpers.js";

/* Código para aumentar e diminuir o número de pessoas na sidebar */
/* em português de portugal */

const btnMais = document.getElementById("btn-mais");
const btnMenos = document.getElementById("btn-menos");
const inputPessoas = document.getElementById("input-pessoas");

/* verifica se os elementos existem antes de usar */
if (btnMais && btnMenos && inputPessoas) {
  btnMais.onclick = function() {
    /* aumenta o valor até 15 */
    let valor = parseInt(inputPessoas.value, 10);
    if (valor < 15) {
      inputPessoas.value = valor + 1;
    } else {
      /* mostra toast se tentar passar de 15 */
      showToast("O máximo de pessoas é 15.", "error");
    }
  }

  btnMenos.onclick = function() {
    /* diminui o valor até 1 */
    let valor = parseInt(inputPessoas.value, 10);
    if (valor > 1) {
      inputPessoas.value = valor - 1;
    }
  }

  /* quando o input é alterado manualmente */
  inputPessoas.oninput = function() {
    /* converte o valor para número */
    let valor = parseInt(inputPessoas.value, 10);
    /* se não for número ou menor que 1, volta para 1 */
    if (isNaN(valor) || valor < 1) {
      inputPessoas.value = 1;
    }
    /* se for maior que 15, mostra toast e volta para 15 */
    if (valor > 15) {
      showToast("O máximo de pessoas é 15.", "error");
      inputPessoas.value = 15;
    }
  }
}