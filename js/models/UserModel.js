import {
  loadFromLocalStorage,
  saveToLocalStorage,
  getNextId,
} from "./ModelHelpers.js";

// ARRAY USERS
let users;
let newsletter;
let reviews = [];

// CARREGAR UTILIZADORES DA LOCALSTORAGE
export function init() {
  users = localStorage.user ? JSON.parse(localStorage.user) : [];
  // Garantir que todos os utilizadores têm user.pontos como inteiro
  users = users.map(u => ({ ...u, pontos: parseInt(u.pontos || 0, 10) }));
  newsletter = localStorage.newsletter
    ? loadFromLocalStorage("newsletter", newsletter)
    : [];
  reviews = localStorage.reviews ? JSON.parse(localStorage.reviews) : [];
}

// ADICIONAR UTILIZADOR
export function add(username, email, password, acceptNewsletter = false) {
  if (users.some((user) => user.email === email)) {
    throw Error(`Utilizador com email "${email}" já existe!`);
  } else {
    const newUser = new User(username, password, email, acceptNewsletter, "", 50, false, false);
    users.push(newUser);
    localStorage.setItem("user", JSON.stringify(users));

    /* Adicionar à newsletter se aceitar */
    if (acceptNewsletter) {
      newsletter.push({ email: email, date: new Date().toISOString() });
      saveToLocalStorage("newsletter", newsletter);
    }
  }
}

// ALTERAR DADOS DO UTILIZADOR
export function update(id, newUser) {
  // Garantir que o id é sempre número
  const userId = parseInt(id, 10);
  console.log('[DEBUG][UserModel] Utilizadores antes do update:', users);
  const index = users.findIndex((u) => parseInt(u.id, 10) === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...newUser, id: userId };
    localStorage.setItem("user", JSON.stringify(users));
    console.log('[DEBUG][UserModel] Utilizadores após o update:', users);
    return true;
  }
  console.error('[DEBUG][UserModel] Utilizador não encontrado para update. id:', id, 'users:', users);
  throw Error("Utilizador não encontrado");
}

// APAGAR UTILIZADOR
export function deleteUser(id) {
  const index = users.findIndex((u) => u.id == id);
  if (index !== -1) {
    users.splice(index, 1);
    localStorage.setItem("user", JSON.stringify(users));
    return true;
  }
  throw Error("Utilizador não encontrado");
}

// ALTERAR PALAVRA-PASSE
export function changePassword(email, newPassword) {
  const user = users.find((u) => u.email === email);
  if (user) {
    user.password = newPassword;
    localStorage.setItem("user", JSON.stringify(users));
    return true;
  }
  throw Error("Email não encontrado");
}

// LOGIN E MANIPULAÇÃO DE SESSÃO
/**
 * Autentica um utilizador e armazena suas informações na sessão.
 * @param {string} email - O email do utilizador a ser autenticado.
 * @param {string} password - A senha do utilizador a ser autenticado.
 * @return {boolean} Retorna true se o login for bem-sucedido, caso contrário, lança um erro.
 * @throws {Error} Se o email ou a senha estiverem incorretos.
 */
export function login(email, password) {
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (user) {
    sessionStorage.setItem("loggedUser", JSON.stringify(user));
    return true;
  } else {
    throw Error("Email ou palavra-passe incorretos!");
  }
}

/**
 * Remove o utilizador autenticado da sessão.
 * @description
 * Esta função remove o item "loggedUser" do sessionStorage, efetivamente desconectando o utilizador.
 * @example
 * import { logout } from './UserModel.js';
 * logout();
 * Agora o utilizador está desconectado e não há mais informações de sessão armazenadas.
 * @see isLogged - Para verificar se um utilizador está autenticado antes de chamar esta função.
 * @see getUserLogged - Para obter o utilizador autenticado antes de chamar esta função.
 * @see login - Para autenticar um utilizador e armazenar suas informações na sessão.
 */
export function logout() {
  sessionStorage.removeItem("loggedUser");
}

/**
 * Verifica se um utilizador está autenticado.
 * @return {boolean} Retorna true se o utilizador estiver autenticado, caso contrário, retorna false.
 * @description
 * Esta função verifica se há um utilizador autenticado na sessão,
 * procurando por um item chamado "loggedUser" no sessionStorage.
 * Se o item existir, a função retorna true, indicando que o utilizador está autenticado.
 * Caso contrário, retorna false.
 * @example
 * import { isLogged } from './UserModel.js';
 * const loggedIn = isLogged();
 * if (loggedIn) {
 *  console.log('Utilizador está autenticado.');
 * } else {
 *  console.log('Utilizador não está autenticado.');
 * }
 * @see getUserLogged - Para obter o utilizador autenticado, se existir.
 */
export function isLogged() {
  return sessionStorage.getItem("loggedUser") ? true : false;
}

/**
 * Obtém o utilizador autenticado.
 * @return {Object|null} O utilizador autenticado ou null se não houver utilizador autenticado.
 * @description
 * Esta função verifica se há um utilizador autenticado na sessão.
 * Se houver, retorna o utilizador como um objeto. Caso contrário, retorna null.
 * @example
 * import { getUserLogged } from './UserModel.js';
 * const user = getUserLogged();
 * if (user) {
 *   console.log(`Bem-vindo, ${user.username}!`);
 * } else {
 *   console.log('Nenhum utilizador autenticado.');
 * }
 * @see isLogged - Para verificar se há um utilizador autenticado.
 */
export function getUserLogged() {
  return JSON.parse(sessionStorage.getItem("loggedUser"));
}

export function getUserById(id) {
  const user = users.find((u) => u.id == id);
  if (user) {
    return user;
  }
  throw Error("Utilizador não encontrado");
}

/**
 * Verifica se um utilizador é administrador.
 * @param {Object} user - O utilizador a ser verificado.
 * @return {boolean} Retorna true se o utilizador for administrador, caso contrário, retorna false.
 */
export function isAdmin(user) {
  return user && user.admin === true;
}

// USER NEWSLETTER
/**
 * Adiciona um utilizador à lista de subscritores da newsletter.
 * @param {string} mail - O email do utilizador a ser adicionado.
 * @description
 * Esta função verifica se o email fornecido já está na lista de subscritores da newsletter.
 * Se o email já existir, lança um erro. Caso contrário, cria um novo objeto User com o email fornecido,
 * adiciona-o à lista de subscritores e salva a lista atualizada no localStorage.
 * @example
 * import { addNewsletterUser } from './UserModel.js';
 * addNewsletterUser('user@example.com');
 * Agora o utilizador com o email 'user@example.com' está subscrito à newsletter.
 */
export function addNewsletterUser(email) {
  const newsletterUser = new User("", "", email);
  newsletter.push(newsletterUser);
  saveToLocalStorage("newsletter", newsletter);
}

/**
 * Remove um utilizador da lista de subscritores da newsletter.
 * @param {string} mail - O email do utilizador a ser removido.
 * @description
 * Esta função procura o utilizador com o email fornecido na lista de subscritores da newsletter.
 * Se o utilizador for encontrado, ele é removido da lista e a lista atualizada é salva no localStorage.
 * Se o utilizador não for encontrado, lança um erro indicando que não há subscrição encontrada.
 * @example
 * import { removeNewsletterUser } from './UserModel.js';
 * removeNewsletterUser('user@gmail.com');
 * Agora o utilizador com o email 'user@gmail.com' foi removido da subscrição da newsletter.
 *
 * @throws {Error} Se não houver subscrição encontrada com o email fornecido.
 */
export function removeNewsletterUser(email) {
  const index = newsletter.findIndex((n) => n.email == email);
  if (index !== -1) {
    newsletter.splice(index, 1);
    saveToLocalStorage("newsletter", newsletter);
    return true;
  }
  throw Error("No Subscription Found");
}

export function getUserByName(username) {
  const user = users.find((u) => u.username === username);
  if (user) {
    return user;
  }
  return false;
}

/**
 * Converte um utilizador de newsletter para um utilizador normal.
 * @param {string} username - O nome de utilizador a ser atribuído.
 * @param {string} password - A senha a ser atribuída.
 * @param {string} mail - O email do utilizador a ser convertido.
 * @description
 * Esta função remove o utilizador da lista de subscritores da newsletter e o adiciona como um utilizador normal.
 * Se o utilizador já existir na lista de subscritores, ele é removido antes de ser adicionado como um utilizador normal.
 * @example
 * import { newsletterToUser } from './UserModel.js';
 * newsletterToUser('newUser', 'password123', 'user@gmail.com');
 * Agora o utilizador com o email 'user@gmail.com' foi removido da newsletter e adicionado como um utilizador normal com o nome de utilizador 'newUser' e senha 'password123'.
 */
export function newsletterToUser(username, password, email) {
  removeNewsletterUser(email);
  add(username, email, password);
}

// USER AVATAR
/**
 * Altera o avatar de um utilizador.
 * @param {Object} user - O utilizador cujo avatar será alterado.
 * @param {string} avatar - A URL do novo avatar.
 * @description
 * Esta função altera o avatar do utilizador fornecido para a URL especificada.
 * Se o utilizador ou o avatar não forem fornecidos, lança um erro.
 * @example
 * import { changeAvater } from './UserModel.js';
 * const user = { username: 'john_doe', avatar: 'https://example.com/old_avatar.jpg' };
 * changeAvater(user, 'https://example.com/new_avatar.jpg');
 * Agora o avatar do utilizador 'john_doe' foi alterado para 'https://example.com/new_avatar.jpg'.
 * @throws {Error} Se o utilizador ou o avatar não forem fornecidos.
 * @see update - Para atualizar o utilizador após a alteração do avatar.
 * @see User - Para a classe que representa um utilizador na aplicação.
 */
export function changeAvater(user, avatar) {
  //! May not be needed
  if (!user || !avatar) {
    throw Error("User and avatar must be provided");
  }
  user.avatar = avatar;
  update(user.username, user);
}

// COMMENTS AND RATINGS
/**
 * Adiciona um comentário a um lugar associado a um utilizador.
 * @param {Object} user - O utilizador que está adicionando o comentário.
 * @param {Object} place - O lugar ao qual o comentário será adicionado.
 * @param {string} comment - O texto do comentário a ser adicionado.
 * @returns {Object} O lugar atualizado com o novo comentário adicionado ao array de comentários.
 * @description
 * Esta função adiciona um comentário ao array de comentários do lugar fornecido.
 * Se o utilizador, o lugar ou o comentário não forem fornecidos, lança um erro.
 * Se o lugar não tiver um array de comentários, ele é criado.
 * O comentário é adicionado como um objeto contendo o nome de utilizador, o texto do comentário e a data atual.
 * @example
 * import { addComment } from './UserModel.js';
 * const user = { username: 'john_doe' };
 * const place = { name: 'Praia do Norte' };
 * addComment(user, place, 'Adorei este lugar!');
 * Agora o comentário 'Adorei este lugar!' foi adicionado ao array de comentários do lugar 'Praia do Norte'.
 * @see removeComment - Para remover um comentário de um lugar.
 * @see editComment - Para editar um comentário de um lugar.
 * @throws {Error} Se o utilizador, o lugar ou o comentário não forem fornecidos.
 */
export function addComment(user, place, comment) {
  // Sempre recarrega o array mais recente do localStorage
  reviews = localStorage.reviews ? JSON.parse(localStorage.reviews) : [];
  if (!user || !place || !comment) {
    throw Error("User, place, and comment must be provided");
  }
  const destino = place.destino || place.name || '';
  let newId = 1;
  if (reviews.length > 0) {
    newId = Math.max(...reviews.map(r => r.id || 0)) + 1;
  }
  const newComment = {
    id: newId,
    destino: destino,
    avaliacao: comment.avaliacao || null,
    data: comment.data || new Date().toISOString().slice(0, 10),
    nomePessoa: comment.nomePessoa || user.username,
    comentario: comment.comentario || comment.texto || comment.text || '',
    respostas: comment.respostas || [],
    ...comment
  };
  reviews.push(newComment);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  return newComment;
}
/**
 * Remove um comentário de um lugar associado a um utilizador.
 * @param {Object} user - O utilizador que está removendo o comentário.
 * @param {Object} place - O lugar do qual o comentário será removido.
 * @param {string} comment - O texto do comentário a ser removido.
 * @returns {boolean} Retorna true se o comentário foi removido com sucesso, caso contrário, lança um erro.
 * @description
 * Esta função remove um comentário do array de comentários do lugar fornecido.
 * Se o utilizador, o lugar ou o comentário não forem fornecidos, lança um erro.
 * Se o lugar não tiver um array de comentários, lança um erro.
 * O comentário é identificado pelo texto e pelo nome de utilizador.
 * Se o comentário for encontrado e removido, a função retorna true.
 * Caso contrário, lança um erro indicando que o comentário não foi encontrado ou não pertence ao utilizador.
 * @example
 * import { removeComment } from './UserModel.js';
 * const user = { username: 'john_doe' };
 * const place = { name: 'Praia do Norte', comments: [{ user: 'john_doe', text: 'Adorei este lugar!', date: '2023-10-01T12:00:00Z' }] };
 * removeComment(user, place, 'Adorei este lugar!');
 * Agora o comentário 'Adorei este lugar!' foi removido do array de comentários do lugar 'Praia do Norte'.
 * @throws {Error} Se o utilizador, o lugar ou o comentário não forem fornecidos, ou se o comentário não for encontrado.
 * @see addComment - Para adicionar um comentário a um lugar.
 * @see editComment - Para editar um comentário de um lugar.
 */
export function removeComment(user, place, comment) {
  //TODO: Associate with a place
  if (!user || !place || !comment) {
    throw Error("User, place, and comment must be provided");
  }

  if (!place.comments || !Array.isArray(place.comments)) {
    throw Error("Place does not have comments to remove");
  }

  const index = place.comments.findIndex(
    (c) => c.text === comment && c.user === user.username
  );
  if (index !== -1) {
    place.comments.splice(index, 1);
    return true;
  } else {
    throw Error("Comment not found or does not belong to the user");
  }
}
/**
 * Edita um comentário de um lugar associado a um utilizador.
 * @param {Object} user - O utilizador que está editando o comentário.
 * @param {Object} place - O lugar ao qual o comentário pertence.
 * @param {string} comment - O texto do comentário a ser editado.
 * @returns {boolean} Retorna true se o comentário foi editado com sucesso, caso contrário, lança um erro.
 * @description
 * Esta função edita um comentário no array de comentários do lugar fornecido.
 * Se o utilizador, o lugar ou o comentário não forem fornecidos, lança um erro.
 * Se o lugar não tiver um array de comentários, lança um erro.
 * O comentário é identificado pelo texto e pelo nome de utilizador.
 * Se o comentário for encontrado, seu texto é atualizado com o novo texto fornecido.
 * Se o comentário não for encontrado ou não pertencer ao utilizador, lança um erro.
 * @example
 * import { editComment } from './UserModel.js';
 * const user = { username: 'john_doe' };
 * const place = { name: 'Praia do Norte', comments: [{ user: 'john_doe', text: 'Adorei este lugar!', date: '2023-10-01T12:00:00Z' }] };
 * editComment(user, place, 'Adorei este lugar!');
 * Agora o comentário 'Adorei este lugar!' foi editado no array de comentários do lugar 'Praia do Norte'.
 * @throws {Error} Se o utilizador, o lugar ou o comentário não forem fornecidos, ou se o comentário não for encontrado.
 * @see addComment - Para adicionar um comentário a um lugar.
 * @see removeComment - Para remover um comentário de um lugar.
 */
export function editComment(user, place, comment) {
  //TODO: Associate with a place
  if (!user || !place || !comment) {
    throw Error("User, place, and comment must be provided");
  }

  if (!place.comments || !Array.isArray(place.comments)) {
    throw Error("Place does not have comments to edit");
  }

  const index = place.comments.findIndex(
    (c) => c.text === comment && c.user === user.username
  );
  if (index !== -1) {
    place.comments[index].text = comment;
    return true;
  } else {
    throw Error("Comment not found or does not belong to the user");
  }
}

/* Função para criar utilizador de teste */
export function createTestUser(username, points = 50) {
  const testUser = new User(
    username,
    "password123",
    `${username}@test.com`,
    "",
    points,
    false,
    false
  );
  return testUser;
}

/* Função para simular login de teste */
export function loginTest(username, points = 50) {
  const testUser = createTestUser(username, points);
  sessionStorage.setItem("loggedUser", JSON.stringify(testUser));
  return testUser;
}

/* Limpar sessão de teste */
export function clearTestSession() {
  sessionStorage.removeItem("loggedUser");
}

export function addReservation(userAdd, reservation){
  if (!userAdd.reservas) userAdd.reservas = [];
  // Verifica se já existe reserva com o mesmo numeroVoo
  if (reservation && reservation.numeroVoo && userAdd.reservas.some(r => r.numeroVoo == reservation.numeroVoo)) {
    return false; // Já existe
  }
  userAdd.reservas.push(reservation);
  update(userAdd.id, userAdd);
  return true; 
}
export function addFavorite(userAdd, fav){
  if (!userAdd.favorite) userAdd.favorite = [];
  // Verifica se já existe reserva com o mesmo numeroVoo
  if (fav && fav.numeroVoo && userAdd.favorite.some(f => f.numeroVoo == fav.numeroVoo)) {
    return false; // Já existe
  }
  userAdd.favorite.push(fav);
  update(userAdd.id, userAdd);
  return true; 
}

export function addPontos(user, pontos) {
  if (!user.pontos) user.pontos = 0;
  user.pontos = parseInt(user.pontos, 10) + parseInt(pontos, 10);
}

/**
 * CLASSE QUE MODELA UM UTILIZADOR NA APLICAÇÃO
 * @class User
 * @property {string} username - O nome de utilizador do utilizador.
 * @property {string} password - A senha do utilizador.
 * @property {string} email - O email do utilizador.
 * @property {string} avatar - A URL do avatar do utilizador.
 * @property {number} points - Os pontos acumulados pelo utilizador.
 * @property {boolean} isPrivate - Indica se o perfil do utilizador é privado.
 * @property {boolean} admin - Indica se o utilizador é um administrador.
 * @description
 * Esta classe representa um utilizador na aplicação, contendo informações básicas como nome de utilizador, senha, email, avatar, pontos acumulados e se o perfil é privado ou se o utilizador é um administrador.
 * A classe também possui um método `level` que retorna o nível do utilizador com base nos pontos acumulados.
 * @example
 * const user = new User('john_doe', 'password123', 'user@gmail.com', 'https://example.com/avatar.jpg', 1000, false, true);
 * console.log(user.username); // 'john_doe'
 * console.log(user.level); // 'Viajante'
 */
class User {
  id = 0;
  username = "";
  password = "";
  email = "";
  newsletter = false;
  avatar = "";
  pontos = 0;
  isPrivate = false;
  admin = false;

  constructor(
    username = "",
    password = "",
    email = "",
    newsletter = false,
    avatar = "",
    pontos = 50,
    isPrivate = false,
    admin = false
  ) {
    this.id = getNextId(users);
    this.newsletter = newsletter;
    this.username = username;
    this.password = password;
    this.email = email;
    this.avatar = avatar;
    this.pontos = parseInt(pontos || 0, 10); // Garante inteiro
    this.isPrivate = isPrivate;
    this.admin = admin;
  }

  get level() {
    if (this.pontos >= 5000) {
      return "Embaixador";
    } else if (this.pontos >= 3000) {
      return "Globetrotter";
    } else if (this.pontos >= 1500) {
      return "Aventureiro";
    } else if (this.pontos >= 250) {
      return "Viajante";
    } else {
      return "Explorador";
    }
  }
}

// FUNÇÕES PARA CONTROLO DE ABAS DO PERFIL DE UTILIZADOR

/* Função para alternar entre as abas */
export function switchTab(tabId) {
  const tabButtons = document.querySelectorAll('[role="tab"]');
  const tabPanes = document.querySelectorAll(".tab-pane");

  /* Desativar todas as abas */
  tabButtons.forEach((button) => {
    button.classList.remove(
      "text-Button-Main",
      "dark:text-cyan-400",
      "border-Button-Main",
      "dark:border-cyan-400"
    );
    button.classList.add("border-transparent");
    button.setAttribute("aria-selected", "false");
  });
  tabPanes.forEach((pane) => {
    pane.classList.add("hidden");
    pane.classList.remove("active");
  }); /* Ativar a aba selecionada */
  const selectedButton = document.getElementById(`tab-${tabId}-btn`);
  const selectedPane = document.getElementById(`tab-${tabId}`);

  if (selectedButton && selectedPane) {
    selectedButton.classList.add(
      "text-Button-Main",
      "dark:text-cyan-400",
      "border-Button-Main",
      "dark:border-cyan-400"
    );
    selectedButton.classList.remove("border-transparent");
    selectedButton.setAttribute("aria-selected", "true");
    selectedPane.classList.remove("hidden");
    selectedPane.classList.add("active");

    /* Carregar conteúdo específico baseado na aba */
    if (tabId === "recompensas") {
      loadRewarditContent();
    } else if (tabId === "reservas") {
      loadReservasContent();
    } else if (tabId === "perfil") {
      loadBookmarks();
    }
  }
}

/* Inicializar os eventos dos botões das abas */
export function initTabEvents() {
  const tabButtons = document.querySelectorAll('[role="tab"]');

  tabButtons.forEach((button) => {
    const tabId = button.id.replace("-btn", "").replace("tab-", "");

    button.addEventListener("click", () => {
      switchTab(tabId);
    });
  });
  /* Iniciar na aba Perfil */
  switchTab("perfil");
}

/* Carregar conteúdo da aba Recompensas */
function loadRewarditContent() {
  const rewarditContent = document.getElementById("rewardit-content");
  if (rewarditContent && rewarditContent.classList.contains("animate-pulse")) {
    /* Usa o caminho correto para rewardit.html */
    const pathname = window.location.pathname;
    const htmlFolder = pathname.substring(0, pathname.lastIndexOf("/") + 1);
    fetch(`${htmlFolder}rewardit.html`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const content = doc.querySelector(".max-w-[1270px]");

        if (content) {
          rewarditContent.innerHTML = content.innerHTML;
          rewarditContent.classList.remove(
            "animate-pulse",
            "flex",
            "justify-center",
            "items-center",
            "h-64"
          );
        } else {
          throw new Error("Conteúdo não encontrado em rewardit.html");
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar conteúdo RewardIt:", err);
        rewarditContent.innerHTML = `<div class="text-center py-8">
          <p class="text-red-500 mb-4">Erro ao carregar conteúdo</p>
          <p class="text-Text-Subtitles dark:text-gray-400">${err.message}</p>
          <button class="mt-4 bg-Main-Primary hover:bg-Main-Secondary dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white font-medium rounded-md transition duration-300 py-2 px-4" onclick="location.reload()">Tentar novamente</button>
        </div>`;
      });

    /* Adicionar mensagem para indicar que o carregamento foi iniciado */
    rewarditContent.innerHTML = `<div class="text-center py-8">
      <p class="text-Text-Body dark:text-gray-300 mb-4">A carregar conteúdo...</p>
      <div class="animate-spin inline-block w-10 h-10 border-4 border-Main-Primary border-t-transparent dark:border-cyan-500 dark:border-t-transparent rounded-full"></div>
    </div>`;
  }
}

/* Carregar conteúdo da aba Reservas */
function loadReservasContent() {
  /* Aqui futuramente seriam carregadas as reservas do utilizador */
  const reservasContainer = document.getElementById("reservas-container");
  const reservasEmpty = document.getElementById("reservas-empty");
  if (reservasContainer && reservasEmpty) {
    /* Verificar se existem reservas */
    if (reservasContainer.children.length <= 1) {
      if (reservasEmpty) {
        reservasEmpty.classList.remove("hidden");
      }
    } else {
      if (reservasEmpty) {
        reservasEmpty.classList.add("hidden");
      }
    }
  }
}

/* Carregar bookmarks do utilizador */
function loadBookmarks() {
  /* Aqui futuramente seriam carregados os favoritos do utilizador */
  const bookmarksContainer = document.getElementById("bookmarks-container");
  const bookmarksEmpty = document.getElementById("bookmarks-empty");
  if (bookmarksContainer && bookmarksEmpty) {
    /* Verificar se há bookmarks */
    if (bookmarksContainer.children.length <= 1) {
      bookmarksEmpty.classList.remove("hidden");
    } else {
      bookmarksEmpty.classList.add("hidden");
    }
  }
}

/* Funções de controlo do modal de gamificação */
export function shouldShowGamificationModal() {
  /* Verificar se modal foi ignorado permanentemente */
  if (localStorage.getItem("gamificationModalIgnored") === "true") {
    return false;
  }

  /* Verificar se foi adiado para mais tarde na sessão atual */
  if (sessionStorage.getItem("gamificationModalDeferred") === "true") {
    return false;
  }
  /* Apenas mostrar em desktop (768px+) */
  return window.innerWidth >= 768;
}

export function deferGamificationModal() {
  /* Guardar na session storage para não mostrar até à sessão acabar */
  sessionStorage.setItem("gamificationModalDeferred", "true");
}

export function ignoreGamificationModal() {
  /* Guardar na local storage para não mostrar mais */
  localStorage.setItem("gamificationModalIgnored", "true");
}

export function forceShowGamificationModal() {
  /* Forçar mostrar o modal independentemente das configurações */
  return true;
}

/* Função para guardar código especial */
export function saveSpecialCode(code) {
  if (!code || code.trim() === "") {
    throw new Error("Código inválido");
  }

  /* Guardar código na local storage */
  const existingCodes = JSON.parse(
    localStorage.getItem("specialCodes") || "[]"
  );

  /* Verificar se código já foi usado */
  if (existingCodes.includes(code.trim())) {
    throw new Error("Este código já foi utilizado");
  }

  existingCodes.push(code.trim());
  localStorage.setItem("specialCodes", JSON.stringify(existingCodes));

  return true;
}

export function getSpecialCodes() {
  return JSON.parse(localStorage.getItem("specialCodes") || "[]");
}

/**
 * Remove uma reserva do utilizador pelo número do voo (nVoo).
 * @param {Object} user - O utilizador autenticado.
 * @param {string|number} numeroVoo - O número do voo da reserva a remover.
 * @returns {boolean} True se a reserva foi removida, false caso contrário.
 */
export function removeReservaByNumeroVoo(user, numeroVoo) {
  if (!user || !numeroVoo) return false;
  if (!user.reservas || !Array.isArray(user.reservas)) return false;
  const idx = user.reservas.findIndex(r => r.numeroVoo == numeroVoo);
  if (idx !== -1) {
    user.reservas.splice(idx, 1);
    update(user.id, user);
    // Atualizar sessão se for o user logado
    const loggedUser = getUserLogged();
    if (loggedUser && loggedUser.id == user.id) {
      sessionStorage.setItem("loggedUser", JSON.stringify(user));
    }
    return true;
  }
  return false;
}

/**
 * Obtém todas as reviews armazenadas.
 * @return {Array} Um array de objetos de review.
 */
export function getReviews() {
  return reviews;
}

/**
 * Obtém as reviews de um destino específico.
 * @param {string} destino - O destino para filtrar as reviews.
 * @return {Array} Um array de objetos de review do destino especificado.
 */
export function getReviewsByDestino(destino) {
  return reviews.filter(r => r.destino === destino);
}

/**
 * Adiciona uma nova review.
 * @param {Object} review - O objeto da review a ser adicionada.
 * @return {Object} A nova review adicionada, incluindo seu ID.
 */
export function addReview(review) {
  // Sempre recarrega o array mais recente do localStorage
  reviews = localStorage.reviews ? JSON.parse(localStorage.reviews) : [];
  let newId = 1;
  if (reviews.length > 0) {
    newId = Math.max(...reviews.map(r => r.id || 0)) + 1;
  }
  const newReview = { ...review, id: newId };
  reviews.push(newReview);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  return newReview;
}

/**
 * Adiciona uma resposta a uma review existente.
 * @param {number} reviewId - O ID da review à qual a resposta será adicionada.
 * @param {Object} reply - O objeto da resposta a ser adicionada.
 * @param {string} reply.data - A data da resposta (opcional).
 * @param {string} reply.nomePessoa - O nome da pessoa que está respondendo (opcional).
 * @param {string} reply.comentario - O comentário da resposta.
 * @returns {Object} A nova resposta adicionada à review.
 * @throws {Error} Se a review não for encontrada.
 * @description
 * Esta função adiciona uma resposta ao array de respostas de uma review existente.
 * A resposta é um objeto que pode conter uma data, o nome da pessoa que está respondendo e o comentário da resposta.
 * A função procura a review pelo ID, e se encontrada, adiciona a nova resposta ao seu array de respostas.
 * O ID da resposta é gerado automaticamente com base no maior ID existente no array de respostas.
 * @example
 * import { addReplyToReview } from './UserModel.js';
 * const reply = { comentario: 'Obrigado pelo feedback!' };
 * addReplyToReview(1, reply);
 * Agora a resposta 'Obrigado pelo feedback!' foi adicionada à review com ID 1.
 */
export function addReplyToReview(reviewId, reply) {
  // Sempre recarrega o array mais recente do localStorage
  reviews = localStorage.reviews ? JSON.parse(localStorage.reviews) : [];
  const idx = reviews.findIndex(r => r.id == reviewId);
  if (idx === -1) throw new Error("Review não encontrada");
  if (!reviews[idx].respostas) reviews[idx].respostas = [];
  // Gera novo id incremental para resposta
  let newReplyId = 1;
  if (reviews[idx].respostas.length > 0) {
    newReplyId = Math.max(...reviews[idx].respostas.map(r => r.id || 0)) + 1;
  }
  const newReply = {
    id: newReplyId,
    data: reply.data || new Date().toISOString().slice(0, 10),
    nomePessoa: reply.nomePessoa || reply.user || '',
    comentario: reply.comentario || reply.texto || reply.text || '',
    ...reply
  };
  reviews[idx].respostas.push(newReply);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  return newReply;
}
