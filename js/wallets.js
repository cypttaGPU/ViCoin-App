//export default wallets;
const VERBOSE_WALLET = false

class Wallet {
    constructor(id, solde) {
        this._id = id;
        this._solde = solde;
    }

    get credits() {
        return this._solde;
    }

    hasSufficientCredit(montant){
        return this._solde >= montant;
    }

    addCredit(montant) {
        this._solde += montant;
        if (VERBOSE_WALLET) console.log("Credit added !");
    }

    removeCredit(montant) {
        if(this.hasSufficientCredit(montant)) {
            this._solde -= montant;
            if (VERBOSE_WALLET) console.log("Credit removed !");
            return true;
        } else {
            if (VERBOSE_WALLET) console.error("Insufficient credit !");
            return false;
        }
    }
}

const WALLETS = new class {
    constructor() {
        this._currId = 0;
        this._dictWallet = { };
    }

    get(id) {
        return this._dictWallet[id] || null;
    }

    get amounts() {
        return Object.keys(this._dictWallet).map(k => this._dictWallet[k].credits);
    }

    // transfert_credit(id_src, id_dest, montant) {
    //     if(this._dictWallet[id_src].removeCredit(montant)) {
    //         this._dictWallet[id_dest].addCredit(montant);
    //         console.log("Successful transaction !");
    //     } else {
    //         console.error("Error transaction !");
    //     }
    // }

    makeWallet(solde) {
        let w = new Wallet(this._currId, solde);
        this._dictWallet[this._currId] = w;
        if (VERBOSE_WALLET) console.log("Wallet created !");
        this._currId++;
        return w;
    }
};