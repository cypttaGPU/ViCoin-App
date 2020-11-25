class Transaction {
    constructor(id_src, id_dest, montant) {
        this._id_src = id_src;
        this._id_dest = id_dest;
        this._montant = montant;
    }
}

const TRANSACTIONS = new class {
    constructor() {
        this._transactions_pool = [];
    }

    transact(wallet_src, wallet_dest, montant) {
        if(wallet_src instanceof Wallet && wallet_dest instanceof Wallet) {
            if(wallet_src.hasSufficientCredit(montant)) {
                this._transactions_pool.push(new Transaction(
                    wallet_src._id,
                    wallet_dest._id,
                    montant
                ));
                console.log("Transaction added to the pool !");
            } else {
                console.log("Insufficient credit !");
            }
        } else {
            console.error("Invalid type of Wallet detected !");
        }
    }

    execute_first_transaction() {
        if(this._transactions_pool.length > 0) {
            let transaction = this._transactions_pool.shift();
            if(transaction instanceof Transaction) {
                WALLETS.transfert_credit(transaction._id_src, transaction._id_dest, transaction._montant);
            } else {
                console.log("Invalid type of Transaction detected ! Transaction dropped !");
            }
        }
    }
};
