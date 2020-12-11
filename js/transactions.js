const VERBOSE_TRANSACTION = false

class Transaction {
    constructor(id_src, id_dest, montant) {
        this._id_src = id_src;
        this._id_dest = id_dest;
        this._montant = montant;
        this._timestamp = Date.now()
    }
}

const TRANSACTIONS = new class {
    constructor() {
        this._transactions_pool = [];
    }

    get(i) {
        return this._transactions_pool[i] || null;
    }

    get length() {
        return this._transactions_pool.length
    }

    transact(wallet_src, wallet_dest, montant) {
        if(wallet_src instanceof Wallet && wallet_dest instanceof Wallet) {
            if(wallet_src.hasSufficientCredit(montant)) {
                wallet_src.removeCredit(montant);
                this._transactions_pool.push(new Transaction(
                    wallet_src._id,
                    wallet_dest._id,
                    montant
                ));
                if (VERBOSE_TRANSACTION) console.log("Transaction added to the pool !");
            } else {
                if (VERBOSE_TRANSACTION) console.log("Insufficient credit !");
            }
        } else {
            if (VERBOSE_TRANSACTION) console.error("Invalid type of Wallet detected !");
        }
    }

    execute_first_transaction() {
        if(this._transactions_pool.length > 0) {
            let transaction = this._transactions_pool.shift();
            if(transaction instanceof Transaction) {
                WALLETS.get(transaction._id_dest).addCredit(transaction._montant);
                if (VERBOSE_TRANSACTION) console.log("Transaction successful !");
                return transaction;
            } else {
                if (VERBOSE_TRANSACTION) console.log("Invalid type of Transaction detected ! Transaction dropped !");
            }
        }
    }
};
