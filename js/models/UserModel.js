import { loadFromLocalStorage, saveToLocalStorage } from './ModelHelpers.js';

// ARRAY USERS
let users;

// CARREGAR UTILIZADORES DA LOCALSTORAGE
export function init() {
  users = localStorage.users ? loadFromLocalStorage('users', users) : [];
}

// ADICIONAR UTILIZADOR
export function add(username, password) {
  if (users.some((user) => user.username === username)) {
    throw Error(`User with username "${username}" already exists!`);
  } else {
    users.push(new User(username, password));
    localStorage.setItem("users", JSON.stringify(users));
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

/**
 * CLASSE QUE MODELA UM UTILIZADOR NA APLICAÇÃO
 */
class User {
  username = "";
  password = "";
  points = 0;
  private = false
  admin = false

  constructor(username, password, points = 50, private = false ,admin = false) {
    this.username = username;
    this.password = password;
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