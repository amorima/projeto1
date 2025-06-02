import { loadFromLocalStorage, saveToLocalStorage } from './ModelHelpers.js';

// ARRAY USERS
let users;
let newsletter

// CARREGAR UTILIZADORES DA LOCALSTORAGE
export function init() {
  users = localStorage.users ? loadFromLocalStorage('users', users) : [];
  newsletter = localStorage.newsletter ? loadFromLocalStorage('newsletter', newsletter) : []
}

// ADICIONAR UTILIZADOR
export function add(username, password, mail) {
  if (users.some((user) => user.mail === mail)) {
    throw Error(`User with email "${mail}" already exists!`);
  } else {
    users.push(new User(username, password, mail));
    saveToLocalStorage('users', users);
  }
}

// ALTERAR DADOS DO UTILIZADOR
export function update(username, newUser){
  const index = users.findIndex(u.username == username)
  if (index !== -1){
    users[index] = newUser
    return true
  }
  throw Error ('No User Found')
}

// APAGAR UTILIZADOR
export function deleteUser (username) {
  const index = users.findIndex(u => u.username == username)
  if(index !== -1){
    users.splice(index,1)
    saveToLocalStorage('users',users)
    return true
  }
  throw Error ('No User Found')
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
export function isAdmin(user){
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
  const newsletterUser = new User('','',mail)
  newsletter.push(newsletterUser)
  saveToLocalStorage('newsletter',newsletter)
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
  const index = newsletter.findIndex(n => n.mail == mail)
  if(index !== -1){
    newsletter.splice(index,1)
    saveToLocalStorage('newsletter',newsletter)
    return true
  }
  throw Error ('No Subscription Found')
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
export function newsletterToUser(username, password, mail){ //! May not be needed
  removeNewsletterUser(mail)
  add(username, password, mail)
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
  private = false
  admin = false

  constructor(username = '', password = '', mail, avatar = '', points = 50, private = false, admin = false) {
    this.username = username;
    this.password = password;
    this.mail = mail;
    this.avatar = avatar
    this.points = points;
    this.private = private;
    this.admin = admin;
  }

  get level() {
    if(this.points>=5000){
      return "Embaixador"
    }else if (this.points>=3000){
      return "Globetrotter"
    }else if (this.points>=1500){
      return "Aventureiro"
    }else if (this.points>=250){
      return "Viajante"
    }else {
      return "Explorador"
    }
  }
}
