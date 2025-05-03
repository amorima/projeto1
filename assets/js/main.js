
const flights = []

//CRUD Flights
const createFlight = () => {
    const form = document.getElementById("add_flight_form")
    const flight = {}
    //Note: Adicionar Validação de Dados
    for (let element of form.elements) {
        // Id/Nome do elemento como Key (key:value)
        const key = element.name || element.id;
        // Filtrar keys vazias
        if (key) {
            flight[key] = element.value;
        }
    }
    flights.push(flight)
}
const readFlight = () => {
    return flights; //comming soon
}
const updateFlight = (object,newObject) => {

}
const deleteFlight = (object) => {

}

//Interações c/Interface

//Modal Gestão de Voos
const openModal = () => {
    document.getElementById("modal-adicionar").classList.remove("hidden");
  }
const closeModal = () => {
    document.getElementById("modal-adicionar").classList.add("hidden");
}

//Tabela Voos
const updateTable = () => {
    const tableBody = document.getElementById("tableContent");
    tableBody.innerHTML = ""; // reset

    flights.forEach((flight, index) => {
        const row = document.createElement("tr");
        row.classList.add("table-row", "h-[42px]");
        row.innerHTML = `
            <td class="table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-bold font-['IBM_Plex_Sans']">${flight.flight_name}</td>
            <td class="table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-normal font-['IBM_Plex_Sans']">${flight.flight_from}</td>
            <td class="table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-normal font-['IBM_Plex_Sans']">${flight.flight_to}</td>
            <td class="table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-normal font-['IBM_Plex_Sans']">${flight.flight_company}</td>
            <td class="table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-normal font-['IBM_Plex_Sans']">${flight.flight_leaves}</td>
            <td class="table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-normal font-['IBM_Plex_Sans']">${flight.flight_direct}</td>
            <td class="table-cell w-48 py-3.5 outline outline-[3px] outline-offset-[-3px] outline-neutral-100 inline-flex justify-center items-center text-center">
                <button class="material-symbols-outlined text-Main-Primary cursor-pointer mr-6" onclick="editFlight(${index})">edit_square</button>
                <button class="material-symbols-outlined text-red-600  cursor-pointer mr-6" onclick="deleteFlight(${index})">delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};