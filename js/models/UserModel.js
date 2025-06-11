import { loadFromLocalStorage, saveToLocalStorage } from "./ModelHelpers.js";

// ARRAY USERS
let users;
let newsletter;

// CARREGAR UTILIZADORES DA LOCALSTORAGE
export function init() {
  users = localStorage.users ? loadFromLocalStorage("users", users) : [];
  newsletter = localStorage.newsletter
    ? loadFromLocalStorage("newsletter", newsletter)
    : [];
}

// ADICIONAR UTILIZADOR
export function add(username, password, mail) {
  if (users.some((user) => user.mail === mail)) {
    throw Error(`User with email "${mail}" already exists!`);
  } else {
    users.push(new User(username, password, mail));
    saveToLocalStorage("users", users);
  }
}

// ALTERAR DADOS DO UTILIZADOR
export function update(username, newUser) {
  const index = users.findIndex((u) => u.username == username);
  if (index !== -1) {
    users[index] = newUser;
    saveToLocalStorage("users", users);
    return true;
  }
  throw Error("No User Found");
}

// APAGAR UTILIZADOR
export function deleteUser(username) {
  const index = users.findIndex((u) => u.username == username);
  if (index !== -1) {
    users.splice(index, 1);
    saveToLocalStorage("users", users);
    return true;
  }
  throw Error("No User Found");
}

// LOGIN E MANIPULAÇÃO DE SESSÃO
/**
 * Autentica um utilizador e armazena suas informações na sessão.
 * @param {string} username - O nome de utilizador a ser autenticado.
 * @param {string} password - A senha do utilizador a ser autenticado.
 * @return {boolean} Retorna true se o login for bem-sucedido, caso contrário, lança um erro.
 * @throws {Error} Se o nome de utilizador ou a senha estiverem incorretos.
 * @description
 * Esta função verifica se o nome de utilizador e a senha fornecidos correspondem a um utilizador existente.
 * Se a autenticação for bem-sucedida, o utilizador é armazenado no sessionStorage sob a chave "loggedUser".
 * Caso contrário, lança um erro indicando que o login é inválido.
 * @example
 * import { login } from './UserModel.js';
 * try {
 *   const success = login('username', 'password');
 *   if (success) {
 *    console.log('Login bem-sucedido!');
 *   }
 * }
 * catch (error) {
 *   console.error(error.message); // "Invalid login!" se as credenciais estiverem incorretas
 * }
 * @see isLogged - Para verificar se um utilizador está autenticado antes de chamar esta função.
 * @see getUserLogged - Para obter o utilizador autenticado após o login.
 * @see logout - Para desconectar o utilizador e remover suas informações da sessão.
 */
export function login(username, password) {
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    sessionStorage.setItem("loggedUser", JSON.stringify(user));
    return true;
  } else {
    throw Error("Invalid login!");
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

/**
 * Verifica se um utilizador é administrador.
 * @param {Object} user - O utilizador a ser verificado.
 * @return {boolean} Retorna true se o utilizador for administrador, caso contrário, retorna false.
 * @description
 * Esta função verifica a propriedade 'admin' do objeto utilizador fornecido.
 * Se a propriedade 'admin' for verdadeira, a função retorna true, indicando que o utilizador é um administrador.
 * Caso contrário, retorna false.
 * @example
 * import { isAdmin } from './UserModel.js';
 * const user = { username: 'adminUser', admin: true };
 * const result = isAdmin(user);
 * console.log(result); // true
 */
export function isAdmin(user) {
  user.admin ? true : false;
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
export function addNewsletterUser(mail) {
  const newsletterUser = new User("", "", mail);
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
export function removeNewsletterUser(mail) {
  const index = newsletter.findIndex((n) => n.mail == mail);
  if (index !== -1) {
    newsletter.splice(index, 1);
    saveToLocalStorage("newsletter", newsletter);
    return true;
  }
  throw Error("No Subscription Found");
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
export function newsletterToUser(username, password, mail) {
  //! May not be needed
  removeNewsletterUser(mail);
  add(username, password, mail);
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
  //TODO: Add replies to comments
  if (!user || !place || !comment) {
    throw Error("User, place, and comment must be provided");
  }

  //* FallBack to ensure place has a comments array
  if (!place.comments) {
    place.comments = [];
  }

  const newComment = {
    user: user.username,
    text: comment,
    date: new Date().toISOString(),
  };

  return place.comments.push(newComment);
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

/**
 * CLASSE QUE MODELA UM UTILIZADOR NA APLICAÇÃO
 * @class User
 * @property {string} username - O nome de utilizador do utilizador.
 * @property {string} password - A senha do utilizador.
 * @property {string} mail - O email do utilizador.
 * @property {string} avatar - A URL do avatar do utilizador.
 * @property {number} points - Os pontos acumulados pelo utilizador.
 * @property {boolean} private - Indica se o perfil do utilizador é privado.
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
  username = "";
  password = "";
  mail = "";
  avatar = "";
  points = 0;
  private = false;
  admin = false;

  constructor(
    username = "",
    password = "",
    mail,
    avatar = "",
    points = 50,
    private = false,
    admin = false
  ) {
    this.username = username;
    this.password = password;
    this.mail = mail;
    this.avatar = avatar;
    this.points = points;
    this.private = private;
    this.admin = admin;
  }

  get level() {
    if (this.points >= 5000) {
      return "Embaixador";
    } else if (this.points >= 3000) {
      return "Globetrotter";
    } else if (this.points >= 1500) {
      return "Aventureiro";
    } else if (this.points >= 250) {
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
  });

  /* Ativar a aba selecionada */
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

    /* Carregar conteúdo específico baseado na aba */
    if (tabId === "recompensas") {
      loadRewarditContent();
    } else if (tabId === "reservas") {
      loadReservasContent();
    } else if (tabId === "perfil") {
      loadBookmarks();
    } else if (tabId === "definicoes") {
      /* Não é necessária nenhuma ação especial para a aba de definições */
      console.log("Aba de definições carregada");
    }
  }
}

/* Inicializar os eventos dos botões das abas */
export function initTabEvents() {
  const tabButtons = document.querySelectorAll('[role="tab"]');
  console.log(`Inicializando eventos para ${tabButtons.length} botões de abas`);

  tabButtons.forEach((button) => {
    const tabId = button.id.replace("-btn", "").replace("tab-", "");
    console.log(`Adicionando evento para a aba "${tabId}"`);

    button.addEventListener("click", () => {
      console.log(`Clique na aba "${tabId}"`);
      switchTab(tabId);
    });
  });

  /* Iniciar na aba Perfil */
  console.log('Iniciando na aba "perfil"');
  switchTab("perfil");
}

/* Carregar conteúdo da aba Recompensas */
function loadRewarditContent() {
  const rewarditContent = document.getElementById("rewardit-content");
  if (rewarditContent && rewarditContent.classList.contains("animate-pulse")) {
    console.log("Tentando carregar conteúdo de recompensas");
    /* Usa o caminho correto para rewardit.html */
    const pathname = window.location.pathname;
    const htmlFolder = pathname.substring(0, pathname.lastIndexOf("/") + 1);
    console.log(`Caminho da pasta: ${htmlFolder}`);
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
  } else {
    console.log(
      "Elemento rewardit-content não encontrado ou não tem a classe animate-pulse"
    );
  }
}

/* Carregar conteúdo da aba Reservas */
function loadReservasContent() {
  /* Aqui futuramente seriam carregadas as reservas do utilizador */
  const reservasContainer = document.getElementById("reservas-container");
  const reservasEmpty = document.getElementById("reservas-empty");

  console.log("Tentando carregar conteúdo da aba Reservas");

  if (reservasContainer && reservasEmpty) {
    /* Verificar se existem reservas */
    if (reservasContainer.children.length <= 1) {
      console.log("Nenhuma reserva encontrada");
      if (reservasEmpty) {
        reservasEmpty.classList.remove("hidden");
      }
    } else {
      console.log(
        `${reservasContainer.children.length - 1} reservas encontradas`
      );
      if (reservasEmpty) {
        reservasEmpty.classList.add("hidden");
      }
    }
  } else {
    console.log(
      "Elementos reservas-container ou reservas-empty não encontrados",
      {
        container: !!reservasContainer,
        empty: !!reservasEmpty,
      }
    );
  }
}

/* Carregar bookmarks do utilizador */
function loadBookmarks() {
  /* Aqui futuramente seriam carregados os favoritos do utilizador */
  const bookmarksContainer = document.getElementById("bookmarks-container");
  const bookmarksEmpty = document.getElementById("bookmarks-empty");

  console.log("Tentando carregar bookmarks do utilizador");

  if (bookmarksContainer && bookmarksEmpty) {
    /* Verificar se há bookmarks */
    if (bookmarksContainer.children.length <= 1) {
      console.log("Nenhum bookmark encontrado");
      bookmarksEmpty.classList.remove("hidden");
    } else {
      console.log(
        `${bookmarksContainer.children.length - 1} bookmarks encontrados`
      );
      bookmarksEmpty.classList.add("hidden");
    }
  } else {
    console.log(
      "Elementos bookmarks-container ou bookmarks-empty não encontrados",
      {
        container: !!bookmarksContainer,
        empty: !!bookmarksEmpty,
      }
    );
  }
}
