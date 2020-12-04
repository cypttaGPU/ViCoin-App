const FRAME_RATE = 30;

// Block Chain constants
const BLOCK_MIN_SIZE_HEIGHT_RATIO = 0.25
const BLOCK_MAX_SIZE = 128;
const BLOCK_SPACING_RATIO = 0.5;

// Variables
let blockSize = () => Math.min(BLOCK_MAX_SIZE, height * BLOCK_MIN_SIZE_HEIGHT_RATIO)
let blockSpacing = (size) => size * BLOCK_SPACING_RATIO
let blockPositionX = (i, size, halfSize, spacing, width) => (width / 2) - ((spacing + size) * i)
let blockShowCount = (size, spacing, width) => Math.floor(width / (size + spacing)) + 1

let blocksOffset = 0;

let blockchain = new VIBlockchain()
let shouldAddBlock = false;
let newBlockAnimation = {animating: false, t: 0, duration: FRAME_RATE * 0.8}

let resize = { t: 0, frames: FRAME_RATE * 0.5 }
let getParent = () => select('#sketch')

// Images
let blockImage;
function preload() {
  blockImage = loadImage('https://cdn4.iconfinder.com/data/icons/gaming-70/130/game-30-512.png')
}

function setup() {
  let parent = getParent()
  let canvas = createCanvas(parent.width, parent.height)
  canvas.parent(parent)

  frameRate(FRAME_RATE)

  setupWallets()
  setupTransactions()
}

function subdraw(f) {
  push()

  f()

  pop()
}

function draw() {
  clear()

  // Resize canvas if needed
  //TODO: use event based system?
  resize.t++;
  if (resize.t == resize.frames) {
    resize.t = 0;
    let parent = getParent()
    resizeCanvas(parent.width, parent.height)
  }

  if (shouldAddBlock) {
    shouldAddBlock = false;
    const newBlock = blockchain.generateNextBlock([])
    blockchain.insertBlock(newBlock)

    newBlockAnimation.animating = true;
    newBlockAnimation.t = 0;

    // const size = blockSize()
    // const max = width * 0.5 - blockSize() * 0.5 - blockSpacing(size)
    // if (blocksOffset > max) blocksOffset = max;
  }

  transactionManager()
  minersManager()

  subdraw(drawBlockChain)
  subdraw(drawWallets)
  subdraw(drawTransactions)
  subdraw(drawMiners)
}

// BLOCKCHAIN

function drawBlockChain() {
  const size = blockSize();
  const halfSize = size * 0.5;
  const spacing = blockSpacing(size)
  const BASE_Y = height * 0.8 - halfSize;

  let newBlockAnimationOffsetX = 0
  let newBlockAnimationOffsetY = -halfSize
  let lerpAmountA = 0
  let lerpAmountB = 0
  if (newBlockAnimation.animating) {
    newBlockAnimation.t += 1;

    if (newBlockAnimation.t <= newBlockAnimation.duration) {
      // Run Animation

      lerpAmountA = newBlockAnimation.t / newBlockAnimation.duration;
      lerpAmountB = Math.min(newBlockAnimation.t / (newBlockAnimation.duration * 0.5), 1);

      newBlockAnimationOffsetX = lerp(size + spacing, 0, lerpAmountA)
      newBlockAnimationOffsetY = lerp(-spacing, 0, lerpAmountB)

    } else {
      // Animation ended
      newBlockAnimation.animating = false;
    }
  }

  translate(width * 0.5 + blocksOffset, 0)

  const lerpA = lerp(0.5, 1, lerpAmountB);
  const lerpB = lerp(1, 0.85, lerpAmountB)
  const lerpC = lerpColor(color(200), color(100), lerpAmountB)

  const count = Math.min(blockShowCount(size, spacing, width), blockchain.length)
  for (let i = 0; i < count; i += 1) {
    // const id = blockchain.length - i - 1;

    let x = -(size + spacing) * i;

    let scaleValue = 1;
    let y = BASE_Y;

    let fillColor = color(255);
    if (newBlockAnimation.animating) {
      x += newBlockAnimationOffsetX

      if (i === 0) {
        scaleValue = lerpA
        fillColor = color(200)
      } else if (i === 1) {
        scaleValue = lerpB
        fillColor = lerpC
      } else {
        scaleValue = 0.85
        fillColor = color(100);
      }

    } else {
      // Not animation
      if (i == 0) {
        fillColor = color(200)

      } else {
        scaleValue = 0.85
        fillColor = color(100)
      }
    }

    // fill(fillColor);
    // noStroke()
    // rectMode(CENTER)
    // rect(x, y, size * scaleValue, size * scaleValue)
    imageMode(CENTER)
    tint(fillColor)
    image(blockImage, x, y, size * scaleValue, size * scaleValue)
  }
}

// WALLETS
const WALLET_INFO = [
  {name: "Me", startingCoins: 100},
  {name: "Alice", startingCoins: 300},
  {name: "Patrick", startingCoins: 120},
  {name: "Sofia", startingCoins: 18},
  {name: "Steve", startingCoins: 12.345},
  {name: "Jack", startingCoins: 1500},
]
const WALLET_COUNT = WALLET_INFO.length;

function setupWallets() {
  for (var i = 0; i < WALLET_COUNT; i += 1) {
    WALLETS.makeWallet(WALLET_INFO[i].startingCoins);
  }
}

function drawWallets() {
  let x = 25
  let y = 40

  fill('white')
  textSize(20)
  text("Wallets", x, y)

  x += 50
  y += 30

  textSize(14)
  for (var i = 0; i < WALLET_COUNT; i += 1) {
    const wallet = WALLETS.get(i);
    const info = WALLET_INFO[i];

    fill(i === 0 ? 'gold' : 'white')

    textAlign('right')
    text(info.name, x, y);
    textAlign('left')
    text(Math.round(wallet.credits * 100) / 100 + ' VI', x + 25, y)

    y += 30
  }
}

// TRANSACTIONS
const TRANSACTIONS_AMOUNT_MIN = 6.0
const TRANSACTION_COOLDOWN = { min: FRAME_RATE * 5, max: FRAME_RATE * 10 }
let transactionCooldown = TRANSACTION_COOLDOWN.min;

function setupTransactions() {

}

function drawTransactions() {
  textAlign('right')
  text(`next transaction in ${Math.floor(transactionCooldown / FRAME_RATE * 10) / 10}`, width - 25, height - 25)

  let x = width - 25
  let y = 40

  fill('white')
  textSize(20)
  textAlign('right')
  text("Transactions", x, y)

  y += 30

  textSize(14)
  if (TRANSACTIONS.length == 0) {
    fill('gray')
    textAlign('right')
    text('No transactions at the moment.', x, y)
  }
  for (var i = 0; i < TRANSACTIONS.length; i += 1) {
    const transaction = TRANSACTIONS.get(i);
    const infoA = WALLET_INFO[transaction._id_src];
    const infoB = WALLET_INFO[transaction._id_dest];

    fill(transaction._id_src === 0 || transaction._id_dest == 0 ? 'gold' : 'white')

    textAlign('right')
    text(`${infoA.name} -> ${infoB.name}: ${transaction._montant} VI`, x, y)

    y += 30
  }
}

function transactionManager() {

  transactionCooldown -= 1;

  // Create new transaction
  if (transactionCooldown <= 0) {
    var indexA = Math.floor(Math.random() * WALLET_COUNT)
    var indexB = Math.floor(Math.random() * (WALLET_COUNT - 1) + 1)

    var numbers = [...Array(WALLET_COUNT).keys()]
    numbers[0] = [numbers[indexA], numbers[indexA] =numbers[0]][0]
    numbers[1] = [numbers[indexB], numbers[indexB] =numbers[1]][0]

    var [walletA, walletB] = numbers
    var amount = WALLETS.get(walletA).credits * 0.1; // 10% of credits
    amount = Math.round(amount * 100) / 100; // round to 2 decimals
    amount = Math.max(TRANSACTIONS_AMOUNT_MIN, amount); // minimum credits per transaction

    TRANSACTIONS.transact(WALLETS.get(walletA), WALLETS.get(walletB), amount)

    transactionCooldown = Math.floor(Math.random() * (TRANSACTION_COOLDOWN.max - TRANSACTION_COOLDOWN.min) + TRANSACTION_COOLDOWN.min)
  }
}

// MINERS
const MINERS = [
  {name: "Miner A", credits: 0.0},
  {name: "Miner B", credits: 0.0},
  {name: "Miner C", credits: 0.0},
  {name: "Miner D", credits: 0.0},
]

const MAX_TRANSACTION_PER_BLOCK = 5
const MINER_COOLDOWN = { min: TRANSACTION_COOLDOWN.min * 2, max: TRANSACTION_COOLDOWN.max * MAX_TRANSACTION_PER_BLOCK }
let minerCooldown = MINER_COOLDOWN.max;

function setupMiners() {

}

function minersManager() {

  minerCooldown -= 1;
  if (minerCooldown <= 0) {

    const transactionCount = Math.min(TRANSACTIONS.length, MAX_TRANSACTION_PER_BLOCK)

    // Mine a block
    for (var i = 0; i < transactionCount; i += 1) {
      let transaction = TRANSACTIONS.execute_first_transaction()
      blockchain.latestBlock.data.push(transaction)
    }

    shouldAddBlock = true
    newBlockAnimation.animating = true;

    // Chose miner to gain the fee.
    var minerIndex = Math.floor(Math.random() * MINERS.length)
    var miner = MINERS[minerIndex]
    miner.credits += transactionCount * 0.01
    console.log(`Block mined by ${miner.name}`)

    minerCooldown = Math.floor(Math.random() * (MINER_COOLDOWN.max - MINER_COOLDOWN.min) + MINER_COOLDOWN.min)
  }
}

function drawMiners() {
  textAlign('right')
  text(`next block mined in ${Math.floor(minerCooldown / FRAME_RATE * 10) / 10}`, width - 25, height - 10)

  let x = width / 2
  let y = 40

  fill('white')
  textSize(20)
  textAlign('center')
  text("Miners", x, y)

  y += 30

  textSize(14)
  for (var i = 0; i < MINERS.length; i += 1) {
    const miner = MINERS[i];
    const credits = Math.round(miner.credits * 100) / 100

    fill(i === 0 ? 'gold' : 'white')

    textAlign('center')
    text(`${miner.name} ${credits} VI`, x, y)

    y += 30
  }
}

// P5 Events

function doubleClicked() {
  shouldAddBlock = true;
}

function mouseDragged({movementX}) {
  const offset = blocksOffset + movementX;

  let min = -(width * 0.25)
  if (offset < min) {
    blocksOffset = min;
    return;
  }

  // let size = blockSize()
  // let max = (blockchain.length - 1) * (size + blockSpacing(size))
  const size = blockSize()
  const max = width * 0.5 - blockSize() * 0.5 - blockSpacing(size)
  if (offset > max) {
    blocksOffset = max
    return
  }

  blocksOffset = offset;
}
