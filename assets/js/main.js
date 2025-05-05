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
    updateTable(flightTableConfig)
}
const readFlight = (filterFn = null) => { //filtro byDefault nenhum
    return filterFn ? flights.filter(filterFn) : flights;
}
const updateFlight = (originalFlight, updatedFlight) => {
    const index = flights.findIndex(f => f.flight_name === originalFlight);
    if (index !== -1) {
        flights[index] = updatedFlight;
        return true;
    }
    return false;
}
const deleteFlight = (flight_name) => {
    const index = flights.findIndex(f => f.flight_name === flight_name);
    if (index !== -1) {
        flights.splice(index, 1);
        saveToLocalStorage('flights', flights);
        currentPage = 1;
        updateTable(flightTableConfig);
    }
};
//CRUD Destino
const createDestination = () => {

}
const readDestination = (filterFn = null) => {

}
const updateDestination = (originalDestination, updatedDestination) => {

}
const deleteDestination = (destination_name) => {
}
//CRUD Hotel
const createHotel = () => {

}
const readHotel = (filterFn = null) => {

}
const updateHotel = (originalHotel, updatedHotel) => {

}
const deleteHotel = (hotel_name) => {

}
//CRUD Carros
const createCar = () => {

}
const readCar = (filterFn = null) => {

}
const updateCar = (originalCar, updatedCar) => {

}
const deleteCar = (car_name) => {

}
//CRUD Atividades
const createActivitie = () => {

}
const readActivitie = (filterFn = null) => {

}
const updateActivitie = (originalActivitie, updatedActivitie) => {

}
const deleteActivitie = (activitie_name) => {

}
//CRUD User
const createUser = () => {

}
const readUser = (filterFn = null) => {

}
const updateUser = (originalUser, updatedUser) => {

}
const deleteUser = (user_name) => {

}
//CRUD Tipologias de Turismo
const createTurism = () => {

}
const readTurism = (filterFn = null) => {

}
const updateTurism = (originalTurism, updatedTurism) => {

}
const deleteTurism = (turism_name) => {

}
//CRUD Opções de Acessibilidade
const createAcess = () => {

}
const readAcess = (filterFn = null) => {

}
const updateAcess = (originalAcess, updatedAcess) => {

}
const deleteAcess = (acess_name) => {

}
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
    const originalFlight = document.getElementById('original_flight_name').value;
    const updatedFlight = getFormData("add_flight_form");

    const required = ['flight_name', 'flight_from', 'flight_to', 'flight_leaves'];
    const missing = required.filter(key => !updatedFlight[key]);
    if (missing.length > 0) {
        showToast("Preencha todos os campos obrigatórios.", 'error');
        return;
    }

    const success = updateFlight(originalFlight, updatedFlight);
    if (!success) {
        showToast("Erro ao editar voo.", 'error');
        return;
    }

    saveToLocalStorage('flights', flights);;
    showToast("Voo editado com sucesso!");
    resetModalToAddMode();
    closeModal('modal-adicionar');
    updateTable(flightTableConfig);
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


    document.getElementById('add_flight_form').reset()
    document.getElementById('original_flight_name').value = ""
}
// Tabela Voos
// Paginação
const updatePaginationControls = (config) => {
    const container = document.getElementById("pagination-controls");
    container.innerHTML = "";
    const totalPages = Math.ceil(config.data.length / rowsPerPage);

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
                updateTable(flightTableConfig)
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
            updateTable(flightTableConfig)
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
            updateTable(flightTableConfig)
        }
    }, currentPage === totalPages))
}
//Carregar Tabela
const updateTable = (config) => {
    const { data, columns, actions } = config;
    const tableBody = document.getElementById("tableContent");
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = data.slice(startIndex, startIndex + rowsPerPage);

    currentData.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className = "table-row h-[42px]";

        columns.forEach(col => {
            const td = document.createElement("td");
            td.className = "table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-['IBM_Plex_Sans']";
            td.textContent = row[col.key];
            tr.appendChild(td);
        });

        if (actions?.length) {
            const actionTd = document.createElement("td");
            actionTd.className = "table-cell w-48 py-3.5 outline outline-[3px] outline-offset-[-3px] outline-neutral-100 inline-flex justify-center items-center text-center";

            actions.forEach(({ icon, class: iconClass, handler }) => {
                const btn = document.createElement("button");
                btn.className = `material-symbols-outlined cursor-pointer mr-6 ${iconClass}`;
                btn.textContent = icon;
                btn.onclick = () => handler(row[columns[0].key]);
                actionTd.appendChild(btn);
            });

            tr.appendChild(actionTd);
        }

        tableBody.appendChild(tr);
    });

    updatePaginationControls(config)
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
const sortTableBy = (columnKey, config) => {
    const column = config.columns.find(col => col.key === columnKey);
    if (!column || !column.sortable) return;

    if (sortColumn === columnKey) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columnKey;
        sortDirection = 'asc';
    }

    config.data.sort((a, b) => {
        let valA = a[columnKey];
        let valB = b[columnKey];

        //Tipo de Sort Data=>Number=>String
        if (column.type === 'date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (!isNaN(valA) && !isNaN(valB)) {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }
        
        //Sort Info
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    updateSortIcons(columnKey);
    currentPage = 1;
    updateTable(config);
};
// === Constantes de Configuração de Tabelas ===
const flightTableConfig = {
    data: flights,
    columns: [
        { key: 'flight_name', label: 'Name', sortable: true },
        { key: 'flight_from', label: 'From', sortable: true },
        { key: 'flight_to', label: 'To', sortable: true },
        { key: 'flight_company', label: 'Company', sortable: true },
        { key: 'flight_leaves', label: 'Leaves', sortable: true, type: 'date' },
        { key: 'flight_direct', label: 'Direct', sortable: true },
    ],
    actions: [
        { icon: 'edit_square', class: 'text-Main-Primary', handler: editFlight },
        { icon: 'delete', class: 'text-red-600', handler: deleteFlight }
    ]
};
// === On Page Load ===
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage('flights', flights);
    updateTable(flightTableConfig)
})