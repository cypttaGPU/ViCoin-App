# Transaction part
Voici les étapes pour effectuer une transaction :

1) Tout d'abord, il faut commencer par créer deux "Wallet"s. \
Afin d'y parvenir, utiliser deux fois la méthode "makeWallet" du Singleton "WALLETS": `WALLETS.makeWallet(<solde>)`. \
Cette méthode stoque et retourne également la référence de l'objet créé (pour faciliter son utilisation).

Exemple d'utilisation: `let w1 = WALLETS.makeWallet(1000);`

2) Ensuite, il faut ajouter la transaction sur le pool de transaction. \
Pour y parvenir, il faut utiliser la méthode "transact" du Singleton "TRANSACTIONS": `TRANSACTIONS.transact(<wallet_src>, <wallet_dest>, <montant>)`. \
Cette méthode créera la transaction et l'ajoutera à la pile.

Exemple d'utilisation: `TRANSACTIONS.transact(w1, w2, 100);`

3) Finalement, il faut exécuter la transaction sur le dessus de la pile. \
Il faut simplement exécuter la méthode "execute_first_transaction" du Singleton "TRANSACTIONS": `TRANSACTIONS.execute_first_transaction()`. \
Cette méthode effectuera la transaction (si elle est valide) et la retirera de la pile !

Exemple d'utilisation: `TRANSACTIONS.execute_first_transaction();`
