// === Variaveis Gerais ===
const flights = [
/*     voo = {
        id: int,
        nºvoo: str,
        from: str,
        to: str,
        company: str,
        leaves: data,
        arrives: data,
        direct: "boll",
        price: int
    } */
]
const destinations = [
/*     destino = {
        id: int,
        cidade: str,
        pais: str,
        aeroporto: str,
        tipo_de_turismo : array,
        acessibilidade: array,
    } */
]
const cars = [
/*     car = {
        id: int,
        destinoId: int,
        marca: str,
        modelo: str,
        lugares: int,
        preço/Dia: int,
        foto: str(url),
        desponibilidade: bool,
        adaptado: bool,
    } */
]
const hotels = [
/*     hotel = {
        id: int,
        destinoId: int,
        nome: str,
        foto: str(url),
        quartos: object,
    } */
]
const airports = [
/*     aeroporto {
        code: str,
        pais: str,
        cidade: str,
    } */
]
const activities = [
/*     atividade = {
        id: int,
        destinoId: int,
        tipo_de_turismo: str?array,
        nome: str,
        foto: str(url),
        descrição: str,
        acessibilidade: array,
    } */
]
const turismTypes = [/* str
    "Turismo religioso", "Turismo cultural", "Ecoturismo", "Turismo rural",
    "Turismo gastronómico", "Turismo de Sol e Praia", "Turismo de negócios" */
]
const accessibilityOptions = [/* str
    "Acesso Sem Degraus", "Elevadores Disponíveis", "Casas de Banho Adaptadas",
    "Quartos Adaptados", "Transporte Acessível", "Informação em Braille/Áudio", */
]
//Defenição da Paginação da Tabela
let currentPage = 1 //Inicia a Pagina Sempre a 1
const rowsPerPage = 13 //Define Linhas a Mostrar
//Ordenação da Tabela
let sortColumn = null
let sortDirection = `asc`
// === Funções Uteis ===
const getFormData = (formId) => {
    const form = document.getElementById(formId)
    const data = {}
    for (let element of form.elements) {
        const key = element.name || element.id
        if (key){
            data[key] = element.value
        } 
    }
    return data
}
const showToast = (message, type = `success`) => {
    const toast = document.createElement(`div`)
    toast.className = `fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg z-50 
        ${type === `success` ? `bg-green-500 text-white` : `bg-red-500 text-white`}`
    toast.innerText = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
}
//Local Storage
const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data))
}
const loadFromLocalStorage = (key, targetArray) => {
    const saved = localStorage.getItem(key)
    if (saved) {
        const content = JSON.parse(saved)
        if (Array.isArray(content)) {
            targetArray.splice(0, targetArray.length, ...content)
        }
    }
}

// === CRUD PlanIt ===
//CRUD Flights
const createFlight = () => {
    const flight = getFormData('add_flight_form')

    //Validação Dados Preenchimento Antes de Adicionar ao Array de Objetos
    const required = [`flight_name`, `flight_from`, `flight_to`, `flight_leaves`]
    const missing = required.filter(key => !flight[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    if (flights.some(f => f.flight_name === flight.flight_name)) {
        showToast('Nº do voo deve ser único.', `error`)
        return
    }

    flights.push(flight)
    saveToLocalStorage(`flights`, flights)

    showToast('Voo adicionado com sucesso!')
    closeModal(`modal-adicionar`)
    currentPage = 1
    updateTable(flightTableConfig)
}
const readFlight = (filterFn = null) => { //filtro byDefault nenhum
    return filterFn ? flights.filter(filterFn) : flights
}
const updateFlight = (originalFlight, updatedFlight) => {
    const index = flights.findIndex(f => f.flight_name === originalFlight)
    if (index !== -1) {
        flights[index] = updatedFlight
        return true
    }
    return false
}
const deleteFlight = (flight_name) => {
    const index = flights.findIndex(f => f.flight_name === flight_name)
    if (index !== -1) {
        flights.splice(index, 1)
        saveToLocalStorage(`flights`, flights)
        currentPage = 1
        updateTable(flightTableConfig)
        showToast('Viagem removida com sucesso.','error')
    }
}
//CRUD Destino
const createDestination = () => {
    const destination = getFormData('add_destination_form')

    // Tipos de Turismo e Acessibilidade => Array
    destination.destination_type = destination.destination_type.split(`,`).map(t => t.trim())
    destination.destination_acess = destination.destination_acess.split(`,`).map(a => a.trim())

    // Validação
    const required = [`destination_city`, `destination_country`, `destination_aero`]
    const missing = required.filter(key => !destination[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    // Chack Aeroporto Unico
    if (destinations.some(d => d.destination_aero === destination.destination_aero)) {
        showToast('Destino com este aeroporto já existe.', `error`)
        return
    }

    destination.id = 1 //Gerar Id Unico
    destinations.push(destination)
    saveToLocalStorage(`destinations`, destinations)
    showToast('Destino adicionado com sucesso!')
    closeModal(`modal-adicionar`)
    currentPage = 1
    updateTable(destinationTableConfig)
}
const readDestination = (filterFn = null) => {
    return filterFn ? destinations.filter(filterFn) : destinations
}
const updateDestination = (originalId, updatedDestination) => {
    const index = destinations.findIndex(d => d.id == originalId)
    if (index !== -1) {
        updatedDestination.id = originalId // Manter ID
        //Tipos de Turismo e Acessebilidade => Array
        updatedDestination.tiposTurismo = updatedDestination.tiposTurismo.split(`,`).map(t => t.trim())
        updatedDestination.acessibilidade = updatedDestination.acessibilidade.split(`,`).map(a => a.trim())
        destinations[index] = updatedDestination
    }
}
const deleteDestination = (id) => {
    const index = destinations.findIndex(d => d.id == id)
    if (index !== -1) {
        destinations.splice(index, 1)
        saveToLocalStorage(`destinations`, destinations)
        currentPage = 1
        updateTable(destinationTableConfig)
        showToast('Destino removido com sucesso.')
    }
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
//CRUD Aeroporto
const createAero = () => {

}
const readAero = (filterFn = null) => {

}
const updateAero = (originalAir, updatedAir) => {

}
const deleteAero = (air_name) => {

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
    document.getElementById(id).classList.remove('hidden')
  }
const closeModal = (id) => {
    document.getElementById(id).classList.add('hidden')
}
const editFlight = (name) => { // Quando Adiconar id aos Objetos Atualizar esta Funçao name => id
    const flight = readFlight(f => f.flight_name === name)[0]
    if (!flight) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar voo`

    document.getElementById(`original_flight_name`).value = flight.flight_name
    // Preencher Campos
    document.getElementById(`flight_name`).value = flight.flight_name
    document.getElementById(`flight_from`).value = flight.flight_from
    document.getElementById(`flight_to`).value = flight.flight_to
    document.getElementById(`flight_company`).value = flight.flight_company
    document.getElementById(`flight_leaves`).value = flight.flight_leaves
    document.getElementById(`flight_direct`).value = flight.flight_direct

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createFlight()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedFlight

    openModal(`modal-adicionar`)
}
const saveEditedFlight = () => {
    const originalFlight = document.getElementById(`original_flight_name`).value
    const updatedFlight = getFormData('add_flight_form')

    const required = [`flight_name`, `flight_from`, `flight_to`, `flight_leaves`]
    const missing = required.filter(key => !updatedFlight[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateFlight(originalFlight, updatedFlight)
    if (!success) {
        showToast('Erro ao editar voo.', `error`)
        return
    }

    saveToLocalStorage(`flights`, flights)
    showToast('Voo editado com sucesso!')
    resetModalToAddMode()
    closeModal(`modal-adicionar`)
    updateTable(flightTableConfig)
}
const resetModalToAddMode = () => {
    document.querySelector(`#modal-adicionar h2`).innerText = `Adicionar voo manual`

    const addButton = document.querySelector(`#modal-adicionar button`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>add_circle</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Adicionar</div>
        </div>
    `
    addButton.onclick = createFlight


    document.getElementById(`add_flight_form`).reset()
    document.getElementById(`original_flight_name`).value = ''
}
const editDestination = (id) => {//Modal Edição destinos

}
const editCar = (id) => {//Modal Edição Carros

}
const editHotel = (id) => {//Modal Edição Hotel

}
const editAero = (id) => {//Modal Edição Aeroportos

}
const editActivitie = (id) => {//Modal Edição de Atividades

}
// Tabela Voos 
// Paginação
const updatePaginationControls = (config) => {
    const container = document.getElementById('pagination-controls')
    container.innerHTML = ''
    const totalPages = Math.ceil(config.data.length / rowsPerPage)

    const createPageButton = (label, page, isActive = false, isEllipsis = false) => {
        const btn = document.createElement('button')
        btn.className = `w-8 h-8 px-2.5 py-2 rounded-lg inline-flex flex-col justify-center items-center gap-2.5 ${
            isActive ? 'bg-Main-Primary' : 'outline outline-2 outline-offset-[-2px] outline-Components-Limit-Color'
        }`
        if (isEllipsis) {
            const p = document.createElement('p')
            p.textContent = '...'
            p.className = 'justify-start text-black text-lg font-normal font-[`IBM_Plex_Sans`]'
            btn.appendChild(p)
        } else {
            const p = document.createElement('p')
            p.textContent = label
            p.className = `justify-start ${isActive ? 'text-white' : 'text-black'} text-lg font-normal font-['IBM_Plex_Sans']`
            btn.appendChild(p)
            btn.onclick = () => {
                currentPage = page
                updateTable(flightTableConfig)
            }
        }
        return btn
    }
    const createIconButton = (icon, onClick, disabled = false) => {
        const btn = document.createElement('button')
        btn.className = `w-8 h-8 px-2.5 py-2 rounded-lg outline outline-2 outline-offset-[-2px] outline-Components-Limit-Color inline-flex flex-col justify-center items-center gap-2.5
                        ${disabled ? 'opacity-50 pointer-events-none' : ''}`

        const span = document.createElement('span')
        span.className = 'material-symbols-outlined text-zinc-900 cursor-pointer'
        span.textContent = icon
        btn.appendChild(span)

        if (!disabled) btn.onclick = onClick

        return btn
    }

    // Left Arrow
    container.appendChild(createIconButton('chevron_left', () => {
        if (currentPage > 1) {
            currentPage--
            updateTable(flightTableConfig)
        }
    }, currentPage === 1))

    // First Page
    container.appendChild(createPageButton(1, 1, currentPage === 1))

    // Before current page
    if (currentPage > 3) container.appendChild(createPageButton('...', null, false, true))
    if (currentPage > 2) container.appendChild(createPageButton(currentPage - 1, currentPage - 1))

    // Current Page
    if (currentPage !== 1 && currentPage !== totalPages)
        container.appendChild(createPageButton(currentPage, currentPage, true))

    // After current page
    if (currentPage < totalPages - 1) container.appendChild(createPageButton(currentPage + 1, currentPage + 1))
    if (currentPage < totalPages - 2) container.appendChild(createPageButton('...', null, false, true))

    // Last Page
    if (totalPages > 1)
        container.appendChild(createPageButton(totalPages, totalPages, currentPage === totalPages))

    // Right Arrow
    container.appendChild(createIconButton('chevron_right', () => {
        if (currentPage < totalPages) {
            currentPage++
            updateTable(flightTableConfig)
        }
    }, currentPage === totalPages))
}
//Carregar Tabela
const updateTable = (config) => {
    const { data, columns, actions } = config
    const tableBody = document.getElementById('tableContent')
    tableBody.innerHTML = ''

    const startIndex = (currentPage - 1) * rowsPerPage
    const currentData = data.slice(startIndex, startIndex + rowsPerPage)

    currentData.forEach((row) => {
        const tr = document.createElement('tr')
        tr.className = 'table-row h-[42px]'

        columns.forEach(col => {
            const td = document.createElement('td')
            td.className = 'table-cell outline outline-[3px] outline-offset-[-3px] outline-neutral-100 text-center text-black text-xl font-[`IBM_Plex_Sans`]'
            //Table Data Contempla Arrays
            const cellValue = row[col.key]
            td.textContent = Array.isArray(cellValue) ? cellValue.join(`, `) : cellValue
            tr.appendChild(td)
        })

        if (actions?.length) {
            const actionTd = document.createElement('td')
            actionTd.className = 'table-cell w-48 py-3.5 outline outline-[3px] outline-offset-[-3px] outline-neutral-100 inline-flex justify-center items-center text-center'

            actions.forEach(({ icon, class: iconClass, handler }) => {
                const btn = document.createElement('button')
                btn.className = `material-symbols-outlined cursor-pointer mr-6 ${iconClass}`
                btn.textContent = icon
                btn.onclick = () => handler(row[columns[0].key]) // Quando Adicionar id aos objetos alterar esta linha para row[data.id]
                actionTd.appendChild(btn)
            })

            tr.appendChild(actionTd)
        }

        tableBody.appendChild(tr)
    })

    updatePaginationControls(config)
}
//Ordenar Tabela
const updateSortIcons = (activeColumn, tableConfig) => {
    const columns = tableConfig.columns.map(col => col.key)

    columns.forEach(col => {
        const iconEl = document.getElementById(`sort-icon-${col}`)
        if (!iconEl) return

        if (col === activeColumn) {
            iconEl.innerHTML = sortDirection === `asc` ? `arrow_drop_up` : `arrow_drop_down`
        } else {
            iconEl.innerHTML = ``
        }
    })
}
const sortTableBy = (columnKey, config) => {
    const column = config.columns.find(col => col.key === columnKey)
    if (!column || !column.sortable) return

    if (sortColumn === columnKey) {
        sortDirection = sortDirection === `asc` ? `desc` : `asc`
    } else {
        sortColumn = columnKey
        sortDirection = `asc`
    }

    config.data.sort((a, b) => {
        let valA = a[columnKey]
        let valB = b[columnKey]

        //Tipo de Sort Data=>Number=>String
        if (column.type === `date`) {
            valA = new Date(valA).getTime()
            valB = new Date(valB).getTime()
        } else if (!isNaN(valA) && !isNaN(valB)) {
            valA = parseFloat(valA)
            valB = parseFloat(valB)
        } else {
            valA = String(valA).toLowerCase()
            valB = String(valB).toLowerCase()
        }
        
        //Sort Info
        if (valA < valB) return sortDirection === `asc` ? -1 : 1
        if (valA > valB) return sortDirection === `asc` ? 1 : -1
        return 0
    })

    updateSortIcons(columnKey, config)
    currentPage = 1
    updateTable(config)
}
// === Constantes de Configuração de Tabelas ===
const flightTableConfig = {
    data: flights,
    columns: [
        { key: `flight_name`, label: `Name`, sortable: true },
        { key: `flight_from`, label: `From`, sortable: true },
        { key: `flight_to`, label: `To`, sortable: true },
        { key: `flight_company`, label: `Company`, sortable: true },
        { key: `flight_leaves`, label: `Leaves`, sortable: true, type: `date` },
        { key: `flight_direct`, label: `Direct`, sortable: true },
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editFlight },
        { icon: `delete`, class: `text-red-600`, handler: deleteFlight }
    ]
}
const destinationTableConfig = {
    data: destinations,
    columns: [
        { key: `destination_country`, label: `País`, sortable: true },
        { key: `destination_city`, label: `Cidade`, sortable: true },
        { key: `destination_aero`, label: `Aeroporto`, sortable: true },
        { key: `destination_type`, label: `Tipos de Turismo`, sortable: true },
        { key: `destination_acess`, label: `Acessibilidade`, sortable: true },
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editDestination },
        { icon: `delete`, class: `text-red-600`, handler: deleteDestination }
    ]
}
const carTableConfig = {
    data: cars,
    columns: [
        {key:`cars_destinoId`, label:`Localização`, sortable: true},
        {key:`cars_brand`, label:`Marca`, sortable: true},
        {key:`cars_model`, label:`Modelo`, sortable: true},
        {key:`cars_seats`, label:`Lugares`, sortable: true},
        {key:`cars_price`, label:`Preço`, sortable: true},
        {key:`cars_available`, label:`Disponivel`, sortable: true},
        {key:`cars_adapted`, label:`Adapatado`, sortable: true},
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editCar },
        { icon: `delete`, class: `text-red-600`, handler: deleteCar }
    ]
}
const hotelTableConfig = {
    data: hotels,
    columns: [ // Pensar em como gerir Quartos na tabela de Edição
        {key:`hotel_destinoId`, label:`Localização`, sortable: true},
        {key:`hotel_name`, label:`Nome`, sortable: true},
        {key:`hotel_quartos`, label:`Quartos`, sortable: true},
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editHotel },
        { icon: `delete`, class: `text-red-600`, handler: deleteHotel }
    ]
}
const airportTableConfig = {
    data: airports,
    columns: [ 
        {key:`air_code`, label:`Codigo Aeroporto`, sortable: true},
        {key:`air_country`, label:`Pais`, sortable: true},
        {key:`air_city`, label:`Cidade`, sortable: true},
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editAero },
        { icon: `delete`, class: `text-red-600`, handler: deleteAero }
    ]
}
const activitiesTableConfig = {
    data: activities,
    columns: [ 
        {key:`act_destinoId`, label:`Localização`, sortable: true},
        {key:`act_turism`, label:`Tipos de Turismo`, sortable: true},
        {key:`act_name`, label:`Atividade`, sortable: true},
        {key:`act_description`, label:`Descrição`, sortable: false},
        {key:`act_acess`, label:`Acessibilidade`, sortable: true},
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editActivitie },
        { icon: `delete`, class: `text-red-600`, handler: deleteActivitie }
    ]
}
// === On Page Load ===
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname

    if (path.includes('flights_admin.html')) {
        loadFromLocalStorage(`flights`, flights)
        updateTable(flightTableConfig)
    } else if (path.includes('places_admin.html')) {
        loadFromLocalStorage(`destinations`, destinations)
        updateTable(destinationTableConfig)
    } else if (path.includes('users_admin.html')) { 

    } else if (path.includes('turism_admin.html')) {

    }
})