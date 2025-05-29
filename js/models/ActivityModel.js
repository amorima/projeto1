import {
  loadFromLocalStorage,
  saveToLocalStorage,
  getNextId,
} from "./ModelHelpers.js";

// ARRAY ACTIVITIES
let activities;

// CARREGAR ACTIVIDADES DA LOCAL STORAGE
export function init() {
  activities = localStorage.activities
    ? loadFromLocalStorage("activities", activities)
    : [];
}

// ADICIONAR ACTIVIDADE
export function add(
  destino,
  tipoTurismo,
  nome,
  foto,
  descricao,
  acessibilidade
) {
  if (activities.some((a) => a.nome === nome)) {
    throw Error(`Activity "${a.nome}" already exists!`);
  } else {
    const id = getNextId(activities);
    activities.push(
      new Activity(
        id,
        destino,
        tipoTurismo,
        nome,
        foto,
        descricao,
        acessibilidade
      )
    );
    saveToLocalStorage("activities", activities);
  }
}

// ALTERAR DADOS DE ACTIVIDADE
export function update(name, newActivity) {
  const index = activities.findIndex((a) => a.nome == name);
  if (index !== -1) {
    activities[index] = newActivity;
    saveToLocalStorage("activities", activities);
    return true;
  }
  throw Error("No Activity Found");
}

// APAGAR ACTIVIDADE
export function deleteActivity(id) {
  const index = activities.findIndex((a) => a.id == id);
  if (index !== -1) {
    activities.splice(index, 1);
    saveToLocalStorage("activities", activities);
    return true;
  }
  throw Error("No Activity Found");
}

/**
 * CLASSE QUE MODELA UMA ATIVIDADE NA APLICAÇÃO
 */
class Activity {
  id = 0;
  destino = 0;
  tipoTurismo = "";
  nome = "";
  foto = "";
  descricao = "";
  acessibilidade = [];
  constructor(
    id,
    destino,
    tipoTurismo,
    nome,
    foto,
    descricao,
    acessibilidade = []
  ) {
    this.id = id;
    this.destino = destino;
    this.tipoTurismo = tipoTurismo;
    this.nome = nome;
    this.foto = foto;
    this.descricao = descricao;
    this.acessibilidade = acessibilidade;
  }
}
