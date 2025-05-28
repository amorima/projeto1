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

// LOGIN DO UTILIZADOR
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

// LOGOUT DO UTILIZADOR
export function logout() {
  sessionStorage.removeItem("loggedUser");
}

// VERIFICA EXISTÊNCIA DE ALGUÉM AUTENTICADO
export function isLogged() {
  return sessionStorage.getItem("loggedUser") ? true : false;
}

// DEVOLVE UTILZIADOR AUTENTICADO
export function getUserLogged() {
  return JSON.parse(sessionStorage.getItem("loggedUser"));
}

// USER NEWSLETTER
export function addNewsletterUser(mail) {
  const newsletterUser = new User('','',mail)
  newsletter.push(newsletterUser)
  saveToLocalStorage('newsletter',newsletter)
}
export function removeNewsletterUser(mail) {
  const index = newsletter.findIndex(n => n.mail == mail)
  if(index !== -1){
    newsletter.splice(index,1)
    saveToLocalStorage('newsletter',newsletter)
    return true
  }
  throw Error ('No Subscription Found')
}
export function newsletterToUser(username, password, mail){ //! May not be needed
  removeNewsletterUser(mail)
  add(username, password, mail)
}

/**
 * CLASSE QUE MODELA UM UTILIZADOR NA APLICAÇÃO
 */
class User {
  username = "";
  password = "";
  mail = "";
  points = 0;
  private = false
  admin = false

  constructor(username = '', password = '', mail, points = 50, private = false, admin = false) {
    this.username = username;
    this.password = password;
    this.mail = mail;
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


// Old Code that must go to views
/* 
  getAll(filterFn = null) {
    return filterFn ? this._items.filter(filterFn) : this._items;
  } 
*/