const FRAME_RATE = 30;
let TIME_SPEED = 1.0;

// Block Chain constants
const BLOCK_MIN_SIZE_HEIGHT_RATIO = 0.25
const BLOCK_MAX_SIZE = 128;
const BLOCK_SPACING_RATIO = 0.5;

// Variables
// let blockSize = () => Math.min(BLOCK_MAX_SIZE, height * BLOCK_MIN_SIZE_HEIGHT_RATIO)
// let blockSpacing = (size) => size * BLOCK_SPACING_RATIO
// let blockPositionX = (i, size, halfSize, spacing, width) => (width / 2) - ((spacing + size) * i)
let blockShowCount = (size, spacing, width) => Math.floor(width / (size + spacing)) + 2

let shouldAddBlock = false;

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

  setupBlockChain()
  setupWallets()
  setupTransactions()
  setupMiners()
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

  // Add block event
  if (shouldAddBlock) {
    shouldAddBlock = false;
    const newBlock = BLOCKCHAIN.generateNextBlock([])
    BLOCKCHAIN.insertBlock(newBlock)

    if (selectedBlock === BLOCKCHAIN.length - 2) {
      selectedBlock += 1
      blocksOffset += OFFSET_MAX * 2
    }
  }

  transactionManager()
  minersManager()

  subdraw(drawBlockChain)
  subdraw(drawWallets)
  subdraw(drawTransactions)
  subdraw(drawMiners)
}

// BLOCKCHAIN
const SIZE = 128
const SIZE_HALF = SIZE / 2
const SIZE_BIG = SIZE * 1.1
const SPACING = 64
const OFFSET_MAX = SIZE_HALF + SPACING / 2
const OFFSET_ANIMATION_DURATION = 300
const OFFSET_ANIMATION_SPEED_MIN = 0.2

let selectedBlock = 0;
let blocksOffset = 0;
let dragging = false;

function setupBlockChain() {
}

function drawBlockChain() {
  // update offset
  if (!dragging) {
    const offsetSpeed = Math.max(OFFSET_ANIMATION_SPEED_MIN, Math.abs(blocksOffset) / OFFSET_ANIMATION_DURATION)
    const offsetMovement = offsetSpeed * deltaTime * TIME_SPEED

    if (Math.abs(blocksOffset) < offsetMovement) {
      blocksOffset = 0
    } else {
      blocksOffset += offsetMovement * (blocksOffset > 0 ? -1 : 1)
    }
  }

  translate(width / 2 + blocksOffset, height * 0.8)

  const showCountHalf = Math.floor(blockShowCount(SIZE, SPACING, width) / 2)
  var minIndex = Math.max(0, selectedBlock - showCountHalf)
  var maxIndex = Math.min(BLOCKCHAIN.length - 1, selectedBlock + showCountHalf)

  var x = -(SIZE + SPACING) * (selectedBlock - minIndex);
  var y = 0;

  for (var i = minIndex; i <= maxIndex; i += 1) {

    imageMode(CENTER)

    if (i === BLOCKCHAIN.length - 1) {
      noTint()
    } else {
      tint(200)
    }

    let img
    if (i === selectedBlock) {
      img = image(blockImage, x, y, SIZE_BIG, SIZE_BIG)
    } else {
      img = image(blockImage, x, y, SIZE, SIZE)
    }


    x += SIZE + SPACING
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
const TRANSACTION_COOLDOWN = { min: 5000, max: 10000 }
let transactionCooldown = TRANSACTION_COOLDOWN.min;
let transactionForm;
let toSend = null;

function setupTransactions() {
  const div = select('#transaction-form')
  const amount = document.getElementById('transaction-amount');
  const to = document.getElementById('transaction-to');
  const send = document.getElementById('transaction-send');

  div.position(width / 2 - div.width / 2, height / 2 - div.height / 2)

  for (var i = 1; i < WALLET_COUNT; i += 1) {
    const option = document.createElement('OPTION')
    option.label = WALLET_INFO[i].name
    option.value = i
    to.add(option)
  }

  amount.oninput = () => {
    const value = amount.value;
    const period = value.indexOf('.')
    if (period >= 0) {
      amount.value = value.substring(0, period + 3)
    }
  }

  send.onclick = () => {
    toSend = {amount: Number(amount.value), to: Number(to.value)}
  }

  transactionForm = {div, amount, to, send}
}

function drawTransactions() {
  // Update transaction form
  const cannotSend = transactionForm.amount.value <= 0 || transactionForm.amount.value > WALLETS.get(0)._solde
  transactionForm.send.disabled = toSend || cannotSend
  transactionForm.amount.style = cannotSend ? 'border: 1px solid red' : 'border: 1px solid transparent'

  // Show when the next automatic action will be executed
  textAlign('right')
  text(`next transaction in ${Math.floor(transactionCooldown / 1000 * 10) / 10}`, width - 25, height - 25)

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

  if (toSend) {
    const {amount, to} = toSend
    if (amount !== NaN && to !== NaN
      && to > 0 && to < WALLET_COUNT
      && amount > 0 && amount <= WALLETS.get(0)._solde) {

      TRANSACTIONS.transact(WALLETS.get(0), WALLETS.get(to), amount)
    }

    toSend = null
  }

  transactionCooldown -= deltaTime * TIME_SPEED;
  if (transactionCooldown <= 0) {
    walletA = Math.floor(Math.random() * (WALLET_COUNT - 1) + 1)
    walletB = Math.floor(Math.random() * (WALLET_COUNT - 1) + 1)
    if (walletA == walletB) walletB = 0

    amount = WALLETS.get(walletA).credits * 0.1; // 10% of credits
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
const FORCE_MINE_TRANSACTION_COUNT = 15
const MINER_COOLDOWN = { min: TRANSACTION_COOLDOWN.min * 2, max: TRANSACTION_COOLDOWN.max * MAX_TRANSACTION_PER_BLOCK }
let minerCooldown = MINER_COOLDOWN.max;
let userMined = false
let mineForm

function setupMiners() {
  const div = select('#miner-form')
  const send = document.getElementById('miner-send')

  div.position(width / 2 - div.width / 2, 0)

  send.onclick = () => {
    userMined = true
  }

  mineForm = {div, send}
}

function minersManager() {

  if (userMined) {
    minerCooldown = 0
  }

  // force to mine a block if there is too much transactions
  if (TRANSACTIONS.length >= FORCE_MINE_TRANSACTION_COUNT) {
    minerCooldown = 0
  }

  minerCooldown -= deltaTime * TIME_SPEED;
  if (minerCooldown <= 0) {

    if (TRANSACTIONS.length > 0) {
      const transactionCount = Math.min(TRANSACTIONS.length, MAX_TRANSACTION_PER_BLOCK)

      // Mine a block
      for (var i = 0; i < transactionCount; i += 1) {
        let transaction = TRANSACTIONS.execute_first_transaction()
        BLOCKCHAIN.latestBlock.data.push(transaction)
      }

      shouldAddBlock = true

      // Chose miner to gain the fee.
      var minerIndex = Math.floor(Math.random() * (MINERS.length - 1) + 1)
      var miner = MINERS[userMined ? 0 : minerIndex]
      miner.credits += transactionCount * 0.01
    }

    minerCooldown = Math.floor(Math.random() * (MINER_COOLDOWN.max - MINER_COOLDOWN.min) + MINER_COOLDOWN.min)
  }

  if (userMined) {
    userMined = false
  }
}

function drawMiners() {
  // Updat eminer form
  mineForm.send.disabled = TRANSACTIONS.length === 0

  textAlign('right')
  text(`next block mined in ${Math.floor(minerCooldown / 1000 * 10) / 10}`, width - 25, height - 10)

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
let mouseStartedOnBockchain = false

function mousePressed() {
  const targetY = height * 0.8
  mouseStartedOnBockchain = mouseY >= targetY - SIZE_HALF && mouseY <= targetY + SIZE_HALF
}

function mouseDragged({movementX}) {
  if (mouseStartedOnBockchain &&  Math.abs(movementX) > 5) {
    dragging = true

    blocksOffset += movementX;

    while (blocksOffset < -OFFSET_MAX) {
      if (selectedBlock === BLOCKCHAIN.length - 1) {
        blocksOffset = -OFFSET_MAX
        break;
      }

      selectedBlock += 1
      blocksOffset = OFFSET_MAX + (blocksOffset + OFFSET_MAX)
    }

    while (blocksOffset > OFFSET_MAX) {
      if (selectedBlock === 0) {
        blocksOffset = OFFSET_MAX
        break;
      }

      selectedBlock -= 1
      blocksOffset = -OFFSET_MAX + (blocksOffset - OFFSET_MAX)
    }

    selectedBlock = Math.max(0, Math.min(selectedBlock, BLOCKCHAIN.length - 1))
    blocksOffset = blocksOffset
  }
}

function mouseReleased() {
  if (dragging) {
    dragging = false

  } else if (mouseStartedOnBockchain) {
    let offset = mouseX - width / 2
    const direction = offset < 0 ? -1 : 1
    offset *= direction
    offset += SIZE_HALF

    const blockSpace = SIZE + SPACING
    const indexOffset = Math.floor(offset / blockSpace) * direction
    const index = selectedBlock + indexOffset
    if (index >= 0 && index < BLOCKCHAIN.length && offset % blockSpace < SIZE) {
      selectedBlock += indexOffset
      blocksOffset += indexOffset * OFFSET_MAX * 2
    }
  }
}
