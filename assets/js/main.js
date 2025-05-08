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
        direct: 'boll',
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
    'Turismo religioso', 'Turismo cultural', 'Ecoturismo', 'Turismo rural',
    'Turismo gastronómico', 'Turismo de Sol e Praia', 'Turismo de negócios' */
]
const accessibilityOptions = [/* str
    'Acesso Sem Degraus', 'Elevadores Disponíveis', 'Casas de Banho Adaptadas',
    'Quartos Adaptados', 'Transporte Acessível', 'Informação em Braille/Áudio', */
]
const users = [
/*     username: str,
    email: str,
    password: str,
    points: int,
    level: int,
    private: bool,
    admin: bool,
    trips: array(objects),
    plans: array(objects) */
]
//Defenição da Paginação da Tabela
let currentPage = 1 //Inicia a Pagina Sempre a 1
const rowsPerPage = 13 //Define Linhas a Mostrar
//Ordenação da Tabela
let sortColumn = null
let sortDirection = `asc`
// === Funções Uteis ===
const getFormData = (formId) => {
    console.log(formId)
    const form = document.getElementById(formId)
    console.log(form)
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
const generateId = (array) => {
    return array.length ? array[array.length - 1].id + 1 : 1
}
const selectOptions = (array, selectId) => {
    const select = document.getElementById(selectId)
    select.innerHTML = ''
    array.forEach(item => {
        const option = document.createElement('option')
        option.value = item.aero_code
        option.textContent = item.aero_code
        select.appendChild(option)
    })
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
const createTurismAcess = () => {
    const form = getFormData('add_turism_acess')
    if(form.category == 'acessibilidade'){
        createAcess(form.type)
        loadTurismAcess(form.category)
    } else {
        createTurism(form.type)
        loadTurismAcess(form.category)
    }
}
//CRUD Flights
const createFlight = () => {
    const flight = getFormData('add_flight_form')
    flight.id = generateId(flights)

    //Validação Dados Preenchimento Antes de Adicionar ao Array de Objetos
    const required = [`name`, `from`, `to`, `leaves`]
    const missing = required.filter(key => !flight[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }
    if (flights.some(f => f.name === flight.name)) {
        showToast('Nº do voo deve ser único.', `error`)
        return
    }
/*     if (flight.) */

    flight.id = generateId(flights)
    flights.push(flight)
    saveToLocalStorage(`flights`, flights)

    showToast('Voo adicionado com sucesso!')
    closeModal(`modal-adicionar`,'add_flight_form','Adicionar voo manual',createFlight)
    currentPage = 1
    updateTable(flightTableConfig)
}
const readFlight = (filterFn = null) => {
    return filterFn ? flights.filter(filterFn) : flights
}
const updateFlight = (originalFlight, updatedFlight) => {
    const index = flights.findIndex(f => f.name === originalFlight)
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
    const required = [`destination_aero`]
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

    destination.destination_city = airports.find(a => a.aero_code === destination.destination_aero)?.aero_city || destination.destination_city
    destination.destination_country = airports.find(a => a.aero_code === destination.destination_aero)?.aero_country || destination.destination_country
    destination.id = generateId(destinations)
    destinations.push(destination)
    saveToLocalStorage(`destinations`, destinations)
    showToast('Destino adicionado com sucesso!')
    closeModal(`modal-adicionar`,'add_destination_form','Adicionar destino manual',createDestination)
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
        updatedDestination.destination_city = airports.find(a => a.aero_code === updatedDestination.destination_aero)?.aero_city || updatedDestination.destination_city
        updatedDestination.destination_country = airports.find(a => a.aero_code === updatedDestination.destination_aero)?.aero_country || updatedDestination.destination_country
        //Tipos de Turismo e Acessebilidade => Array
        updatedDestination.tiposTurismo = (updatedDestination.tiposTurismo || '').split(`,`).map(t => t.trim())
        updatedDestination.acessibilidade = (updatedDestination.acessibilidade || '').split(`,`).map(a => a.trim())        
        destinations[index] = updatedDestination
        return true
    }
    return false
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
//Warning: IMG
const createHotel = () => {
    const hotel = getFormData('add_hotel_form')

    const required = ['name', 'destinoId']
    const missing = required.filter(key => !hotel[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', 'error')
        return
    }

    hotel.id = generateId(hotels)
    hotels.push(hotel)
    saveToLocalStorage('hotels', hotels)
    showToast('Hotel adicionado com sucesso!')
    closeModal(`modal-adicionar`,'add_hotel_form','Adicionar hotel manual',createHotel)
    currentPage = 1
    updateTable(hotelTableConfig)
}
const readHotel = (filterFn = null) => {
    return filterFn ? hotels.filter(filterFn) : hotels
}
const updateHotel = (originalId, updatedHotel) => {
    const index = hotels.findIndex(h => h.id == originalId)
    if (index !== -1) {
        updatedHotel.id = originalId
        hotels[index] = updatedHotel
        saveToLocalStorage('hotels', hotels)
        return true
    }
    return false
}
const deleteHotel = (id) => {
    const index = hotels.findIndex(h => h.id == id)
    if (index !== -1) {
        hotels.splice(index, 1)
        saveToLocalStorage('hotels', hotels)
        updateTable(hotelTableConfig)
        showToast('Hotel removido com sucesso.','error')
    }
}
//CRUD Carros
//Warning: IMG
const createCar = () => {
    const car = getFormData('add_car_form')

    const required = ['cars_destinoId', 'cars_brand', 'cars_model', 'cars_seats', 'cars_price', 'cars_available' ,'cars_adapted']
    const missing = required.filter(key => !car[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', 'error')
        return
    }

    car.id = generateId(cars)
    cars.push(car)
    saveToLocalStorage('cars', cars)
    showToast('Carro adicionado com sucesso!')
    closeModal(`modal-adicionar`,'add_car_form','Adicionar caroo manual',createCar)
    currentPage = 1
    updateTable(carTableConfig)
}
const readCar = (filterFn = null) => {
    return filterFn ? cars.filter(filterFn) : cars
}
const updateCar = (originalId, updatedCar) => {
    const index = cars.findIndex(c => c.id == originalId)
    if (index !== -1) {
        updatedCar.id = originalId
        cars[index] = updatedCar
        saveToLocalStorage('cars', cars)
        return true
    }
    return false
}
const deleteCar = (id) => {
    const index = cars.findIndex(c => c.id == id)
    if (index !== -1) {
        cars.splice(index, 1)
        saveToLocalStorage('cars', cars)
        updateTable(carTableConfig)
        showToast('Carro removido com sucesso.','error')
    }
}
//CRUD Aeroporto
const createAero = () => {
    const airport = getFormData('add_airport_form')

    const required = ['aero_code', 'aero_country', 'aero_city']
    const missing = required.filter(key => !airport[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', 'error')
        return
    }

    if (airports.some(a => a.aero_code === airport.aero_code)) {
        showToast('Código do aeroporto deve ser único.', 'error')
        return
    }

    airport.id = generateId(airports)
    airports.push(airport)
    saveToLocalStorage('airports', airports)
    showToast('Aeroporto adicionado com sucesso!')
    closeModal(`modal-adicionar`,'add_airport_form','Adicionar aeroporto manual',createAero)
    updateTable(airportTableConfig)
}
const readAero = (filterFn = null) => {
    return filterFn ? airports.filter(filterFn) : airports
}
const updateAero = (originalId, updatedAero) => {
    const index = airports.findIndex(a => a.id == originalId)
    if (index !== -1) {
        updatedAero.id = originalId // Manter ID
        airports[index] = updatedAero
        saveToLocalStorage('airports', airports)
        return true
    }
    return false
}
const deleteAero = (code) => {
    const index = airports.findIndex(a => a.id === code)
    if (index !== -1) {
        airports.splice(index, 1)
        saveToLocalStorage('airports', airports)
        updateTable(airportTableConfig)
        showToast('Aeroporto removido com sucesso.')
    }
}
//CRUD Atividades
//Warning: IMg
const createActivitie = () => {
    const activity = getFormData('add_activitie_form')

    activity.act_turism = activity.act_turism?.split(',').map(t => t.trim())
    activity.act_acess = activity.act_acess?.split(',').map(a => a.trim())

    const required = ['act_name', 'act_destinoId']
    const missing = required.filter(key => !activity[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', 'error')
        return
    }

    activity.id = generateId(activities)
    activities.push(activity)
    saveToLocalStorage('activities', activities)
    showToast('Atividade adicionada com sucesso!')
    closeModal(`modal-adicionar`,'add_activitie_form','Adicionar atividade manual',createActivitie)
    updateTable(activitiesTableConfig)
}
const readActivitie = (filterFn = null) => {
    return filterFn ? activities.filter(filterFn) : activities
}
const updateActivitie = (originalId, updatedActivity) => {
    const index = activities.findIndex(a => a.id == originalId)
    if (index !== -1) {
        updatedActivity.id = originalId
        updatedActivity.tipo_de_turismo = updatedActivity.tipo_de_turismo?.split(',').map(t => t.trim())
        updatedActivity.acessibilidade = updatedActivity.acessibilidade?.split(',').map(a => a.trim())
        activities[index] = updatedActivity
        saveToLocalStorage('activities', activities)
        return true
    }
    return false
}
const deleteActivitie = (id) => {
    const index = activities.findIndex(a => a.id == id)
    if (index !== -1) {
        activities.splice(index, 1)
        saveToLocalStorage('activities', activities)
        updateTable(activitiesTableConfig)
        showToast('Atividade removida com sucesso.')
    }
}
//CRUD User
const createUser = () => {
    const user = getFormData('add_user_form')

    const required = ['username', 'email', 'password']
    const missing = required.filter(key => !user[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', 'error')
        return
    }

    if (users.some(u => u.username === user.username)) {
        showToast('Nome de utilizador já existe.', 'error')
        return
    }
    if (users.some(u => u.email === user.email)) {
        showToast('Email já existe.', 'error')
        return
    }

    users.push(user)
    saveToLocalStorage('users', users)
    showToast('Utilizador adicionado com sucesso!')
    closeModal(`modal-adicionar`,'add_user_form','Adicionar utilizador manual',createUser)
    updateTable(userTableConfig)
}
const readUser = (filterFn = null) => {
    return filterFn ? users.filter(filterFn) : users
}
const updateUser = (originalUser, updatedUser) => {
    const index = users.findIndex(u => u.username === originalUser)
    if (index !== -1) {
        users[index] = updatedUser
        saveToLocalStorage('users', users)
        return true
    }
    return false
}
const deleteUser = (username) => {
    const index = users.findIndex(u => u.username === username)
    if (index !== -1) {
        users.splice(index, 1)
        saveToLocalStorage('users', users)
        updateTable(userTableConfig)
        showToast('Utilizador removido com sucesso.')
    }
}
//CRUD Tipologias de Turismo
const createTurism = (type) => {
    if (!type || turismTypes.includes(type)) {
        showToast('Tipo já existe ou está vazio.', 'error')
        return
    }
    turismTypes.push(type)
    saveToLocalStorage('turismTypes', turismTypes)
    showToast('Tipo de turismo adicionado com sucesso!')
}
//const readTurism = () => turismTypes
const updateTurism = (original, updated) => {
    const index = turismTypes.findIndex(t => t === original)
    if (index !== -1) {
        turismTypes[index] = updated
        saveToLocalStorage('turismTypes', turismTypes)
    }
}
const deleteTurism = (type) => {
    const index = turismTypes.findIndex(t => t === type)
    if (index !== -1) {
        turismTypes.splice(index, 1)
        saveToLocalStorage('turismTypes', turismTypes)
        showToast('Tipo de turismo removido.','error')
    }
}
//CRUD Opções de Acessibilidade
const createAcess = (acess) => {
    if (!acess || accessibilityOptions.includes(acess)) {
        showToast('Opção de Acessibilidade inválida ou já existe.', 'error')
        return
    }
    accessibilityOptions.push(acess)
    saveToLocalStorage('accessibilityOptions', accessibilityOptions)
    showToast('Opção de Acessibilidade adicionada!')
}
//const readAcess = () => accessibilityOptions
const updateAcess = (original, updated) => {
    const index = accessibilityOptions.findIndex(a => a === original)
    if (index !== -1) {
        accessibilityOptions[index] = updated
        saveToLocalStorage('accessibilityOptions', accessibilityOptions)
        return true
    }
    return false
}
const deleteAcess = (option) => {
    const index = accessibilityOptions.findIndex(a => a === option)
    if (index !== -1) {
        accessibilityOptions.splice(index, 1)
        saveToLocalStorage('accessibilityOptions', accessibilityOptions)
        showToast('Opção de acessibilidade removida.')
    }
}
// === Interface ===
// Interações Modal 
const openModal = (id) => {
    document.getElementById(id).classList.remove('hidden')
  }
const closeModal = (id,form,header,handler) => {
    modal = document.getElementById(id)
    modal.classList.add('hidden')
    resetModalToAddMode(form ,header,handler)
}
const resetModalToAddMode = (form, header, handler) => {
    document.querySelector(`#modal-adicionar h2`).innerText = header

    const addButton = document.querySelector(`#modal-adicionar button`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>add_circle</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Adicionar</div>
        </div>
    `
    addButton.onclick = handler

    document.getElementById(form).reset()
    idInput = document.getElementById('id')
    if (idInput) idInput.value = ''
}
const editFlight = (id) => {
    const flight = readFlight(f => f.id === id)[0]
    if (!flight) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar voo`

    document.getElementById(`id`).value = flight.id
    // Preencher Campos
    document.getElementById(`name`).value = flight.name
    document.getElementById(`from`).value = flight.from
    document.getElementById(`to`).value = flight.to
    document.getElementById(`company`).value = flight.company
    document.getElementById(`leaves`).value = flight.leaves
    document.getElementById(`direct`).value = flight.direct

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
    const originalFlight = document.getElementById(`id`).value
    const updatedFlight = getFormData('add_flight_form')

    const required = [`name`, `from`, `to`, `leaves`]
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
    closeModal(`modal-adicionar`,'add_flight_form','Adicionar voo manual', createFlight)
    updateTable(flightTableConfig)
}
const editDestination = (id) => {//Modal Edição destinos
    const destination = readDestination(d => d.id == id)[0]
    if (!destination) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar destino`

    document.getElementById(`id`).value = destination.id
    // Preencher Campos
/*  document.getElementById(`destination_country`).value = destination.destination_country
    document.getElementById(`destination_city`).value = destination.destination_city */
    document.getElementById(`destination_aero`).value = destination.destination_aero
    document.getElementById(`destination_type`).value = destination.destination_type
    document.getElementById(`destination_acess`).value = destination.destination_acess

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createDestination()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedDestination

    openModal(`modal-adicionar`)
}
const saveEditedDestination = () => {
    const originalDestination = document.getElementById(`id`).value
    const updatedDestination = getFormData('add_destination_form')

    const required = [`destination_aero`]
    const missing = required.filter(key => !updatedDestination[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateDestination(originalDestination, updatedDestination)
    if (!success) {
        showToast('Erro ao editar destino.', `error`)
        return
    }

    saveToLocalStorage(`destinations`, destinations)
    showToast('Destino editado com sucesso!')
    closeModal(`modal-adicionar`,'add_destination_form','Adicionar destino manual',createDestination)
    updateTable(destinationTableConfig)
}
const editCar = (id) => {//Modal Edição Carros
    const car = readCar(c => c.id == id)[0]
    if (!car) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar carro`

    document.getElementById(`id`).value = car.id
    // Preencher Campos
    document.getElementById(`cars_destinoId`).value = car.cars_destinoId
    document.getElementById(`cars_brand`).value = car.cars_brand
    document.getElementById(`cars_model`).value = car.cars_model
    document.getElementById(`cars_seats`).value = car.cars_seats
    document.getElementById(`cars_price`).value = car.cars_price
    document.getElementById(`cars_available`).value = car.cars_available
    document.getElementById(`cars_adapted`).value = car.cars_adapted

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createCar()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedCar

    openModal(`modal-adicionar`)
}
const saveEditedCar = () => {
    const originalCar = document.getElementById(`id`).value
    const updatedCar = getFormData('add_car_form')

    const required = [`cars_destinoId`, `cars_brand`, `cars_model`, 'cars_seats', 'cars_price', 'cars_available', 'cars_adapted']
    const missing = required.filter(key => !updatedCar[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateCar(originalCar, updatedCar)
    if (!success) {
        showToast('Erro ao editar carro.', `error`)
        return
    }

    saveToLocalStorage(`cars`, cars)
    showToast('Destino editado com sucesso!')
    closeModal(`modal-adicionar`,'add_car_form','Adicionar caroo manual',createCar)
    updateTable(carTableConfig)
}
// Not finished
const editHotel = (id) => {//Modal Edição Hotel
    const hotel = readHotel(h => h.id == id)[0]
    if (!hotel) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar hotel`
    document.getElementById(`id`).value = hotel.id

    // Preencher Campos
    document.getElementById(`destinoId`).value = hotel.destinoId
    document.getElementById(`name`).value = hotel.name
    document.getElementById(`quartos`).value = hotel.quartos

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createHotel()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedHotel

    openModal(`modal-adicionar`)
}
const saveEditedHotel = () => {
    const originalId = document.getElementById(`id`).value
    const updatedHotel = getFormData('add_hotel_form')

    const required = [`destinoId`, `name`, `quartos`]
    const missing = required.filter(key => !updatedHotel[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateHotel(originalId, updatedHotel)
    if (!success) {
        showToast('Erro ao editar hotel.', `error`)
        return
    }

    saveToLocalStorage(`hotels`, hotels)
    showToast('Hotel editado com sucesso!')
    closeModal(`modal-adicionar`,'add_hotel_form','Adicionar hotel manual',createHotel)
    updateTable(hotelTableConfig)
}
const editAero = (id) => {//Modal Edição Aeroportos
    const airport = readAero(a => a.id == id)[0]
    if (!airport) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar aeroporto`

    document.getElementById(`id`).value = airport.id
    // Preencher Campos
    document.getElementById(`aero_code`).value = airport.aero_code
    document.getElementById(`aero_country`).value = airport.aero_country
    document.getElementById(`aero_city`).value = airport.aero_city

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createAero()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedAero

    openModal(`modal-adicionar`)
}
const saveEditedAero = () => {
    const originalId = document.getElementById(`id`).value
    const updatedAero = getFormData('add_airport_form')

    const required = [`aero_code`, `aero_country`, `aero_city`]
    const missing = required.filter(key => !updatedAero[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateAero(originalId, updatedAero)
    if (!success) {
        showToast('Erro ao editar aeroporto.', `error`)
        return
    }

    saveToLocalStorage(`airports`, airports)
    showToast('Aeroporto editado com sucesso!')
    closeModal(`modal-adicionar`,'add_airport_form','Adicionar aeroporto manual',createAero)
    updateTable(airportTableConfig)
}
const editActivitie = (id) => {//Modal Edição de Atividades
    const activity = readActivitie(a => a.id == id)[0]
    if (!activity) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar atividade`

    document.getElementById(`id`).value = activity.id
    // Preencher Campos
    document.getElementById(`act_destinoId`).value = activity.act_destinoId
    document.getElementById(`act_turism`).value = activity.act_turism
    document.getElementById(`act_name`).value = activity.act_name
    document.getElementById(`act_description`).value = activity.act_description
    document.getElementById(`act_acess`).value = activity.act_acess

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createActivitie()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedActivitie

    openModal(`modal-adicionar`)
}
const saveEditedActivitie = () => {
    const originalId = document.getElementById(`id`).value
    const updatedAct = getFormData('add_activitie_form')

    const required = [`act_destinoId`, `act_turism`, `act_name`,'act_description']
    const missing = required.filter(key => !updatedAct[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateActivitie(originalId, updatedAct)
    if (!success) {
        showToast('Erro ao editar atividade.', `error`)
        return
    }

    saveToLocalStorage(`activities`, activities)
    showToast('Atividade editada com sucesso!')
    closeModal(`modal-adicionar`,'add_activitie_form','Adicionar atividade manual',createActivitie)
    updateTable(activitiesTableConfig)
}
const editUser = (username) => {//Modal Edição de Utilizadores
    console.log(username)
    const user = readUser(u => u.username == username)[0]
    if (!user) return

    // Editar Titulo
    document.querySelector(`#modal-adicionar h2`).innerText = `Editar utilizador`

    // Preencher Campos
    document.getElementById(`username`).value = user.username
    document.getElementById(`email`).value = user.email
    document.getElementById(`password`).value = user.password
    document.getElementById(`points`).value = user.points
    document.getElementById(`private`).value = user.private
    document.getElementById(`admin`).value = user.admin

    //Adicionar => Salvar
    const addButton = document.querySelector(`#modal-adicionar button[onclick='createUser()']`)
    addButton.innerHTML = `
        <div class='inline-flex justify-start items-center gap-2.5'>
            <span class='material-symbols-outlined text-white cursor-pointer'>edit_square</span>
            <div class='justify-center text-white text-xl font-bold font-['IBM_Plex_Sans']'>Salvar</div>
        </div>
    `
    addButton.onclick = saveEditedUser

    openModal(`modal-adicionar`)
}
const saveEditedUser = () => {
    const originalUser = document.getElementById(`username`).value
    const updatedUser = getFormData('add_user_form')

    const required = [`username`, `email`, `password`]
    const missing = required.filter(key => !updatedUser[key])
    if (missing.length > 0) {
        showToast('Preencha todos os campos obrigatórios.', `error`)
        return
    }

    const success = updateUser(originalUser, updatedUser)
    if (!success) {
        showToast('Erro ao editar utilizador.', `error`)
        return
    }

    saveToLocalStorage(`users`, users)
    showToast('Utilizador editado com sucesso!')
    closeModal(`modal-adicionar`,'add_user_form','Adicionar utilizador manual',createUser)
    updateTable(userTableConfig)
}
const loadTurismAcess = (category) => { // Add Edit and Delete
    const container = document.getElementById('load-options')
    container.innerHTML=''
    if (category == 'acessibilidade'){
        accessibilityOptions.forEach(element => {
            const div = document.createElement('div')
            const action = document.createElement('div')
            div.className = 'p-4 bg-Background-Card-Bg-Gami flex justify-between items-center rounded mb-2'
            div.textContent = element
            const editBtn = document.createElement('button')
            editBtn.innerHTML = '<span class="material-symbols-outlined text-blue-600">edit</span>'
            editBtn.onclick = () => {
                editTurismAcess(category, element)
            }
            const deleteBtn = document.createElement('button')
            deleteBtn.innerHTML = '<span class="material-symbols-outlined text-red-600">delete</span>'
            deleteBtn.onclick = () => {
                deleteAcess(element)
                loadTurismAcess(category)
            }
            action.appendChild(editBtn)
            action.appendChild(deleteBtn)
            div.appendChild(action)
            container.appendChild(div)            
        })
    } else {
        turismTypes.forEach(element => {
            const div = document.createElement('div')
            const action = document.createElement('div')
            div.className = 'p-4 bg-Background-Card-Bg-Gami text-start'
            div.textContent = element
            const editBtn = document.createElement('button')
            editBtn.innerHTML = '<span class="material-symbols-outlined text-blue-600">edit</span>'
            editBtn.onclick = () => {
                editTurismAcess(category, element)
            }
            const deleteBtn = document.createElement('button')
            deleteBtn.innerHTML = '<span class="material-symbols-outlined text-red-600">delete</span>'
            deleteBtn.onclick = () => {
                deleteTurism(element)
                loadTurismAcess(category)
            }
            action.appendChild(editBtn)
            action.appendChild(deleteBtn)
            div.appendChild(action)
            container.appendChild(div)    
        })
    }
}
const editTurismAcess = (category,oldOption) => {
    const actionsButton = document.getElementById('action')
    const editBtn = document.createElement('button')
    editBtn.className = 'w-40 h-11 px-5 py-2 bg-green-600 rounded-[5px] inline-flex items-center gap-2.5'
    editBtn.innerHTML = `
        <span class="material-symbols-outlined text-white">edit</span>
        <div class="text-white text-xl font-bold font-['IBM_Plex_Sans']">Guardar</div>
    `

    document.getElementById('type').value = oldOption
    //edit
    if (category == 'acessibilidade'){
        editBtn.onclick = () => {
            newOption = document.getElementById('type').value
            updateAcess(oldOption,newOption)
            actionsButton.removeChild(editBtn)
            loadTurismAcess(category)
        }
    }else {
        editBtn.onclick = () => {
            newOption = document.getElementById('type').value
            updateTurism(oldOption,newOption)
            actionsButton.removeChild(editBtn)
            loadTurismAcess(category)
        }
    }
    actionsButton.appendChild(editBtn)
}
// === Tabela === 
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
                btn.onclick = () => handler(row.id ?? row[columns[0].key]) // Medida de seguraça para objetos sem id
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
//Filtrar Tabela
const handleSearch = (inputId, config) => {
    if (!originalTableData.length) {
        originalTableData = [...config.data] // backup dos dados da tabela inicial
    }
    let filtro = document.getElementById(inputId).value

    const filtered = originalTableData.filter(row =>
        config.columns.some(col => {
            const value = row[col.key]
            //Array => String
            const text = Array.isArray(value)
                ? value.join(', ')
                : (value !== undefined && value !== null ? value.toString() : '')

            return text.toLowerCase().includes(filtro)
        })
    )


    config.data = filtro ? filtered : [...originalTableData]
    currentPage = 1
    updateTable(config)
}
// === Constantes de Configuração de Tabelas ===
const flightTableConfig = { //labels não tem função atualmente mas caso haja tempo a função da tabela será melhorada para gerar os header automaticamente com base nos labels
    data: flights,
    columns: [
        { key: `name`, label: `NºVoo`, sortable: true },
        { key: `from`, label: `Origem`, sortable: true },
        { key: `to`, label: `Destino`, sortable: true },
        { key: `company`, label: `Companhia Aeria`, sortable: true },
        { key: `leaves`, label: `Horario de Partida`, sortable: true, type: `date` },
        { key: `direct`, label: `Direto`, sortable: true },
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
        {key:`destinoId`, label:`Localização`, sortable: true},
        {key:`name`, label:`Nome`, sortable: true},
        {key:`quartos`, label:`Quartos`, sortable: true},
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editHotel },
        { icon: `delete`, class: `text-red-600`, handler: deleteHotel }
    ]
}
const airportTableConfig = {
    data: airports,
    columns: [ 
        {key:`aero_code`, label:`Codigo Aeroporto`, sortable: true},
        {key:`aero_country`, label:`Pais`, sortable: true},
        {key:`aero_city`, label:`Cidade`, sortable: true},
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
const userTableConfig = {
    data: users,
    columns:[
        {key:'username', label:'Nome de Utilizador', sortable: true},
        {key:'email', label:'Email', sortable: true},
        {key:'password', label:'Password', sortable: true},
        {key:'points', label:'Pontos', sortable: true},
        {key:'level', label:'Nivel', sortable: true},
        {key:'private', label:'Privacidade', sortable: true},
        {key:'admin', label:'User/Admin', sortable: true},
    ],
    actions: [
        { icon: `edit_square`, class: `text-Main-Primary`, handler: editUser },
        { icon: `delete`, class: `text-red-600`, handler: deleteUser }
    ]
}
// === On Page Load ===
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname
    originalTableData = []

    if (path.includes('flights_admin.html')) {
        loadFromLocalStorage(`flights`, flights)
        loadFromLocalStorage(`airports`, airports)
        updateTable(flightTableConfig)
        selectOptions(airports, 'from')
        selectOptions(airports, 'to')
    } else if (path.includes('places_admin.html')) {
        loadFromLocalStorage(`destinations`, destinations)
        loadFromLocalStorage(`airports`, airports)
        updateTable(destinationTableConfig)
        selectOptions(airports, 'destination_aero')
    } else if (path.includes('users_admin.html')) { 
        loadFromLocalStorage(`users`, users)
        updateTable(userTableConfig)
    } else if (path.includes('airport_admin.html')) {
        loadFromLocalStorage(`airports`, airports)
        updateTable(airportTableConfig)
    } else if (path.includes('cars_admin.html')) {
        loadFromLocalStorage(`cars`, cars)
        updateTable(carTableConfig)
    }else if (path.includes('activitie_admin.html')) {
        loadFromLocalStorage(`activities`, activities)
        updateTable(activitiesTableConfig)
    }else if (path.includes('hotel_admin.html')) {
        loadFromLocalStorage(`hotels`, hotels)
        updateTable(hotelTableConfig)
    }else if (path.includes('dashboard_admin.html')) {
        loadFromLocalStorage(`accessibilityOptions`, accessibilityOptions)
        loadFromLocalStorage(`turismTypes`, turismTypes)
        const element = document.getElementById('category')
        element.addEventListener('change', () => loadTurismAcess(element.value))
        loadTurismAcess(element.value)
    }
})