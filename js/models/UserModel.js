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
  // Garantir que todos os utilizadores têm user.pontos como inteiro e preferences object
  users = users.map(u => ({ 
    ...u, 
    pontos: parseInt(u.pontos || 0, 10),
    // Add preferences object if it doesn't exist (backward compatibility)
    preferences: u.preferences || { newsletter: u.newsletter || false }
  }));
  // Initialize newsletter array first, then load from localStorage
  newsletter = [];
  if (localStorage.newsletter) {
    loadFromLocalStorage("newsletter", newsletter);
  }
  // Rebuild newsletter from users with newsletter preferences (avoid duplicates)
  rebuildNewsletterFromUsers();
  reviews = localStorage.reviews ? JSON.parse(localStorage.reviews) : [];
}
// ADICIONAR UTILIZADOR
export function add(username, email, password, acceptNewsletter = false, referralCode = null) {
  if (users.some((user) => user.email === email)) {
    throw Error(`Utilizador com email "${email}" já existe!`);  } else {
    const newUser = new User(username, password, email, acceptNewsletter, "", 50, false, false);
    users.push(newUser);
    localStorage.setItem("user", JSON.stringify(users));
    /* Update newsletter based on user preferences */    updateNewsletterFromUserPreferences(newUser);

    if (referralCode) {
      const referralResult = processReferral(referralCode);
    }
  }
}
// ALTERAR DADOS DO UTILIZADOR
export function update(id, newUser) {
  const userId = parseInt(id, 10);
  const index = users.findIndex((u) => parseInt(u.id, 10) === userId);
  if (index !== -1) {
    const oldUser = users[index];
    users[index] = { ...users[index], ...newUser, id: userId };
    // Update newsletter if preferences changed
    const updatedUser = users[index];    if (oldUser.preferences?.newsletter !== updatedUser.preferences?.newsletter) {
      updateNewsletterFromUserPreferences(updatedUser);
    }
    
    localStorage.setItem("user", JSON.stringify(users));
    return true;
  }
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
 * } else {
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
 * } else {
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
  return user && (user.admin === true || user.admin === 'Admin');
}
/**
 * Obtém o nível do utilizador baseado nos pontos.
 * @param {number} points - Pontos do utilizador.
 * @return {string} Nível do utilizador.
 */
export function getUserLevel(points) {
  if (points >= 5000) {
    return "Embaixador";
  } else if (points >= 3000) {
    return "Globetrotter";
  } else if (points >= 1500) {
    return "Aventureiro";
  } else if (points >= 250) {
    return "Viajante";
  } else {
    return "Explorador";
  }
}
// ADMIN FUNCTIONS
/**
 * Obtém todos os utilizadores.
 * @return {Array} Array com todos os utilizadores registados.
 */
export function getAll() {
  return [...users]; // Return a copy to prevent direct modification
}
/**
 * Filtra utilizadores por termo de pesquisa.
 * @param {string} searchTerm - Termo para pesquisar em username e email.
 * @return {Array} Array com utilizadores filtrados.
 */
export function search(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return getAll();
  }
  const term = searchTerm.toLowerCase().trim();
  return users.filter(user => 
    (user.username && user.username.toLowerCase().includes(term)) ||
    (user.email && user.email.toLowerCase().includes(term))
  );
}
/**
 * Ordena utilizadores por uma coluna específica.
 * @param {string} column - Coluna para ordenar (username, email, pontos, admin, isPrivate).
 * @param {string} direction - Direção da ordenação ('asc' ou 'desc').
 * @return {Array} Array com utilizadores ordenados.
 */
export function sortBy(column, direction = 'asc') {
  const sortedUsers = [...users].sort((a, b) => {
    let valueA = a[column];
    let valueB = b[column];
    // Handle different data types
    if (column === 'pontos') {
      valueA = parseInt(valueA) || 0;
      valueB = parseInt(valueB) || 0;
    } else if (column === 'isPrivate') {
      // Handle both privacidade and isPrivate properties
      valueA = a.privacidade === 'S' || a.isPrivate === true;
      valueB = b.privacidade === 'S' || b.isPrivate === true;
    } else if (column === 'admin') {
      // Handle both boolean and string admin values
      valueA = a.admin === true || a.admin === 'Admin';
      valueB = b.admin === true || b.admin === 'Admin';
    } else if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB ? valueB.toLowerCase() : '';
    }
    if (direction === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
  return sortedUsers;
}
/**
 * Cria um novo utilizador via admin.
 * @param {Object} userData - Dados do utilizador a ser criado.
 * @return {Object} O utilizador criado.
 */
export function createUser(userData) {
  const { 
    username, 
    email, 
    password, 
    pontos = 50, 
    privacidade = 'N', 
    admin = 'User' 
  } = userData;
  // Validate required fields
  if (!username || !email || !password) {
    throw new Error('Username, email e password são obrigatórios');
  }
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    throw new Error(`Utilizador com email "${email}" já existe`);
  }
  const isPrivate = privacidade === 'S';
  const isAdmin = admin === 'Admin';
  // Create user object with the same structure as existing users
  const newUser = {
    id: getNextId(users),
    username: username,
    avatar: "", // Default empty avatar
    pontos: parseInt(pontos) || 50,
    email: email,
    password: password,
    isPrivate: isPrivate,
    admin: isAdmin,
    // Additional properties for compatibility
    privacidade: privacidade,
    newsletter: false,
    preferences: {},
    reservas: [],
    favoritos: []
  };
  users.push(newUser);
  localStorage.setItem("user", JSON.stringify(users));
  return newUser;
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
export function getUserImage(username) {
  const userAvatar = getUserByName(username);
  if (userAvatar && userAvatar.avatar) {
    return userAvatar.avatar;
  }
  // Retorna uma imagem padrão se o utilizador não tiver avatar
  return false;
}
export function addReservation(userAdd, reservation){
  if (!userAdd.reservas) userAdd.reservas = [];
  // Verifica se já existe reserva baseada no tipo
  if (reservation && reservation.numeroVoo && userAdd.reservas.some(r => r.numeroVoo == reservation.numeroVoo)) {
    return false; // Já existe voo
  }
  if (reservation && reservation.tipo === 'hotel' && reservation.id) {
    // Check for duplicate hotel reservations with same id, checkIn and checkOut dates
    const existingHotel = userAdd.reservas.find(r => 
      r.tipo === 'hotel' && 
      r.id == reservation.id && 
      r.checkIn === reservation.checkIn && 
      r.checkOut === reservation.checkOut
    );
    if (existingHotel) {
      return false; // Já existe reserva de hotel para as mesmas datas
    }
  }
  userAdd.reservas.push(reservation);
  update(userAdd.id, userAdd);
  return true; 
}
export function addFavorite(user, item) {
  if (!user.favoritos) user.favoritos = [];
  // Verifica se é um hotel (tem id) ou flight (tem numeroVoo)
  if (item && item.id) {
    // É um hotel
    if (user.favoritos.some(f => f.id == item.id)) {
      return false; // Hotel já existe nos favoritos
    }
  } else if (item && item.numeroVoo) {
    // É um flight
    if (user.favoritos.some(f => f.numeroVoo == item.numeroVoo)) {
      return false; // Flight já existe nos favoritos
    }
  } else {
    return false; // Item inválido
  }
  user.favoritos.push(item);
  update(user.id, user);
  // Atualizar sessão se for o user logado
  const loggedUser = getUserLogged();
  if (loggedUser && loggedUser.id == user.id) {
    sessionStorage.setItem("loggedUser", JSON.stringify(user));
  }
  return true;
}
export function removeFavorite(user, item) {
  if (!user.favoritos) return false;
  let idx = -1;
  // Verifica se é um hotel (tem id) ou flight (tem numeroVoo/nVoo)
  if (item && item.id) {
    // É um hotel
    idx = user.favoritos.findIndex(f => f.id == item.id);
  } else if (item && (item.numeroVoo || item.nVoo)) {
    // É um flight
    idx = user.favoritos.findIndex(f => 
      (f.numeroVoo && item.numeroVoo && f.numeroVoo == item.numeroVoo) ||
      (f.nVoo && item.nVoo && f.nVoo == item.nVoo) ||
      (f.numeroVoo && item.nVoo && f.numeroVoo == item.nVoo) ||
      (f.nVoo && item.numeroVoo && f.nVoo == item.numeroVoo)
    );
  }
  if (idx !== -1) {
    user.favoritos.splice(idx, 1);
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
export function addPontos(user, pontos, description = "Pontos adicionados") {
  if (!user.pontos) user.pontos = 0;
  // Initialize movements array and add registration bonus if needed
  if (!user.movimentosPontos) {
    user.movimentosPontos = [];
    // If user has existing points but no movements, add the registration movement
    if (user.pontos > 0) {
      user.movimentosPontos.push({
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Set to yesterday
        descricao: "Registo na plataforma",
        valor: 50, // Registration bonus
        saldoAnterior: 0,
        saldoAtual: 50
      });
    }
  }
  const pontosValue = parseInt(pontos, 10);
  const saldoAnterior = parseInt(user.pontos, 10);
  user.pontos = saldoAnterior + pontosValue;
  // Add movement record
  user.movimentosPontos.push({
    data: new Date().toISOString(),
    descricao: description,
    valor: pontosValue,
    saldoAnterior: saldoAnterior,
    saldoAtual: user.pontos
  });
}
export function subtractPontos(user, pontos, description = "Pontos subtraídos") {
  if (!user.pontos) user.pontos = 0;
  // Initialize movements array and add registration bonus if needed
  if (!user.movimentosPontos) {
    user.movimentosPontos = [];
    // If user has existing points but no movements, add the registration movement
    if (user.pontos > 0) {
      user.movimentosPontos.push({
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Set to yesterday
        descricao: "Registo na plataforma",
        valor: 50, // Registration bonus
        saldoAnterior: 0,
        saldoAtual: 50
      });
    }
  }
  const pontosValue = parseInt(pontos, 10);
  const saldoAnterior = parseInt(user.pontos, 10);
  user.pontos = Math.max(0, saldoAnterior - pontosValue);
  // Add movement record
  user.movimentosPontos.push({
    data: new Date().toISOString(),
    descricao: description,
    valor: -pontosValue,
    saldoAnterior: saldoAnterior,
    saldoAtual: user.pontos
  });
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
  preferences = {};
  reservas = [];
  favoritos = [];  constructor(
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
    // Initialize arrays for user data
    this.reservas = [];
    this.favoritos = [];
    // Initialize movements array with registration bonus if points > 0
    this.movimentosPontos = [];
    if (this.pontos > 0) {
      this.movimentosPontos.push({
        data: new Date().toISOString(),
        descricao: "Registo na plataforma",
        valor: this.pontos,
        saldoAnterior: 0,
        saldoAtual: this.pontos
      });
    }
    // Set preferences object with newsletter preference
    this.preferences = {
      newsletter: newsletter
    };
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
// REFERRAL SYSTEM
/**
 * Generates a referral link for the given user
 * @param {Object} user - The user to generate the referral link for
 * @returns {string} The referral link
 */
export function getReferralLink(user) {
  if (!user || !user.id) {
    throw new Error('Utilizador inválido para gerar link de referência');
  }
  // Create the referral link pointing to the login page
  return `${window.location.origin}/html/_login.html?ref=${user.id}`;
}
/**
 * Processes a referral code and awards points to the referring user
 * @param {string} referralCode - The referral code (user ID) from the URL
 * @returns {boolean} True if the referral was processed successfully
 */
export function processReferral(referralCode) {
  if (!referralCode) {
    return false;
  }
  try {
    // Find the referring user by ID
    const referringUser = getUserById(parseInt(referralCode, 10));
    if (!referringUser) {
      return false;
    }
    // Award 100 points to the referring user
    const currentPoints = parseInt(referringUser.pontos) || 0;
    const newPoints = currentPoints + 100;
    // Update the user in the users array
    const userIndex = users.findIndex(u => parseInt(u.id, 10) === parseInt(referralCode, 10));
    if (userIndex !== -1) {
      users[userIndex].pontos = newPoints;
      localStorage.setItem("user", JSON.stringify(users));
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
/**
 * Handles newsletter subscription from the homepage form
 * @param {string} email - The email to subscribe to newsletter
 * @returns {Object} Result object with success status and message
 * @description
 * This function checks if the email belongs to a registered user.
 * If it does, returns an error message.
 * If it doesn't, adds the email as a newsletter subscriber.
 */
export function subscribeToNewsletter(email) {
  // Check if email belongs to a registered user
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return {
      success: false,
      message: "User já existente"
    };
  }
  // Check if email is already in newsletter (avoid duplicates)
  const existingNewsletterSub = newsletter.find(sub => sub.email === email);
  if (existingNewsletterSub) {
    return {
      success: false,
      message: "Email já subscrito à newsletter"
    };
  }
  // Add email to newsletter (simple structure)
  const newsletterSubscription = {
    email: email
  };
  newsletter.push(newsletterSubscription);
  saveToLocalStorage("newsletter", newsletter);
  return {
    success: true,
    message: "Newsletter subscrita com sucesso!"
  };
}
/**
 * Updates newsletter array when user preferences change
 * @param {Object} user - The user whose preferences changed
 * @description
 * This function adds/removes users from newsletter based on their preferences.
 * Ensures no duplicates exist in the newsletter array.
 */
export function updateNewsletterFromUserPreferences(user) {
  // Remove any existing entry for this user (avoid duplicates)
  newsletter = newsletter.filter(sub => sub.email !== user.email);
  // If user wants newsletter, add them to the newsletter array
  if (user.preferences && user.preferences.newsletter === true) {
    const userNewsletterEntry = {
      username: user.username,
      email: user.email
    };
    newsletter.push(userNewsletterEntry);
  }
  saveToLocalStorage("newsletter", newsletter);
}
/**
 * Rebuilds newsletter array to include users with newsletter preferences
 * Removes duplicates and ensures proper structure
 */
function rebuildNewsletterFromUsers() {
  // Remove any user entries that might be duplicated (keep only standalone emails)
  newsletter = newsletter.filter(sub => !sub.username);
  // Add users with newsletter preference enabled
  users.forEach(user => {
    if (user.preferences && user.preferences.newsletter === true) {
      // Check if not already in newsletter (avoid duplicates)
      const exists = newsletter.find(sub => sub.email === user.email);
      if (!exists) {
        newsletter.push({
          username: user.username,
          email: user.email
        });
      }
    }
  });
  saveToLocalStorage("newsletter", newsletter);
}
/**
 * Gets all newsletter subscribers including users with newsletter preference
 * @returns {Array} Array of all newsletter subscribers (no duplicates)
 */
export function getAllNewsletterSubscribers() {
  // Get current newsletter array (already contains both types)
  return newsletter;
}
/**
 * Removes a reservation and subtracts points from user
 * @param {number} userId - The user's ID
 * @param {number} reservationIndex - The index of the reservation to remove
 * @returns {Object} Result object with success status and message
 */
export function removeReservation(userId, reservationIndex) {
  try {
    // Find the user
    const userIndex = users.findIndex(u => parseInt(u.id, 10) === parseInt(userId, 10));
    if (userIndex === -1) {
      throw new Error("Utilizador não encontrado");
    }
    const user = users[userIndex];
      // Check if user has reservations
    if (!user.reservas || !Array.isArray(user.reservas)) {
      throw new Error("Utilizador não tem reservas");
    }
    // Check if reservation index is valid
    if (reservationIndex < 0 || reservationIndex >= user.reservas.length) {
      throw new Error("Reserva não encontrada");
    }    // Get the reservation to remove
    const reservationToRemove = user.reservas[reservationIndex];    // Check for points in different possible property names (flight uses pointsAR, hotel uses pontos)
    const pointsToSubtract = parseInt(reservationToRemove.pointsAR) || parseInt(reservationToRemove.pontos) || 0;
    // Remove the reservation
    user.reservas.splice(reservationIndex, 1);
    // Subtract points from user using the new function
    const reservationType = reservationToRemove.tipo === 'hotel' ? 'hotel' : 'voo';
    const description = `Cancelamento de reserva de ${reservationType}: ${reservationToRemove.nome || reservationToRemove.destino || 'Reserva'}`;
    subtractPontos(user, pointsToSubtract, description);
    // Update user in users array
    users[userIndex] = user;
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(users));
    // Update sessionStorage if this is the logged user
    const loggedUser = getUserLogged();
    if (loggedUser && parseInt(loggedUser.id, 10) === parseInt(userId, 10)) {
      sessionStorage.setItem("loggedUser", JSON.stringify(user));
    }
    return {
      success: true,
      message: "Reserva removida com sucesso!",
      pointsSubtracted: pointsToSubtract,
      newPoints: user.pontos
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}
export function isHotelInFavorites(user, hotelId) {
  if (!user.favoritos) return false;
  return user.favoritos.some(f => f.id == hotelId);
}
export function isFlightInFavorites(user, flightId) {
  if (!user.favoritos) return false;
  return user.favoritos.some(f => 
    (f.numeroVoo && f.numeroVoo == flightId) ||
    (f.nVoo && f.nVoo == flightId)
  );
}
export function getUserPointMovements(user) {
  if (!user.movimentosPontos) {
    user.movimentosPontos = [];
  }
  // Check if we need to add initial movement
  // This should only happen if user has points but no initial movement recorded
  if (user.pontos && user.pontos > 0) {
    const hasInitialMovement = user.movimentosPontos.some(movement => 
      movement.descricao === "Pontos iniciais" || movement.descricao === "Registo na plataforma"
    );
    if (!hasInitialMovement) {
      // Calculate what the initial points should be by looking at the earliest balance
      let initialPoints = 50; // Default registration bonus
      // If there are movements, calculate the initial points from the earliest movement
      if (user.movimentosPontos.length > 0) {
        // Sort movements by date (oldest first) to find the earliest balance
        const sortedMovements = [...user.movimentosPontos].sort((a, b) => new Date(a.data) - new Date(b.data));
        const earliestMovement = sortedMovements[0];
        initialPoints = earliestMovement.saldoAnterior;
      }
      // Only add initial movement if there were actually initial points
      if (initialPoints > 0) {
        user.movimentosPontos.push({
          data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Set to yesterday to ensure it appears first
          descricao: "Registo na plataforma",
          valor: initialPoints,
          saldoAnterior: 0,
          saldoAtual: initialPoints
        });
      }
    }
  }
  // Return movements sorted by date (most recent first)
  return user.movimentosPontos.sort((a, b) => new Date(b.data) - new Date(a.data));
}
