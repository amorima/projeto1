import {
  init,
  getTripsWithCoordinates,
  getReviewsByDestino,
  getCompanhiaAereaByNome,
  getVoosByDestino,
} from "../models/FlightModel.js";
import * as User from "../models/UserModel.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicialização do modelo de viagens
  init();

  const enriched = getTripsWithCoordinates();

  // URLs para tile layers claro e escuro
  const lightTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTileUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Criação do mapa centrado na Europa e layer inicial conforme o tema
  const map = L.map("map", { zoomControl: false }).setView([47.526, 8.2551], 5);
  const baseLayer = L.tileLayer(
    document.documentElement.classList.contains("dark")
      ? darkTileUrl
      : lightTileUrl,
    { attribution: "&copy; OpenStreetMap - ESMAD - P.PORTO" }
  ).addTo(map);

  // Observa alterações na classe 'dark' para alternar o tile layer
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "class") {
        const isDark = document.documentElement.classList.contains("dark");
        baseLayer.setUrl(isDark ? darkTileUrl : lightTileUrl);
      }
    }
  }).observe(document.documentElement, { attributes: true }); // Configuração do painel deslizante usando classes Tailwind
  const panel = document.getElementById("slide-panel");
  panel.className =
    "fixed top-24 left-0 bottom-0 w-0 overflow-hidden transition-all duration-300 ease-in-out " +
    "shadow-md z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans custom-scrollbar";

  // Adicionando estilo personalizado para a barra de rolagem
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(155, 155, 155, 0.5);
      border-radius: 20px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(155, 155, 155, 0.8);
    }
  `;
  document.head.appendChild(styleElement);

  // Certifica que o painel está acima do mapa
  document.getElementById("map").style.zIndex = "10";
  /**
   * Preenche o painel com os dados da viagem e anima a sua aparição.
   * Exibe informações detalhadas sobre o destino, voos disponíveis e avaliações dos usuários.
   */
  function showPanel(trip) {
    // Buscar informações adicionais
    const reviews = getReviewsByDestino(trip.destino);
    const voos = getVoosByDestino(trip.destino);

    // Calcular média das avaliações
    const avaliacoes = reviews.map((review) => review.avaliacao);
    const mediaAvaliacoes = avaliacoes.length
      ? (avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length).toFixed(1)
      : "0.0";

    // Obter usuário atual (se logado)
    const currentUser = User.getUserLogged();

    // Montar o conteúdo do painel
    panel.innerHTML = `
      <div class="relative">
        <img src="${trip.imagem}" alt="${
      trip.destino
    }" class="w-full h-48 object-cover"/>
        <button id="close-panel" class="absolute top-2 right-2 text-2xl bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center">✕</button>
      </div>
        <!-- Cabeçalho com informações básicas do destino -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold">${trip.destino}</h2>
        
        <!-- Exibição da classificação média -->
        <div class="flex items-center mt-3">
          <div class="flex gap-1 mr-2" id="rating"></div>
          <span class="text-lg font-semibold">${mediaAvaliacoes}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">(${
            reviews.length
          } ${reviews.length === 1 ? "avaliação" : "avaliações"})</span>
        </div>
      </div>
      
      <!-- Seção de voos disponíveis -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-3">Voos disponíveis</h3>
        <div class="space-y-4" id="voos-disponiveis"></div>
      </div>
        <!-- Seção de avaliações -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-mono font-semibold"><span class="font-bold font-['Space_Mono']">Review</span><span class="font-['Space_Mono'] italic">It</span></h3>
          <button id="add-review" class="bg-Main-Primary hover:bg-Main-Dark text-white px-3 py-1 rounded-full text-sm">
            + Adicionar Avaliação
          </button>
        </div>
        <div id="reviews-container" class="space-y-4"></div>
      </div>
    `; // Geração de estrelas da avaliação média
    const ratingDiv = panel.querySelector("#rating");
    const mediaEstrelas =
      parseFloat(
        mediaAvaliacoes
      ); /* Lógica revista para exibir as estrelas corretamente */
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.className = "material-symbols-outlined text-yellow-400";

      // Configurar FILL para estrelas cheias e metade
      if (
        i <= Math.floor(mediaEstrelas) ||
        (i === Math.ceil(mediaEstrelas) && mediaEstrelas % 1 >= 0.8)
      ) {
        // Estrela cheia: posição menor ou igual à parte inteira OU
        // próxima posição com decimal >= 0.8
        star.textContent = "star";
        star.style.fontVariationSettings = "'FILL' 1";
      } else if (
        i === Math.ceil(mediaEstrelas) &&
        mediaEstrelas % 1 >= 0.3 &&
        mediaEstrelas % 1 < 0.8
      ) {
        // Meia estrela: próxima posição com decimal entre 0.3 e 0.8 (exclusive)
        star.textContent = "star_half";
        star.style.fontVariationSettings = "'FILL' 1";
      } else {
        // Estrela vazia: todos os outros casos
        star.textContent = "star_border";
        // Não aplicamos FILL em estrelas vazias
      }

      ratingDiv.appendChild(star);
    }

    // Preencher a seção de voos disponíveis
    const voosContainer = panel.querySelector("#voos-disponiveis");

    if (voos.length === 0) {
      voosContainer.innerHTML =
        '<p class="text-gray-500 dark:text-gray-400 italic">Nenhum voo disponível para este destino.</p>';
    } else {
      voos.forEach((voo) => {
        // Obter informações da companhia aérea
        const companhia = getCompanhiaAereaByNome(voo.companhia);
        const logoUrl = companhia?.logo || "../img/icons/ca_tap.jpg"; // Imagem padrão caso não encontre
        const vooElement = document.createElement("div");
        vooElement.className =
          "bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex flex-col";
        vooElement.innerHTML = `
          <div class="flex items-center mb-2">
            <div class="h-8 w-12 flex items-center justify-center mr-3">
              <img src="${logoUrl}" alt="${
          voo.companhia
        }" class="max-h-8 max-w-12 object-contain">
            </div>
            <div>
              <h4 class="font-semibold">${voo.companhia}</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">Voo ${
                voo.numeroVoo
              }</p>
            </div>
          </div>
          <div class="flex justify-between items-center mb-2">
            <div>
              <p class="text-sm font-medium">${
                voo.direto === "S" ? "Voo direto" : "Voo com escala"
              }</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${
                voo.origem
              } → ${voo.destino}</p>
              <div class="mt-1">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  <span class="font-medium">Ida:</span> ${voo.partida}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  <span class="font-medium">Volta:</span> ${
                    voo.dataVolta || "Não definida"
                  }
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg">€${voo.custo}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Ida e volta</p>
            </div>
          </div>
        `;
        voosContainer.appendChild(vooElement);
      });
    }

    // Preencher a seção de avaliações
    const reviewsContainer = panel.querySelector("#reviews-container");

    if (reviews.length === 0) {
      reviewsContainer.innerHTML =
        '<p class="text-gray-500 dark:text-gray-400 italic">Nenhuma avaliação disponível para este destino.</p>';
    } else {
      reviews.forEach((review) => {
        // Criar elemento de revisão
        const reviewElement = document.createElement("div");
        reviewElement.className = "bg-gray-50 dark:bg-gray-900 rounded-lg p-3";

        // Determinar tipo de usuário baseado na pontuação de avaliação
        let userType = "Visitante";
        if (review.avaliacao >= 4) {
          userType = "Aventureiro";
        } else if (review.avaliacao >= 3) {
          userType = "Viajante";
        } else {
          userType = "Explorador";
        }

        // Gerar HTML da revisão
        reviewElement.innerHTML = `
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xl">
                ${review.nomePessoa.charAt(0)}
              </div>
            </div>
            <div class="ml-3 flex-1">
              <div class="flex items-center">
                <h4 class="font-semibold">${review.nomePessoa}</h4>
                <span class="mx-2 text-gray-500 dark:text-gray-400">•</span>
                <span class="text-sm text-Main-Primary">${userType}</span>
              </div>
              
              <div class="flex items-center my-1">
                ${generateStars(review.avaliacao)}
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">${new Date(
                  review.data
                ).toLocaleDateString("pt-PT")}</span>
              </div>
              
              <p class="text-sm mt-1">${review.comentario}</p>
              
              <div class="mt-2 flex items-center">
                <button class="review-reply-btn text-sm text-Main-Primary hover:underline" data-review-id="${
                  review.id
                }">
                  Responder
                </button>
              </div>
              
              ${
                review.respostas && review.respostas.length > 0
                  ? `<div class="mt-3 ml-5 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                  ${review.respostas
                    .map(
                      (resposta) => `
                    <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div class="flex items-center">
                        <h5 class="font-semibold text-sm">${
                          resposta.nomePessoa
                        }</h5>
                        <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">${new Date(
                          resposta.data
                        ).toLocaleDateString("pt-PT")}</span>
                      </div>
                      <p class="text-sm mt-1">${resposta.comentario}</p>
                    </div>
                  `
                    )
                    .join("")}
                </div>`
                  : ""
              }
            </div>
          </div>
        `;

        reviewsContainer.appendChild(reviewElement);
      });
    }

    // Funcionalidade para adicionar nova avaliação
    const addReviewBtn = panel.querySelector("#add-review");
    addReviewBtn.addEventListener("click", () => {
      if (!currentUser) {
        window.location.href = "_login.html?redirect=explore.html";
      } else {
        // Criar modal para adicionar avaliação
        if (document.getElementById("review-modal")) return; // Evita múltiplos modais
        const modal = document.createElement("div");
        modal.id = "review-modal";
        modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40";
        modal.innerHTML = `
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button id="close-review-modal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
            <h2 class="text-xl font-bold mb-4">Adicionar Avaliação</h2>
            <form id="review-form" class="space-y-4">
              <div>
                <label class="block mb-1 font-medium">Classificação</label>
                <div id="star-input" class="flex gap-1">
                  ${[1,2,3,4,5].map(i => `<span data-value="${i}" class="material-symbols-outlined text-3xl text-gray-300 cursor-pointer">star</span>`).join("")}
                </div>
              </div>
              <div>
                <label class="block mb-1 font-medium">Comentário</label>
                <textarea id="review-comment" class="w-full rounded border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800" rows="3" required></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" id="cancel-review" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancelar</button>
                <button type="submit" class="px-4 py-2 rounded bg-Main-Primary text-white font-semibold">Submeter</button>
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(modal);

        // Star rating logic
        let selectedRating = 0;
        const stars = modal.querySelectorAll('#star-input span');
        stars.forEach(star => {
          star.addEventListener('mouseenter', () => {
            const val = +star.dataset.value;
            stars.forEach((s, i) => {
              s.classList.toggle('text-yellow-400', i < val);
              s.classList.toggle('text-gray-300', i >= val);
            });
          });
          star.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
              s.classList.toggle('text-yellow-400', i < selectedRating);
              s.classList.toggle('text-gray-300', i >= selectedRating);
            });
          });
          star.addEventListener('click', () => {
            selectedRating = +star.dataset.value;
            stars.forEach((s, i) => {
              s.classList.toggle('text-yellow-400', i < selectedRating);
              s.classList.toggle('text-gray-300', i >= selectedRating);
            });
          });
        });

        // Close modal logic
        modal.querySelector('#close-review-modal').onclick = () => modal.remove();
        modal.querySelector('#cancel-review').onclick = () => modal.remove();
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

        // Submit review
        modal.querySelector('#review-form').onsubmit = (e) => {
          e.preventDefault();
          const comment = modal.querySelector('#review-comment').value.trim();
          if (!selectedRating || !comment) {
            alert('Por favor, preencha todos os campos e selecione uma classificação.');
            return;
          }
          // Adiciona o comentário usando a função do UserModel
          try {
            // O addComment espera (user, place, comment). Vamos passar um objeto com rating e texto.
            User.addComment(currentUser, trip, { texto: comment, avaliacao: selectedRating, data: new Date().toISOString() });
            modal.remove();
            // Atualiza painel para mostrar nova avaliação
            showPanel(trip);
          } catch (err) {
            alert('Erro ao adicionar avaliação: ' + err.message);
          }
        };
      }
    });

    // Funcionalidade para responder às avaliações
    const replyButtons = panel.querySelectorAll(".review-reply-btn");
    replyButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!currentUser) {
          alert("Por favor, faça login para responder a esta avaliação");
          window.location.href = "_login.html?redirect=explore.html";
        } else {
          const reviewId = btn.dataset.reviewId;
          // Modal para resposta
          if (document.getElementById("reply-modal")) return;
          const replyModal = document.createElement("div");
          replyModal.id = "reply-modal";
          replyModal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40";
          replyModal.innerHTML = `
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button id="close-reply-modal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
              <h2 class="text-xl font-bold mb-4">Responder à Avaliação</h2>
              <form id="reply-form" class="space-y-4">
                <div>
                  <label class="block mb-1 font-medium">Comentário</label>
                  <textarea id="reply-comment" class="w-full rounded border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800" rows="3" required></textarea>
                </div>
                <div class="flex justify-end gap-2">
                  <button type="button" id="cancel-reply" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancelar</button>
                  <button type="submit" class="px-4 py-2 rounded bg-Main-Primary text-white font-semibold">Submeter</button>
                </div>
              </form>
            </div>
          `;
          document.body.appendChild(replyModal);

          // Fechar modal
          replyModal.querySelector('#close-reply-modal').onclick = () => replyModal.remove();
          replyModal.querySelector('#cancel-reply').onclick = () => replyModal.remove();
          replyModal.addEventListener('click', e => { if (e.target === replyModal) replyModal.remove(); });

          // Submeter resposta
          replyModal.querySelector('#reply-form').onsubmit = (e) => {
            e.preventDefault();
            const comment = replyModal.querySelector('#reply-comment').value.trim();
            if (!comment) {
              alert('Por favor, escreva a sua resposta.');
              return;
            }
            try {
              User.addReplyToReview(reviewId, {
                nomePessoa: currentUser.username,
                comentario: comment,
                data: new Date().toISOString()
              });
              replyModal.remove();
              showPanel(trip);
            } catch (err) {
              alert('Erro ao adicionar resposta: ' + err.message);
            }
          };
        }
      });
    }); // Fechar painel ao clicar no botão
    panel.querySelector("#close-panel").onclick = () => {
      // Adiciona overflow-hidden imediatamente para esconder o conteúdo durante a transição
      panel.className =
        "fixed top-24 left-0 bottom-0 w-0 overflow-hidden transition-all duration-300 ease-in-out shadow-md z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans";

      // Limpar o conteúdo do painel depois da animação de fechamento
      setTimeout(() => {
        panel.innerHTML = ""; // Sempre limpar o conteúdo após a animação
      }, 300); // tempo correspondente à duração da transição
    };
    // Animação de abertura
    panel.classList.remove("w-0");
    panel.classList.remove("overflow-hidden"); // Remove a classe overflow-hidden
    panel.className =
      "fixed top-24 left-0 bottom-0 w-full sm:w-96 overflow-auto transition-all duration-300 ease-in-out shadow-md z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans custom-scrollbar";
  }
  /**
   * Função auxiliar para gerar as estrelas de avaliação
   * @param {number} rating - Valor da avaliação (1-5)
   * @returns {string} HTML com as estrelas
   */ function generateStars(rating) {
    let starsHTML = "";
    const fullStars =
      Math.floor(rating); /* Lógica revista para exibir estrelas corretamente */
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        // Estrela cheia: posição menor ou igual à parte inteira
        starsHTML +=
          '<span class="material-symbols-outlined text-yellow-400 text-sm" style="font-variation-settings: \'FILL\' 1">star</span>';
      } else if (i === fullStars + 1 && rating % 1 >= 0.3 && rating % 1 < 0.8) {
        // Meia estrela: próxima posição com decimal entre 0.3 e 0.8 (exclusive)
        starsHTML +=
          '<span class="material-symbols-outlined text-yellow-400 text-sm" style="font-variation-settings: \'FILL\' 1">star_half</span>';
      } else if (i === fullStars + 1 && rating % 1 >= 0.8) {
        // Estrela cheia: próxima posição com decimal >= 0.8
        starsHTML +=
          '<span class="material-symbols-outlined text-yellow-400 text-sm" style="font-variation-settings: \'FILL\' 1">star</span>';
      } else {
        // Estrela vazia: todos os outros casos
        starsHTML +=
          '<span class="material-symbols-outlined text-yellow-400 text-sm">star_border</span>';
      }
    }

    return starsHTML;
  }

  // Função para criar um marcador personalizado com o preço da viagem
  function criarMarcadorPreco(trip, latlng) {
    const customIcon = L.divIcon({
      className: "price-marker",
      html: `
        <div class="bg-Main-Primary dark:bg-Main-Primary text-white font-sans font-bold py-1 px-3 rounded-full text-sm whitespace-nowrap">
          €${trip.custo}
        </div>
      `,
      iconSize: [60, 25],
      iconAnchor: [30, 13], // Centra o marcador na posição
    });

    // Cria o marcador com o ícone personalizado
    return L.marker(latlng, { icon: customIcon });
  }

  // Criação dos marcadores para cada viagem com coords
  enriched.forEach(({ trip, coords }) => {
    const { latitude, longitude } = coords;

    // Cria um marcador personalizado com o preço
    const marker = criarMarcadorPreco(trip, [latitude, longitude]).addTo(map);

    // Adiciona o evento de clique para mostrar o painel
    marker.on("click", () => showPanel(trip));
  });
});
