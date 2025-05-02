const loadInitialData = async () => {
  try {
    const response = await fetch("db.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Guarda os dados iniciais no Local Storage
    localStorage.setItem("travelPlans", JSON.stringify(data.viagens || []));
    return data.viagens || [];
  } catch (error) {
    console.error("Could not load initial data from db.json:", error);
    return []; // Retorna array vazio em caso de erro
  }
};
