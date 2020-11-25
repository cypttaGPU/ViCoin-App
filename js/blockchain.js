/**
 * @file blockchain.js
 * @description The file contains a Bloc class and a VIBlockchain class to simulate a blockchain.
 *
 * @author Jérôme Chételat
 */


/**
 * The class to describe a Block in the blockchain
 */
class Block {
  /**
   * @param {Integer} the id of the block
   * @param {String} the hash of the previous block
   * @param {Integer} the timestamp when the block is created
   * @param {Object} the data to include in the block
   * @param {String} the precalculated hash of the block
   */
  constructor(id, previousHash, timestamp, data, hash) {
    this.id = id;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
  }

  /**
   * Set a new hash value for the given block
   * @param {String} the new hash value to set
   */
  set hash(newHash) {
    this.hash = newHash;
  }

  /**
   * Returns the hash of the given block. For simplicity of the project, the hash will be the lenght of the id + the difficulty
   * @param {Block} the block to mine
   * @param {Integer} the difficulty of the blockchain
   * @return {String} the hash of the given block
   */
  static calculateBlockHash(block, difficulty) {
    let end = "";

    for(let i = 0; i < difficulty; i++)
      end += "0";

    return block.id.toString() + end;
  }
}

/**
 * The blockchain class to handle the whole blockchain
 * @author Jérôme Chételat
 */
class VIBlockchain {

  /**
   * Initialises a new VIBlockchain with a genesis block
   */
  constructor() {
    let genesisBlock = new Block(0, "0", Date.now() / 1000, "Genesis Block", "100");

    this._chain = [genesisBlock];
    this.difficulty = 2;
  }

  /**
   * Creates a new block and adds it to the blockchain
   * @param {Object} The object containing all the transactions to include in the block
   * @returns {Block} The new block to add at the end of the chain.
   */
  generateNextBlock(transactions) {
    let previousBlock = getLatestBlock();
    let nextIndex = previousBlock.id + 1;
    let nextTimestamp = Date.now() / 1000; // Because Date.now() returns a the time in milliseconds
    let block = new Block(nextIndex, previousBlock.hash, nextTimestamp, transactions, ""); 
 
    return block.setHash(Block.calculateBlockHash(block, this.difficulty));
  }
  
  /*
   * Return the last block mined in the blockchain
   * @return {Block} the last block mined
   */
  get latestBlock() {
    return this._chain[this._chain.length - 1];
  }

  /**
   * Insert a new block in the blockchain
   * @param {Block} the block to be inserted in the blockchain
   * @returns {boolean} the block is successfully inserted
   */
  insertBlock(block) {
    if (VIBlockchain.isValidNewBlock(block, this.latestBlock())) {
      this._chain.push(block);
      return true;
    }
    return false;
  }

  /**
   * Returns a given block
   * @param {Integer} the identifier of the block
   * @returns {Block} the block
   */
  get block(id) {
    if (id < 0 || id > this._chain.length - 1)
      return null;
    return this._chain[id];
  }
  
  /**
   * Returns a copy of the blockchain
   * @returns {Array} the current state of the blockchain
   */
  get blockchain() {
    return [...this._chain];
  }

  set difficulty(newDifficulty) {
    return this.difficulty = newDifficulty;
  }

  /**
   * Check the validity of a given block 
   * @param {Block} the block to check the validity 
   * @param {Block} the block preceding the block to valid in the blockchain
   * @returns {boolean} the block is valid or not
   */
  static isValidNewBlock(block, previousBlock) {
    if ( previousBlock + 1 !== newBlock.id) 
      return false;

    // TODO: Check online if this is the correct way to do this
    if (previousBlock.timestamp < block.timestamp)
      return false;
    
    if (previousBlock.hash !== newBlock.previousHash)
      return false;

    if (Block.getBlockHash(block) !== block.hash)
      return false;

    return true;
  }
}
