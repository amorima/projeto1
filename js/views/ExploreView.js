import {
  init,
  getTripsWithCoordinates,
  getReviewsByDestino,
  getCompanhiaAereaByNome,
  getVoosByDestino,
} from "../models/FlightModel.js";
import * as User from "../models/UserModel.js";
import { showToast } from "./ViewHelpers.js";
document.addEventListener("DOMContentLoaded", () => {
  console.log("🗺️ ExploreView: DOM loaded, starting initialization...");
  
  // Browser compatibility checks
  console.log("🌐 ExploreView: Browser compatibility:", {
    fetch: typeof fetch !== 'undefined',
    localStorage: typeof Storage !== 'undefined',
    Promise: typeof Promise !== 'undefined',
    arrow_functions: (() => true)(),
    modules: typeof module !== 'undefined' || typeof window !== 'undefined'
  });
  
  // Check if key HTML elements exist
  const mapElement = document.getElementById("map");
  const panelElement = document.getElementById("slide-panel");
  const headerElement = document.getElementById("header-placeholder");
    console.log("🔍 ExploreView: HTML elements check:");
  console.log("  - Map element:", !!mapElement);
  console.log("  - Panel element:", !!panelElement);
  console.log("  - Header element:", !!headerElement);
  console.log("  - showToast function available:", typeof showToast);
  if (!mapElement || !panelElement) {
    console.error("❌ ExploreView: Critical HTML elements missing! Cannot continue.");
    return;
  }

  // Declare enriched variable to be accessible throughout the function
  let enriched = [];
  
  // Inicialização do modelo de viagens
  try {
    console.log("🔧 ExploreView: Initializing User model...");
    console.log("🔍 ExploreView: User functions available:", {
      init: typeof User.init,
      getUserLogged: typeof User.getUserLogged,
      addComment: typeof User.addComment,
      addPontos: typeof User.addPontos,
      update: typeof User.update
    });
    
    User.init();
    console.log("✅ ExploreView: User model initialized successfully");
    
    console.log("🔧 ExploreView: Initializing Flight model...");
    console.log("🔍 ExploreView: Flight functions available:", {
      init: typeof init,
      getTripsWithCoordinates: typeof getTripsWithCoordinates,
      getReviewsByDestino: typeof getReviewsByDestino,
      getVoosByDestino: typeof getVoosByDestino
    });
    
    init();
    console.log("✅ ExploreView: Flight model initialized successfully");
    
    // Check localStorage data
    console.log("💾 ExploreView: LocalStorage data check:", {
      user: !!localStorage.user,
      reviews: !!localStorage.reviews,
      flights: !!localStorage.flights,
      loggedUser: !!sessionStorage.loggedUser
    });
    
    if (localStorage.user) {
      const userData = JSON.parse(localStorage.user);
      console.log("👥 ExploreView: User data length:", Array.isArray(userData) ? userData.length : "not array");
    }
    
    if (sessionStorage.loggedUser) {
      const loggedUser = JSON.parse(sessionStorage.loggedUser);
      console.log("👤 ExploreView: Logged user:", loggedUser.username || "no username");
    }
    
    console.log("🔧 ExploreView: Getting trips with coordinates...");
    enriched = getTripsWithCoordinates();
    console.log("✅ ExploreView: Found", enriched.length, "trips with coordinates:", enriched);
    
    // Verify data structure
    if (enriched.length > 0) {
      console.log("📊 ExploreView: Sample trip data:", enriched[0]);
    } else {
      console.warn("⚠️ ExploreView: No trips found! Check data initialization");
    }
  } catch (error) {
    console.error("❌ ExploreView: Error during initialization:", error);
    return;
  }// URLs para tile layers claro e escuro
  const lightTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTileUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  
  // Check if Leaflet is available
  console.log("🍃 ExploreView: Leaflet library available:", typeof L !== 'undefined');
  if (typeof L === 'undefined') {
    console.error("❌ ExploreView: Leaflet library not loaded!");
    return;
  }
  
  // Criação do mapa centrado na Europa e layer inicial conforme o tema
  console.log("🗺️ ExploreView: Creating Leaflet map...");
  const map = L.map("map", { zoomControl: false }).setView([47.526, 8.2551], 5);
  console.log("✅ ExploreView: Map created successfully");
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
  }).observe(document.documentElement, { attributes: true });  // Configuração do painel deslizante usando classes Tailwind
  const panel = document.getElementById("slide-panel");
  console.log("🎯 ExploreView: Slide panel element found:", !!panel);
  
  if (!panel) {
    console.error("❌ ExploreView: Slide panel element not found! Check HTML structure");
    return;
  }
  
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
  document.head.appendChild(styleElement);  // Certifica que o painel está acima do mapa
  console.log("🗺️ ExploreView: Map element found:", !!mapElement);
  
  if (!mapElement) {
    console.error("❌ ExploreView: Map element not found! Check HTML structure");
    return;
  }
  
  mapElement.style.zIndex = "10";
  /**
   * Preenche o painel com os dados da viagem e anima a sua aparição.
   * Exibe informações detalhadas sobre o destino, voos disponíveis e avaliações dos usuários.
   */  function showPanel(trip) {
    console.log("📋 ExploreView: showPanel called with trip:", trip);
    
    // Buscar informações adicionais
    console.log("🔍 ExploreView: Getting reviews for destination:", trip.destino);
    const reviews = getReviewsByDestino(trip.destino);
    console.log("📝 ExploreView: Found reviews:", reviews);
    
    console.log("✈️ ExploreView: Getting flights for destination:", trip.destino);
    const voos = getVoosByDestino(trip.destino);
    console.log("🛫 ExploreView: Found flights:", voos);
    
    // Calcular média das avaliações - filtrar apenas avaliações válidas
    const avaliacoes = reviews.map((review) => review.avaliacao).filter(rating => rating && rating > 0);
    console.log("⭐ ExploreView: Valid ratings:", avaliacoes);
    const mediaAvaliacoes = avaliacoes.length
      ? (avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length).toFixed(1)
      : "0.0";
    console.log("📊 ExploreView: Average rating:", mediaAvaliacoes);
    
    // Obter usuário atual (se logado)
    const currentUser = User.getUserLogged();
    console.log("👤 ExploreView: Current user:", currentUser);
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
          "bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex flex-col cursor-pointer hover:shadow-lg transition-shadow";
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
        // Adiciona evento de clique para redirecionar
        vooElement.addEventListener("click", () => {
          window.location.href = `flight_itinerary.html?id=${encodeURIComponent(voo.numeroVoo)}`;
        });
        voosContainer.appendChild(vooElement);
      });
    }    // Preencher a seção de avaliações
    const reviewsContainer = panel.querySelector("#reviews-container");
    console.log("📦 ExploreView: Reviews container found:", !!reviewsContainer);
    console.log("📊 ExploreView: Processing reviews for display:", reviews.length, "reviews");
    
    if (reviews.length === 0) {
      console.log("⚠️ ExploreView: No reviews to display");
      reviewsContainer.innerHTML =
        '<p class="text-gray-500 dark:text-gray-400 italic">Nenhuma avaliação disponível para este destino.</p>';
    } else {
      console.log("✅ ExploreView: Displaying", reviews.length, "reviews");
      reviews.forEach((review, index) => {
        console.log(`📝 ExploreView: Processing review ${index + 1}:`, review);
        // Criar elemento de revisão
        const reviewElement = document.createElement("div");
        reviewElement.className = "bg-gray-50 dark:bg-gray-900 rounded-lg p-3";
        // Determinar tipo de usuário baseado na pontuação de avaliação
        let userType = "Aventureiro"
        if(User.getUserByName(review.nomePessoa)){
          const user = User.getUserByName(review.nomePessoa);
          if (user.pontos >= 5000) {
            userType = "Embaixador";
          } else if (user.pontos >= 3000) {
            userType = "Globetrotter";
          } else if (user.pontos >= 1500) {
            userType = "Aventureiro";
          } else if (user.pontos >= 250) {
            userType = "Viajante";
          } else {
            userType = "Explorador";
          }
        } else {
          userType = "Explorador";
        }
        // Tentar obter a imagem do usuário, se disponível
        const userImage = User.getUserImage(review.nomePessoa);
        let htmlAdd = "";
        // Corrigir caminho do avatar como no NavbarView.js
        let avatarPath = null;
        if (userImage) {
          if (userImage.startsWith("data:")) {
            avatarPath = userImage;
          } else if (userImage.startsWith("../")) {
            avatarPath = userImage;
          } else {
            avatarPath = `..${userImage}`;
          }
          htmlAdd = `
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xl">
                <img src="${avatarPath}" alt="${review.nomePessoa}" class="w-10 h-10 rounded-full object-cover"></img>
              </div>
            </div>`
        } else {
          htmlAdd = `
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xl">
                ${review.nomePessoa.charAt(0)}
              </div>
            </div>`
        }
        // Gerar HTML da revisão
        reviewElement.innerHTML = `
          <div class="flex items-start">
            ${htmlAdd}
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
    }    // Funcionalidade para adicionar nova avaliação
    const addReviewBtn = panel.querySelector("#add-review");
    console.log("🎯 ExploreView: Add review button found:", !!addReviewBtn);
    
    addReviewBtn.addEventListener("click", () => {
      console.log("🖱️ ExploreView: Add review button clicked");
      console.log("🔐 ExploreView: Current user check:", !!currentUser);
      
      if (!currentUser) {
        console.log("🚫 ExploreView: No user logged in, redirecting to login");
        window.location.href = "_login.html?redirect=explore.html";
      } else {
        console.log("✅ ExploreView: User is logged in, creating review modal");
        
        // Verificar se já existe um modal
        const existingModal = document.getElementById("review-modal");
        if (existingModal) {
          console.log("⚠️ ExploreView: Review modal already exists, removing it");
          existingModal.remove();
        }
        
        // Criar modal para adicionar avaliação
        console.log("🔨 ExploreView: Creating review modal");
        const modal = document.createElement("div");
        modal.id = "review-modal";
        modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40";        modal.innerHTML = `
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
          console.log("📝 ExploreView: Adding modal to document body");
        document.body.appendChild(modal);
          // Verify modal was added and check computed styles
        const addedModal = document.getElementById("review-modal");
        console.log("✅ ExploreView: Modal successfully added to DOM:", !!addedModal);
        
        if (addedModal) {
          const computedStyle = window.getComputedStyle(addedModal);
          console.log("🎨 ExploreView: Modal computed styles:", {
            display: computedStyle.display,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility
          });
        }
        
        // Star rating logic
        let selectedRating = 0;
        const stars = modal.querySelectorAll('#star-input span');
        console.log("⭐ ExploreView: Found star elements:", stars.length);stars.forEach((star, index) => {
          star.addEventListener('mouseenter', () => {
            const val = +star.dataset.value;
            stars.forEach((s, i) => {
              if (i < val) {
                s.classList.add('text-yellow-400');
                s.classList.remove('text-gray-300');
                s.style.fontVariationSettings = "'FILL' 1";
              } else {
                s.classList.remove('text-yellow-400');
                s.classList.add('text-gray-300');
                s.style.fontVariationSettings = "'FILL' 0";
              }
            });
          });
          
          star.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
              if (i < selectedRating) {
                s.classList.add('text-yellow-400');
                s.classList.remove('text-gray-300');
                s.style.fontVariationSettings = "'FILL' 1";
              } else {
                s.classList.remove('text-yellow-400');
                s.classList.add('text-gray-300');
                s.style.fontVariationSettings = "'FILL' 0";
              }
            });
          });
          
          star.addEventListener('click', () => {
            selectedRating = +star.dataset.value;
            console.log("⭐ ExploreView: Selected rating:", selectedRating);
            stars.forEach((s, i) => {
              if (i < selectedRating) {
                s.classList.add('text-yellow-400');
                s.classList.remove('text-gray-300');
                s.style.fontVariationSettings = "'FILL' 1";
              } else {
                s.classList.remove('text-yellow-400');
                s.classList.add('text-gray-300');
                s.style.fontVariationSettings = "'FILL' 0";
              }
            });
          });
        });
          // Close modal logic
        const closeModalBtn = modal.querySelector('#close-review-modal');
        const cancelBtn = modal.querySelector('#cancel-review');
        
        console.log("🔍 ExploreView: Modal close elements found:", {
          closeButton: !!closeModalBtn,
          cancelButton: !!cancelBtn
        });
        
        if (closeModalBtn) {
          closeModalBtn.onclick = () => {
            console.log("❌ ExploreView: Closing modal via close button");
            modal.remove();
          };
        }
        
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            console.log("❌ ExploreView: Closing modal via cancel button");
            modal.remove();
          };
        }
        
        modal.addEventListener('click', e => { 
          if (e.target === modal) {
            console.log("❌ ExploreView: Closing modal via backdrop click");
            modal.remove();
          }
        });
          // Submit review
        const reviewForm = modal.querySelector('#review-form');
        console.log("📋 ExploreView: Review form found:", !!reviewForm);
        
        if (!reviewForm) {
          console.error("❌ ExploreView: Review form not found in modal!");
          return;
        }
        
        reviewForm.onsubmit = (e) => {
          console.log("📤 ExploreView: Review form submitted");
          e.preventDefault();
          
          const commentTextarea = modal.querySelector('#review-comment');
          console.log("🔍 ExploreView: Comment textarea found:", !!commentTextarea);
          
          if (!commentTextarea) {
            console.error("❌ ExploreView: Comment textarea not found!");
            return;
          }
          
          const comment = commentTextarea.value.trim();
          console.log("💬 ExploreView: Comment text:", comment);
          console.log("⭐ ExploreView: Selected rating:", selectedRating);
            if (!selectedRating || !comment) {
            console.log("⚠️ ExploreView: Missing rating or comment");
            alert('Por favor, preencha todos os campos e selecione uma classificação.');
            return;
          }
          
          // Check if user already reviewed this destination (for points logic only)
          console.log("🔍 ExploreView: Checking if user already reviewed destination for points logic");
          const existingReviews = getReviewsByDestino(trip.destino);
          console.log("📋 ExploreView: Existing reviews for destination:", existingReviews);
          
          const userAlreadyReviewed = existingReviews.some(review => 
            review.nomePessoa === currentUser.username
          );
          console.log("🔄 ExploreView: User already reviewed this destination?", userAlreadyReviewed);
          
          // Note: We no longer prevent multiple reviews, just track for points
          const isFirstReview = !userAlreadyReviewed;// Adiciona o comentário usando a função do UserModel
            try {
              console.log("💾 ExploreView: Attempting to save review...");
              
              // Extract city name from destination format "XXX - City" to match getReviewsByDestino logic
              const cidadeDestino = trip.destino.includes(" - ") 
                ? trip.destino.split(" - ")[1] 
                : trip.destino;
              console.log("🏙️ ExploreView: Extracted city name:", cidadeDestino);
              
              const reviewData = { 
                comentario: comment, 
                avaliacao: selectedRating, 
                data: new Date().toISOString(),
                nomePessoa: currentUser.username
              };
              console.log("📝 ExploreView: Review data:", reviewData);
              console.log("🏠 ExploreView: Trip data:", trip);
                // Create a place object with just the city name to match how getReviewsByDestino works
              const placeForReview = { 
                destino: cidadeDestino,
                name: cidadeDestino
              };
              console.log("📍 ExploreView: Place object for review:", placeForReview);
              
              // O addComment espera (user, place, comment). Vamos passar um objeto com rating e texto.
              const result = User.addComment(currentUser, placeForReview, reviewData);
              console.log("✅ ExploreView: addComment result:", result);
              
              // Award 20 points only for first review on this destination
              if (isFirstReview) {
                console.log("🎁 ExploreView: This is user's first review for this destination, adding 20 points");
                User.addPontos(currentUser, 20, `Primeira avaliação para ${cidadeDestino}`);
                User.update(currentUser.id, currentUser);
                
                // Update session storage
                sessionStorage.setItem("loggedUser", JSON.stringify(currentUser));
                console.log("💾 ExploreView: Updated user data in session storage");
                
                // Show toast notification for points awarded
                showToast(`🎉 Parabéns! Ganhou 20 pontos pela sua primeira avaliação em ${cidadeDestino}!`, "success");
                console.log("🎊 ExploreView: Showed points toast notification");
              } else {
                console.log("ℹ️ ExploreView: User already reviewed this destination before, no points awarded");
                showToast("Avaliação adicionada com sucesso!", "success");
              }
              modal.remove();
            console.log("🔄 ExploreView: Refreshing panel to show new review");
            
            // Debug: Check if the new review is in the data before refreshing
            console.log("🔍 ExploreView: Checking reviews after adding new one...");
            const updatedReviews = getReviewsByDestino(trip.destino);
            console.log("� ExploreView: Reviews after adding new one:", updatedReviews);
            console.log("🔢 ExploreView: Total reviews now:", updatedReviews.length);
            
            // Check if our new review is in the list
            const ourNewReview = updatedReviews.find(r => r.id === result.id);
            console.log("🆔 ExploreView: Our new review found in list?", !!ourNewReview);
            if (ourNewReview) {
              console.log("✅ ExploreView: New review details:", ourNewReview);
            }
            
            // Atualiza painel para mostrar nova avaliação
            showPanel(trip);
          } catch (err) {
            console.error("❌ ExploreView: Error adding review:", err);
            alert('Erro ao adicionar avaliação: ' + err.message);
          }
        };
      }
    });    // Funcionalidade para responder às avaliações
    const replyButtons = panel.querySelectorAll(".review-reply-btn");
    console.log("💬 ExploreView: Found reply buttons:", replyButtons.length);
    
    replyButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("🖱️ ExploreView: Reply button clicked");
        
        if (!currentUser) {
          console.log("🚫 ExploreView: No user logged in for reply");
          alert("Por favor, faça login para responder a esta avaliação");
          window.location.href = "_login.html?redirect=explore.html";
        } else {
          const reviewId = btn.dataset.reviewId;
          console.log("📝 ExploreView: Replying to review ID:", reviewId);
          
          // Modal para resposta
          const existingReplyModal = document.getElementById("reply-modal");
          if (existingReplyModal) {
            console.log("⚠️ ExploreView: Reply modal already exists, removing it");
            existingReplyModal.remove();
          }
          
          console.log("🔨 ExploreView: Creating reply modal");
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
          `;          document.body.appendChild(replyModal);
          
          // Fechar modal
          replyModal.querySelector('#close-reply-modal').onclick = () => {
            console.log("❌ ExploreView: Closing reply modal via close button");
            replyModal.remove();
          };
          replyModal.querySelector('#cancel-reply').onclick = () => {
            console.log("❌ ExploreView: Closing reply modal via cancel button");
            replyModal.remove();
          };
          replyModal.addEventListener('click', e => { 
            if (e.target === replyModal) {
              console.log("❌ ExploreView: Closing reply modal via backdrop click");
              replyModal.remove();
            }
          });
          
          // Submeter resposta
          replyModal.querySelector('#reply-form').onsubmit = (e) => {
            console.log("📤 ExploreView: Reply form submitted");
            e.preventDefault();
            
            const comment = replyModal.querySelector('#reply-comment').value.trim();
            console.log("💬 ExploreView: Reply comment:", comment);
            
            if (!comment) {
              console.log("⚠️ ExploreView: Reply comment is empty");
              alert('Por favor, escreva a sua resposta.');
              return;
            }
            
            try {
              console.log("💾 ExploreView: Attempting to save reply...");
              const replyData = {
                nomePessoa: currentUser.username,
                comentario: comment,
                data: new Date().toISOString()
              };
              console.log("📝 ExploreView: Reply data:", replyData);
              
              const result = User.addReplyToReview(reviewId, replyData);
              console.log("✅ ExploreView: addReplyToReview result:", result);
              
              replyModal.remove();
              console.log("🔄 ExploreView: Refreshing panel to show new reply");
              showPanel(trip);
            } catch (err) {
              console.error("❌ ExploreView: Error adding reply:", err);
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
  }  // Criação dos marcadores para cada viagem com coords
  console.log("📍 ExploreView: Creating markers for", enriched.length, "trips");
  enriched.forEach(({ trip, coords }, index) => {
    console.log(`📌 ExploreView: Creating marker ${index + 1} for trip:`, trip.destino);
    const { latitude, longitude } = coords;
    // Cria um marcador personalizado com o preço
    const marker = criarMarcadorPreco(trip, [latitude, longitude]).addTo(map);
    // Adiciona o evento de clique para mostrar o painel
    marker.on("click", () => {
      console.log("🖱️ ExploreView: Marker clicked for destination:", trip.destino);
      showPanel(trip);
    });
  });
  
  console.log("✅ ExploreView: All markers created and map initialized successfully");
});
