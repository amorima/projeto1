export default class Flight {
    company = ''
    number = ''
    from = ''
    to = ''
    price = 0
    direct = false
    leaves = ''
    arrives = ''
    constructor(company, number, from, to, price, direct, leaves, arrives) {
        this.company = company;
        this.number = number;
        this.from = from;
        this.to = to;
        this.price = price;
        this.direct = direct;
        this.leaves = leaves;
        this.arrives = arrives;
    }
    get company() {
        return this.company;
    }
    get number() {
        return this.number;
    }
    get from() {
        return this.from;
    }
    get to() {
        return this.to;
    }
    get price() {
        return this.price;
    }
    get direct() {
        return this.direct;
    }
    get leaves() {
        return this.leaves;
    }
    get arrives() {
        return this.arrives;
    }
    set company(company) {
        this.company = company;
    }
    set number(number) {
        this.number = number;
    }
    set from(from) {
        this.from = from;
    }
    set to(to) {
        this.to = to;
    }
    set price(price) {
        this.price = price;
    }
    set direct(direct) {
        this.direct = direct;
    }
    set leaves(leaves) {
        this.leaves = leaves;
    }
    set arrives(arrives) {
        this.arrives = arrives;
    }
}