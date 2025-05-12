class User {
    username = ''
    email = ''
    password = ''
    points = 0
    level = 0
    private = false
    admin = false
    trips = []
    plans = []
    constructor(username, email, password, points = 50, level = 1,private = true, admin = false, trips = [], plans = []){
        this.username = username
        this.email = email
        this.password = password
        this.points = points
        this.level = level
        this.private = private
        this.admin = admin
        this.trips = trips
        this.plans = plans
    }
    get username(){
        return this.username
    }
    get email(){
        return this.email
    }
    get password(){
        return this.password
    }
    get points(){
        return this.points
    }
    get level(){
        return this.level
    }
    get private(){
        return this.private
    }
    get admin(){
        return this.admin
    }
    get trips(){
        return this.trips
    }
    get plans(){
        return this.plans
    }
    /**
     * @param {string} username
     */
    set username(username){
        if (username.length < 3 || username.length > 18) {
            showToast('Username deve ter entre 3 a 18 carateres.', 'error')
            return
        }
        this.username = username
    }
    /**
     * @param {string} email
     */
    set email(email){
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Email invalido.', 'error')
            return
        }
        this.email = email
    }
    /**
     * @param {string} password
     */
    set password(password){
        if (password.length < 8) {
            showToast('A senha deve ter pelo menos 8 caracteres.', 'error')
            return
        }
        let hasLower = hasUpper = hasNumber = hasSpecial = false
        for (let letter of password) {
            if (/[a-z]/.test(letter)) {
                hasLower = true;
            } else if (/[A-Z]/.test(letter)) {
                hasUpper = true;
            } else if (/[0-9]/.test(letter)) {
                hasNumber = true;
            } else if (/[^a-zA-Z0-9]/.test(letter) && letter !== ' ') {
                hasSpecial = true;
            }
        }
        if(hasLower && hasUpper && hasNumber && hasSpecial){
            this.password = password
        }
        if(!hasLower){
            showToast('A senha deve conter pelo menos uma letra minúscula.', 'error')
        }
        if(!hasUpper){
            showToast('A senha deve conter pelo menos uma letra maiúscula.', 'error')
        }
        if(!hasNumber){
            showToast('A senha deve conter pelo menos um número.', 'error')
        }
        if(!hasSpecial){
            showToast('A senha deve conter pelo menos um caractere especial.', 'error')
        }
    }
    /**
     * @param {number} points
     */
    set points(points){
        if (points < 0) {
            showToast('Pontos não podem ser negativos.', 'error')
            return
        }
        this.points = points
    }
    /**
     * @param {number} level
     */
    set level(level){
        if (level < 1 || level > 5) {
            showToast('Nível invalido.', 'error')
            return
        }
        this.level = level
    }
    /**
     * @param {boolean} private
     */
    set private(private){
        this.private = private
    }
    /**
     * @param {boolean} admin
     */
    set admin(admin){
        this.admin = admin
    }
    /**
     * @param {any} trip
     */
    set trips(trip){
        this.trips = trip
    }
    /**
     * @param {any[]} plans
     */
    set plans(plans){
        this.plans = plans
    }
    changeUsername(username){
        if (username.length < 3 || username.length > 18) {
            showToast('Username deve ter entre 3 a 18 carateres.', 'error')
            return
        }
        this.username = username
    }
    changeEmail(email){
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Email invalido.', 'error')
            return
        }
        this.email = email
    }
    changePassword(password){
        if (password.length < 8) {
            showToast('A senha deve ter pelo menos 8 caracteres.', 'error')
            return
        }
        let hasLower = hasUpper = hasNumber = hasSpecial = false
        for (let letter of password) {
            if (/[a-z]/.test(letter)) {
                hasLower = true;
            } else if (/[A-Z]/.test(letter)) {
                hasUpper = true;
            } else if (/[0-9]/.test(letter)) {
                hasNumber = true;
            } else if (/[^a-zA-Z0-9]/.test(letter) && letter !== ' ') {
                hasSpecial = true;
            }
        }
        if(hasLower && hasUpper && hasNumber && hasSpecial){
            this.password = password
        }
        if(!hasLower){
            showToast('A senha deve conter pelo menos uma letra minúscula.', 'error')
        }
        if(!hasUpper){
            showToast('A senha deve conter pelo menos uma letra maiúscula.', 'error')
        }
        if(!hasNumber){
            showToast('A senha deve conter pelo menos um número.', 'error')
        }
        if(!hasSpecial){
            showToast('A senha deve conter pelo menos um caractere especial.', 'error')
        }
    }
    addPoints(points){
        if (points < 0) {
            showToast('Pontos não podem ser negativos.', 'error')
            return
        }
        this.points += points
    }
    updateLevel() {
        if (this.points >= 5000) this.level = 5;
        else if (this.points >= 3000) this.level = 4;
        else if (this.points >= 1500) this.level = 3;
        else if (this.points >= 250) this.level = 2;
        else this.level = 1;
    }
    addTrip(trip){
        this.trips.push(trip)
    }
    removeTrip(trip){
        this.trips = this.trips.filter(t => t !== trip)
    }
    addPlan(plan){
        this.plans.push(plan)
    }
    removePlan(plan){
        this.plans = this.plans.filter(p => p !== plan)
    }
}