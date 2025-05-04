// === Variaveis Gerais ===
const flights = []
//Defenição da Paginação da Tabela
let currentPage = 1 //Inicia a Pagina Sempre a 1
const rowsPerPage = 13 //Define Linhas a Mostrar
//Ordenação da Tabela
let sortColumn = null;
let sortDirection = 'asc';

// === Funções Uteis ===
const getFormData = (formId) => {
    const form = document.getElementById(formId);
    const data = {};
    for (let element of form.elements) {
        const key = element.name || element.id;
        if (key){
            data[key] = element.value;
        } 
    }
    return data;
}
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg z-50 
        ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
//Local Storage
const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};
const loadFromLocalStorage = (key, targetArray) => {
    const saved = localStorage.getItem(key);
    if (saved) {
        const content = JSON.parse(saved);
        if (Array.isArray(content)) {
            targetArray.splice(0, targetArray.length, ...content);
        }
    }
};

// === CRUD PlanIt ===
//CRUD Flights
const createFlight = () => {
    const flight = getFormData("add_flight_form");

    //Validação Dados Preenchimento Antes de Adicionar ao Array de Objetos
    const required = ['flight_name', 'flight_from', 'flight_to', 'flight_leaves'];
    const missing = required.filter(key => !flight[key]);
    if (missing.length > 0) {
        showToast("Preencha todos os campos obrigatórios.", 'error');
        return;
    }

    if (flights.some(f => f.flight_name === flight.flight_name)) {
        showToast("Nº do voo deve ser único.", 'error');
        return;
    }

    flights.push(flight)
    saveToLocalStorage('flights', flights);

    showToast("Voo adicionado com sucesso!");
    closeModal('modal-adicionar');
    currentPage = 1
    updateTable()
}
const readFlight = (filterFn = null) => { //filtro byDefault nenhum
    return filterFn ? flights.filter(filterFn) : flights;
}
const updateFlight = (originalName, updatedFlight) => {
    const index = flights.findIndex(f => f.flight_name === originalName);
    if (index !== -1) {
        flights[index] = updatedFlight;
        return true;
    }
    return false;
}
const deleteFlight = (object_name) => {
    //Comentado: Confirm Delete
    //if (!confirm(`Are you sure you want to delete flight "${object_name}"?`)) return;

    const index = flights.findIndex(f => f.flight_name === object_name);
    if (index !== -1) {
        flights.splice(index, 1);
        saveToLocalStorage('flights', flights);
        currentPage = 1;
        updateTable();
    }
};    

// === Interface ===
// Interações Modal 
const openModal = (id) => {
    document.getElementById(id).classList.remove("hidden")
  }
const closeModal = (id) => {
    document.getElementById(id).classList.add("hidden")
}
const editFlight = (name) => {
    const flight = readFlight(f => f.flight_name === name)[0];
    if (!flight) return;

    // Editar Titulo
    document.querySelector('#modal-adicionar h2').innerText = 'Editar voo'

    document.getElementById('original_flight_name').value = flight.flight_name;
    // Preencher Campos
    document.getElementById('flight_name').value = flight.flight_name;
    document.getElementById('flight_from').value = flight.flight_from;
    document.getElementById('flight_to').value = flight.flight_to;
    document.getElementById('flight_company').value = flight.flight_company;
    document.getElementById('flight_leaves').value = flight.flight_leaves;
    document.getElementById('flight_direct').value = flight.flight_direct;

    //Adicionar => Salvar
    const addButton = document.querySelector('#modal-adicionar button[onclick="createFlight()"]');
    addButton.innerHTML = `
        <div class="inline-flex justify-start items-center gap-2.5">
            <span class="material-symbols-outlined text-white cursor-pointer">edit_square</span>
            <div class="justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']">Salvar</div>
        </div>
    `;
    addButton.onclick = saveEditedFlight;

    openModal(`modal-adicionar`);
}
const saveEditedFlight = () => {
    const originalName = document.getElementById('original_flight_name').value;
    const updatedFlight = getFormData("add_flight_form");

    const required = ['flight_name', 'flight_from', 'flight_to', 'flight_leaves'];
    const missing = required.filter(key => !updatedFlight[key]);
    if (missing.length > 0) {
        showToast("Preencha todos os campos obrigatórios.", 'error');
        return;
    }

    const success = updateFlight(originalName, updatedFlight);
    if (!success) {
        showToast("Erro ao editar voo.", 'error');
        return;
    }

    saveToLocalStorage('flights', flights);;
    showToast("Voo editado com sucesso!");
    resetModalToAddMode();
    closeModal('modal-adicionar');
    updateTable();
};
const resetModalToAddMode = () => {
    document.querySelector('#modal-adicionar h2').innerText = 'Adicionar voo manual';

    const addButton = document.querySelector('#modal-adicionar button');
    addButton.innerHTML = `
        <div class="inline-flex justify-start items-center gap-2.5">
            <span class="material-symbols-outlined text-white cursor-pointer">add_circle</span>
            <div class="justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']">Adicionar</div>
        </div>
    `;
    addButton.onclick = createFlight;

    // Optionally clear the form
    document.getElementById('add_flight_form').reset()
    document.getElementById('original_flight_name').value = ""
}

// Tabela Voos
// Paginação
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
                <button class="material-symbols-outlined text-Main-Primary cursor-pointer mr-6" onclick="editFlight('${flight.flight_name}')">edit_square</button>
                <button class="material-symbols-outlined text-red-600  cursor-pointer mr-6" onclick="deleteFlight('${flight.flight_name}')">delete</button>
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
            iconEl.innerHTML = sortDirection === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
        } else {
            iconEl.innerHTML = ''; // Limpar Outros
        }
    });
}
const sortTableBy = (column) =>{//WARNING: Não contempla tabulação
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

// === On Page Load ===
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage('flights', flights);
    updateTable()
})