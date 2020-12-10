const FRAME_RATE = 60;
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

let roundNumber = (n, modifier = 0.01) => Math.round(n / modifier) * modifier
let formatNumber = (n, afterPeriod = 2) => {
  const str = String(n)
  const period = str.indexOf('.')

  if (period < 0) {
    return str + '.00'
  }

  const dist = str.length - period - 1
  if (dist < afterPeriod) {
    return str + '0'.repeat(dist)
  }

  if (dist > afterPeriod) {
    return str.substring(0, period + afterPeriod + 1)
  }

  return str
}

let shouldAddBlock = false;
let resize = { t: 0, frames: FRAME_RATE * 0.5 };
let getParent = () => select('#sketch')



// Images
let blockImage
let fingerprint

function preload() {
  fingerprint = loadImage('assets/fingerprint.png')
  blockImage = loadImage('assets/vicoin-block.png')
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

  transactionManager()
  minersManager()

  subdraw(drawBlockChain)
  subdraw(drawTransactions)
  subdraw(drawMiners)
}

// BLOCKCHAIN
const SIZE = 128
const SIZE_HALF = SIZE / 2
const SIZE_BIG = SIZE * 1.1
const SIZE_BIG_HALF = SIZE_BIG / 2
const SPACING = 64
const OFFSET_MAX = SIZE_HALF + SPACING / 2
const OFFSET_ANIMATION_DURATION = 300
const OFFSET_ANIMATION_SPEED_MIN = 0.2

const FP_SIZE = 24
const FP_SIZE_HALF = 12
const FP2_OFFSET = -32
const FP_LINK_CURVE_MODIFIER = 80

let selectedBlock = 0
let blocksOffset = 0
let showMoreinfo = false
let showBlockInfo = false
let goToBlockButtons = 0
let blockChainButtons
let blockInfo
let randomHash = ''
let blockInvalidated = false;
let blockDataToString = (data) => {
  var str = ""
  data.forEach((tr, i) => {
    if (i > 0) str += '\n'
    str += `sent ${formatNumber(tr._montant)} VI from #${tr._id_src} (${WALLET_INFO[tr._id_src].name}) to #${tr._id_dest} (${WALLET_INFO[tr._id_dest].name})`
  });
  return str
}
let resetBlockInfo = (block) => {
  const {title, pHash, cHash, trs, miner} = blockInfo

  title.innerText = block.id ? `Block #${block.id}` : 'GenesisBlock'

  pHash.innerText = block.previousHash || 'None'

  cHash.innerText = block.hash

  trs.value = blockDataToString(block.data)

  miner.innerText = block.miner >= 0 ? `#${block.miner} (${MINERS[block.miner].name})` : `None`

  blockInvalidated = false
}

function setupBlockChain() {
  // Blockchain info
  let mask = select('#block-info-mask')
  let div = select('#block-info')
  let reset = document.getElementById('block-info-reset')
  let close = document.getElementById('block-info-close')
  let title = document.getElementById('block-info-title')
  let pHash = document.getElementById('block-info-previous-hash')
  let cHash = document.getElementById('block-info-current-hash')
  let trs = document.getElementById('block-info-transactions')
  let miner = document.getElementById('block-info-miner')

  div.size(div.width, height * 0.8 - SIZE_BIG_HALF - SPACING)

  reset.onclick = () => resetBlockInfo(BLOCKCHAIN.getBlock(selectedBlock))

  close.onclick = () => {
    showBlockInfo = false;
    blockInfo.mask.addClass('hidden')
    TIME_SPEED = 1.0
    trs.innerText = '';
  }

  trs.oninput = () => {
    const block = BLOCKCHAIN.getBlock(selectedBlock)
    blockInvalidated = blockDataToString(block.data) !== trs.value
    if (blockInvalidated) randomHash = Block.calculateBlockHash()
  }

  blockInfo = {mask, div, reset, close, title, pHash, cHash, trs, miner}

  // Block chainbuttons
  div = select('#block-buttons')
  const inspect = document.getElementById('inspect-button')
  const first = document.getElementById('first-button')
  const last = document.getElementById('last-button')

  div.position(width / 2 - div.width / 2, height * 0.8 + SIZE_HALF + 16)

  inspect.onclick = () => {
    showBlockInfo = true;
    blockInfo.mask.removeClass('hidden')
    TIME_SPEED = 0.0

    const block = BLOCKCHAIN.getBlock(selectedBlock)
    resetBlockInfo(block)
  }

  first.onclick = () => {
    goToBlockButtons = -1
  }

  last.onclick = () => {
    goToBlockButtons = 1
  }

  blockChainButtons = {div, first, inspect, last}
}

function drawBlockChain() {
  const showCountHalf = Math.floor(blockShowCount(SIZE, SPACING, width) / 2)

  // update blockchain info
  blockInfo.reset.disabled = !blockInvalidated
  blockInfo.close.disabled = blockInvalidated
  blockInfo.cHash.innerText = blockInvalidated ? randomHash : BLOCKCHAIN.getBlock(selectedBlock).hash

  // update blockchain buttons
  blockChainButtons.inspect.disabled = blocksOffset !== 0.0 || showBlockInfo

  blockChainButtons.first.disabled = blockInvalidated
  blockChainButtons.first.style.visibility = selectedBlock <= showCountHalf - 1 ? 'hidden' : 'visible'
  blockChainButtons.first.innerText = `< ${selectedBlock - showCountHalf + 1}`

  blockChainButtons.last.disabled = blockInvalidated
  blockChainButtons.last.style.visibility = BLOCKCHAIN.length - selectedBlock <= showCountHalf ? 'hidden' : 'visible'
  blockChainButtons.last.innerText = `${BLOCKCHAIN.length - selectedBlock - showCountHalf} >`

  if (goToBlockButtons > 0) {
    selectedBlock = BLOCKCHAIN.length - 1
    resetBlockInfo(BLOCKCHAIN.getBlock(selectedBlock))
    goToBlockButtons = 0
  } else if (goToBlockButtons < 0) {
    selectedBlock = 0
    resetBlockInfo(BLOCKCHAIN.getBlock(selectedBlock))
    goToBlockButtons = 0
  }

  // update offset
  if (!mouseDragging) {
    const offsetSpeed = Math.max(OFFSET_ANIMATION_SPEED_MIN, Math.abs(blocksOffset) / OFFSET_ANIMATION_DURATION)
    const offsetMovement = offsetSpeed * deltaTime

    if (Math.abs(blocksOffset) < offsetMovement) {
      blocksOffset = 0
    } else {
      blocksOffset += offsetMovement * (blocksOffset > 0 ? -1 : 1)
    }
  }

  const tx = width / 2
  const ty = height * 0.8
  translate(tx + blocksOffset, ty)

  var minIndex = Math.max(0, selectedBlock - showCountHalf)
  var maxIndex = Math.min(BLOCKCHAIN.length - 1, selectedBlock + showCountHalf)

  var x = -(SIZE + SPACING) * (selectedBlock - minIndex);
  var y = 0;

  var lfp2 = null
  for (var i = minIndex; i <= maxIndex; i += 1) {

    const isSelected = i === selectedBlock
    const size = isSelected ? SIZE_BIG : SIZE
    const sizeHalf = isSelected ? SIZE_BIG / 2 : SIZE_HALF


    imageMode(CENTER)
    showBlockInfo && blockInvalidated && i >= selectedBlock ? tint(192, 57, 43) : tint(46, 204, 113)
    image(blockImage, x, y, size, size)

    noTint()

    const fp1 = {
      x: x - sizeHalf + FP_SIZE_HALF,
      y: y - sizeHalf + FP_SIZE_HALF
    }

    const fp2 = {
      x: x + sizeHalf + FP_SIZE_HALF + FP2_OFFSET,
      y: y + sizeHalf + FP_SIZE_HALF + FP2_OFFSET
    }

    image(fingerprint, fp1.x, fp1.y, FP_SIZE, FP_SIZE)
    image(fingerprint, fp2.x, fp2.y, FP_SIZE, FP_SIZE)

    if (lfp2) {
      // line(lfp2.x, lfp2.y, fp1.x, fp1.y)
      const m = {
        x: lfp2.x + (fp1.x - lfp2.x) / 2,
        y: lfp2.y + (fp1.y - lfp2.y) / 2,
      }
      noFill()
      showBlockInfo && blockInvalidated && i > selectedBlock ? stroke(192, 57, 43) : stroke(46, 204, 113)
      strokeWeight(2)
      bezier(
        lfp2.x + FP_SIZE_HALF, lfp2.y,
        lfp2.x + FP_LINK_CURVE_MODIFIER, lfp2.y,
        fp1.x - FP_LINK_CURVE_MODIFIER, fp1.y,
        fp1.x - FP_SIZE_HALF, fp1.y,
      );
    }


    lfp2 = fp2

    const trCount = BLOCKCHAIN.getBlock(i).data.length
    const minerIndex = BLOCKCHAIN.getBlock(i).miner

    fill(255)
    noStroke()
    textAlign('center')
    text(`${trCount || 'No'} transaction${trCount === 1 ? '' : 's'}`, x - 4, -10)
    if (minerIndex >= 0)
      text(`Mined by ${MINERS[minerIndex].name}`, x - 4, 10)
    else
    text(`Genesis block`, x - 4, 10)

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
let walletGraph;
let wallet_graph_data = [
  {
    x: WALLET_INFO.map(wallet => wallet.startingCoins),
    y: WALLET_INFO.map(wallet => wallet.name),
    xaxis: 'VI amount',
    name: 'Wallets',
    type: 'bar',
    orientation: 'h'
  }
];
let wallet_graph_layout = {
  title: "Wallets",
  width: 330,
  height: 200,
  paper_bgcolor: "#505050",
  plot_bgcolor: "#505050",
  font: {
    color: "#ffffff",
  },
  margin: {
    t: 40,
    l: 50,
    r: 0,
    b: 40,
    pad: 5
  },
  xaxis: {
    // type: 'log',
    autorange: true,
    gridcolor: "#ffffff",
    name : "ViCoin amount",
  },
  yaxis: {
    gridcolor: "#ffffff",
    categoryorder: "total ascending",
  }
};
function setupWallets() {
  for (var i = 0; i < WALLET_COUNT; i += 1) {
    WALLETS.makeWallet(WALLET_INFO[i].startingCoins);
  }
  walletGraph = createDiv();

  // Create a new div to draw the bar graph
  walletGraph.id('wallet_graph');
  walletGraph.position(40, 40);
  Plotly.newPlot('wallet_graph', wallet_graph_data, wallet_graph_layout);
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
  text(`next transaction in ${formatNumber(transactionCooldown / 1000, 1)}`, width - 25, height - 25)

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
    text(`${infoA.name} -> ${infoB.name}: ${formatNumber(transaction._montant)} VI`, x, y)

    y += 30
  }
}

function transactionManager() {

  if (toSend) {
    const {amount, to} = toSend
    if (amount !== NaN && to !== NaN
      && to > 0 && to < WALLET_COUNT
      && amount > 0 && amount <= WALLETS.get(0)._solde) {

      let walletA = WALLETS.get(0)
      let walletB = WALLETS.get(to);
      TRANSACTIONS.transact(walletA, walletB, amount)

      wallet_graph_data[0]['x'][0] -= amount;
      wallet_graph_data[0]['x'][to] += amount;
      Plotly.update(walletGraph.elt, wallet_graph_data, wallet_graph_layout);
    }

    toSend = null
  }

  transactionCooldown -= deltaTime * TIME_SPEED;
  if (transactionCooldown <= 0) {
    walletIdA = Math.floor(Math.random() * (WALLET_COUNT - 1) + 1)
    walletIdB = Math.floor(Math.random() * (WALLET_COUNT - 1) + 1)
    if (walletIdA == walletIdB) walletIdB = 0

    let walletA = WALLETS.get(walletIdA);
    let walletB = WALLETS.get(walletIdB);
    amount = walletA.credits * 0.1; // 10% of credits
    amount = Math.round(amount * 100) / 100; // round to 2 decimals
    amount = Math.max(TRANSACTIONS_AMOUNT_MIN, amount); // minimum credits per transaction

    TRANSACTIONS.transact(walletA, walletB, amount)
    transactionCooldown = Math.floor(Math.random() * (TRANSACTION_COOLDOWN.max - TRANSACTION_COOLDOWN.min) + TRANSACTION_COOLDOWN.min)
    
    wallet_graph_data[0]['x'][walletIdA] -= amount;
    wallet_graph_data[0]['x'][walletIdB] += amount;
    Plotly.update(walletGraph.elt, wallet_graph_data, wallet_graph_layout);
  }
}

// MINERS
const MINERS = [
  {name: "My Miner", credits: 0.0},
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

  div.position(width / 2 - div.width / 2, height / 2 - 50)

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
      const trs = []
      // Mine a block
      for (var i = 0; i < transactionCount; i += 1) {
        let transaction = TRANSACTIONS.execute_first_transaction()
        trs.push(transaction)
      }

      // Chose miner to gain the fee.
      var minerIndex = userMined ? 0 : Math.floor(Math.random() * (MINERS.length - 1) + 1)
      var miner = MINERS[minerIndex]
      miner.credits += transactionCount * 0.01

      // Add block
      const newBlock = BLOCKCHAIN.generateNextBlock(trs, minerIndex)
      BLOCKCHAIN.insertBlock(newBlock)

      if (selectedBlock === BLOCKCHAIN.length - 2) {
        selectedBlock += 1
        resetBlockInfo(BLOCKCHAIN.getBlock(selectedBlock))
        blocksOffset += OFFSET_MAX * 2
      }
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
  text(`next block mined in ${formatNumber(minerCooldown / 1000, 1)}`, width - 25, height - 10)

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
    text(`${miner.name} ${formatNumber(roundNumber(credits))} VI`, x, y)

    y += 30
  }
}

// P5 Events
let mouseStartedOnBockchain = false
let mouseStartPosition;
let mouseDragging = false;

function mousePressed() {
  if (blockInvalidated) return;

  mouseStartPosition = {x: mouseX, y: mouseY}

  const targetY = height * 0.8
  mouseStartedOnBockchain = mouseY >= targetY - SIZE_HALF && mouseY <= targetY + SIZE_HALF
}

function mouseDragged({movementX}) {
  if (blockInvalidated) return;

  if (!mouseDragging && dist(mouseStartPosition.x, mouseStartPosition.y, mouseX, mouseY) > 5) {
    mouseDragging = true
  }

  if (mouseDragging && mouseStartedOnBockchain) {

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
    resetBlockInfo(BLOCKCHAIN.getBlock(selectedBlock))
    blocksOffset = blocksOffset
  }
}

function mouseReleased() {
  if (blockInvalidated) return;

  if (mouseDragging) {
    mouseDragging = false

  } else if (mouseStartedOnBockchain) {
    let offset = mouseX - width / 2 - blocksOffset
    const direction = offset < 0 ? -1 : 1
    offset *= direction
    offset += SIZE_HALF

    const blockSpace = SIZE + SPACING
    const indexOffset = Math.floor(offset / blockSpace) * direction
    const index = selectedBlock + indexOffset
    if (index >= 0 && index < BLOCKCHAIN.length && offset % blockSpace < SIZE) {
      selectedBlock += indexOffset
      resetBlockInfo(BLOCKCHAIN.getBlock(selectedBlock))
      blocksOffset += indexOffset * OFFSET_MAX * 2
    }
  }
}
