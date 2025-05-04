
const flights = []
//Defenição da Paginação da Tabela
let currentPage = 1 //Inicia a Pagina Sempre a 1
const rowsPerPage = 13 //Define Linhas a Mostrar
//Ordenação da Tabela
let sortColumn = null;
let sortDirection = 'asc';

//CRUD Flights
const createFlight = () => {
    const form = document.getElementById("add_flight_form")
    const flight = {}
    //Note: Adicionar Validação de Dados
    for (let element of form.elements) {
        // Id/Nome do elemento como Key (key:value)
        const key = element.name || element.id
        // Filtrar keys vazias
        if (key) {
            flight[key] = element.value
        }
    }
    flights.push(flight)

    //Atualizar Tabela
    currentPage = 1
    updateTable()
}
const readFlight = () => {
    return flights //comming soon
}
const updateFlight = (object,newObject) => {
    //Atualizar Tabela
    currentPage = 1
    updateTable()
}
const deleteFlight = (object) => {
    //Atualizar Tabela
    currentPage = 1
    updateTable()
}

//Interações c/Interface

//Modal
const openModal = (id) => {
    document.getElementById(id).classList.remove("hidden")
  }
const closeModal = (id) => {
    document.getElementById(id).classList.add("hidden")
}

//Tabela Voos
//Paginação
const updatePaginationControls = () => {
    const container = document.getElementById("pagination-controls")
    container.innerHTML = ""
    const totalPages = Math.ceil(flights.length / rowsPerPage)

    const createPageButton = (label, page, isActive = false, isEllipsis = false) => {
        const btn = document.createElement("button")
        btn.className = `w-8 h-8 px-2.5 py-2 rounded-lg inline-flex flex-col justify-center items-center gap-2.5 ${
            isActive ? "bg-Main-Primary" : "outline outline-2 outline-offset-[-2px] outline-Components-Limit-Color"
        }`
        if (isEllipsis) {
            const p = document.createElement("p")
            p.textContent = "..."
            p.className = "justify-start text-black text-lg font-normal font-['IBM_Plex_Sans']"
            btn.appendChild(p)
        } else {
            const p = document.createElement("p")
            p.textContent = label
            p.className = `justify-start ${isActive ? "text-white" : "text-black"} text-lg font-normal font-['IBM_Plex_Sans']`
            btn.appendChild(p)
            btn.onclick = () => {
                currentPage = page
                updateTable()
            }
        }
        return btn
    }
    const createIconButton = (icon, onClick, disabled = false) => {
        const btn = document.createElement("button")
        btn.className = `w-8 h-8 px-2.5 py-2 rounded-lg outline outline-2 outline-offset-[-2px] outline-Components-Limit-Color inline-flex flex-col justify-center items-center gap-2.5
                        ${disabled ? "opacity-50 pointer-events-none" : ""}`

        const span = document.createElement("span")
        span.className = "material-symbols-outlined text-zinc-900 cursor-pointer"
        span.textContent = icon
        btn.appendChild(span)

        if (!disabled) btn.onclick = onClick

        return btn
    }

    // Left Arrow
    container.appendChild(createIconButton("chevron_left", () => {
        if (currentPage > 1) {
            currentPage--
            updateTable()
        }
    }, currentPage === 1))

    // First Page
    container.appendChild(createPageButton(1, 1, currentPage === 1))

    // Before current page
    if (currentPage > 3) container.appendChild(createPageButton("...", null, false, true))
    if (currentPage > 2) container.appendChild(createPageButton(currentPage - 1, currentPage - 1))

    // Current Page
    if (currentPage !== 1 && currentPage !== totalPages)
        container.appendChild(createPageButton(currentPage, currentPage, true))

    // After current page
    if (currentPage < totalPages - 1) container.appendChild(createPageButton(currentPage + 1, currentPage + 1))
    if (currentPage < totalPages - 2) container.appendChild(createPageButton("...", null, false, true))

    // Last Page
    if (totalPages > 1)
        container.appendChild(createPageButton(totalPages, totalPages, currentPage === totalPages))

    // Right Arrow
    container.appendChild(createIconButton("chevron_right", () => {
        if (currentPage < totalPages) {
            currentPage++
            updateTable()
        }
    }, currentPage === totalPages))
}
//Carregar Tabela
const updateTable = () => {
    const tableBody = document.getElementById("tableContent")
    tableBody.innerHTML = "" // reset

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentFlights = flights.slice(startIndex, endIndex)

    currentFlights.forEach((flight, index) => {
        const row = document.createElement("tr")
        row.classList.add("table-row", "h-[42px]")
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
        `
        tableBody.appendChild(row)
    })

    updatePaginationControls()
}
//Ordenar Tabela
const updateSortIcons = (activeColumn) => { //Se não for para usar esta função na versão final REMINDER:limpar chamada no sortTableBy()
    const columns = ['flight_name', 'flight_from', 'flight_to', 'flight_company', 'flight_leaves', 'flight_direct'];

    columns.forEach(col => {
        const iconEl = document.getElementById(`sort-icon-${col}`);
        if (!iconEl) return;

        if (col === activeColumn) {
            iconEl.innerHTML = sortDirection === 'asc' ? '▲' : '▼';
        } else {
            iconEl.innerHTML = ''; // Limpar Outros
        }
    });
}
const sortTableBy = (column) =>{
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }

    flights.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Converção Data
        if (column === 'flight_leaves') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    updateSortIcons(column)
    currentPage = 1
    updateTable()
}

//On Page Load
document.addEventListener("DOMContentLoaded", () => {
    updateTable()
})