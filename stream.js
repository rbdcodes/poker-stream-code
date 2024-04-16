const readlineSync = require("readline-sync");

const Queue = require("./Queue");
const Player = require("./player");
const assignCardsToMap = require('./assignCards.js');
const generateMasterCanvas = require("./createOverlay");
const path = require('path');
const fs = require('fs');
const playerQueue = new Queue();

const SMALL_BLIND = 0.50
const BIG_BLIND = 1.0

const POSITIONS = Object.freeze({ //in order of who acts first preflop
  FOUR_HANDED: ["UTG", "D", "SB", "BB"],
  FIVE_HANDED: ["UTG", "CO", "D", "SB", "BB"],
  SIX_HANDED: ["UTG", "HJ", "CO", "D", "SB", "BB"],
  SEVEN_HANDED: ["UTG", "UTG1", "HJ", "CO", "D", "SB", "BB"],
  EIGHT_HANDED: ["UTG", "UTG1", "UTG2", "HJ", "CO", "D", "SB", "BB"]
})

const ACTIONS = Object.freeze({
  BET: 'b',
  FOLD: 'f',
  CALL: 'c',
  RAISE: 'r',
  CHECK: 'x',
  ALL_IN: 'a',
  STANDBY: 's'
})

const Menu = Object.freeze({
  HOME_PAGE: 0,
  ADD_PLAYERS: 1,
  EDIT_PLAYERS: 2,
  EDIT_STACKS: 3,
  VIEW_PLAYERS: 4,
  START_HANDS: 5,
  ADD_CHIPS: 6
});

let players = [];

let board = ["b", "b", "b", "b", "b"];
let button = 2;
const cardMap = new Map();
let selector = Menu.HOME_PAGE;

let LAST_TO_BET = {
  NAME: "",
  AMOUNT: 0.0
}

main()

async function main() {
  await assignCardsToMap(cardMap);
  welcome();

  while (1) {
    if (selector == Menu.HOME_PAGE) {
      promptUserForOptions();
    } else if (selector == Menu.ADD_PLAYERS) {
      populatePlayerNames();
      selector = Menu.HOME_PAGE;
    } else if (
      players.length == 0 &&
      (selector != Menu.HOME_PAGE || selector != Menu.ADD_PLAYERS)
    ) {
      selector = Menu.HOME_PAGE;
      console.log();
      console.log(`No players have been added. Please add players first`);
      readlineSync.question(`Enter any character to continue: `);
      console.log();
    } else if (selector == Menu.EDIT_PLAYERS) {
      selector = Menu.HOME_PAGE;
      printPlayers();
      editPlayer();
    } else if (selector == Menu.EDIT_STACKS) {
      selector = Menu.HOME_PAGE;
      populatePlayerStacks();
      printPlayersAndStacks();
    } else if (selector == Menu.VIEW_PLAYERS) {
      selector = Menu.HOME_PAGE;
  
      console.log(players);
      console.log();
    } else if (selector == Menu.ADD_CHIPS) {
      selector = Menu.HOME_PAGE;
      printPlayersAndStacks();
      editPlayerStacks();

    } else if (selector == Menu.START_HANDS) {
      selector = Menu.HOME_PAGE;
      const buttonStartingPosition = getButton();
      console.log(`printing players`)
      console.log(players)
      console.log(`printing playerqueue`)
      console.log(playerQueue)
      initializeAllValues()
      initializePlayerQueue(buttonStartingPosition);
      await assignCardsToPlayers(buttonStartingPosition)
      await readPlayerActions()
      // read player Actions
    }
  }
}

function initializeAllValues() {
  playerQueue.clear();
  for (player of players) {
    player.currentBet = 0.0;
    player.position = "";
    player.hand = ["", ""]
    player.action = ""
    player.isTurn = false
  }
}

async function readPlayerActions() {
  let handIsOver = false;
  let pot = SMALL_BLIND + BIG_BLIND
  for (let i = 0; i < 4 && playerQueue.size() > 1; i++) {

    if (i == 0) {
      board = ["b", "b", "b", "b", "b"]
    }
    if (i > 0) {
      setBoard(i);
      adjustPlayerQueueOrder()
      resetPlayerCurrentBetAndAction()
      LAST_TO_BET.NAME = ""
      LAST_TO_BET.AMOUNT = 0.0
    }

    console.log(board)

    const playersForMasterCanvas = getPlayersForMasterCanvas()


    // console.log(playerQueue.items)
    //print remaining players

    let actionIsClosed = false;
    let playerToAct = {}
    while (playerQueue.size() > 1 && !actionIsClosed) {
        playerToAct = playerQueue.peek();
        playerToAct.isTurn = true;
        //generate players

        //figure out which players to send
        await generateMasterCanvas(playersForMasterCanvas,board,pot)
        playerToAct = playerQueue.dequeue()


        const input = readlineSync.question(`\n${playerToAct.position}|Seat ${playerToAct.seatNumber}: 'f', 'x', 'b', 'c', 'r', 'a':  `);
        const action = input.charAt(0);
        if (action == ACTIONS.BET) {
          console.log("bet")
          const betAmount = getBetAmount(playerToAct);
          playerToAct.stackSize = playerToAct.stackSize - (betAmount - playerToAct.currentBet);
          playerToAct.action = ACTIONS.BET
          pot += (betAmount - playerToAct.currentBet)

          playerToAct.currentBet = betAmount


          LAST_TO_BET.NAME = playerToAct.name;
          LAST_TO_BET.AMOUNT = betAmount;
          playerQueue.enqueue(playerToAct);
        } else if (action == ACTIONS.RAISE) {
          console.log("Raise")

          const betAmount = getBetAmount(playerToAct);
          pot += (betAmount - playerToAct.currentBet)
          playerToAct.stackSize = playerToAct.stackSize -  (betAmount - playerToAct.currentBet);
          playerToAct.action = ACTIONS.RAISE
          playerToAct.currentBet = betAmount


          LAST_TO_BET.NAME = playerToAct.name;
          LAST_TO_BET.AMOUNT = betAmount;
          playerQueue.enqueue(playerToAct);
        } else if (action == ACTIONS.CALL) {
          console.log("Call")
          const amountCalled = Math.min((LAST_TO_BET.AMOUNT - playerToAct.currentBet), playerToAct.stackSize)
          playerToAct.currentBet = Math.min(LAST_TO_BET.AMOUNT, playerToAct.stackSize + playerToAct.currentBet)
          playerToAct.stackSize = playerToAct.stackSize - amountCalled;
          pot += amountCalled
          playerToAct.action = ACTIONS.CALL

          playerQueue.enqueue(playerToAct)
        } else if (action == ACTIONS.CHECK) {
          console.log("Check")
          playerToAct.action = ACTIONS.CHECK
          playerQueue.enqueue(playerToAct)

          if (playerToAct.name == LAST_TO_BET.NAME || playerQueue.peek().action == ACTIONS.CHECK) {
            console.log("Check closes action")
            actionIsClosed = true;
          }
        } else if (action == ACTIONS.FOLD) {
          console.log("Fold")

          playerToAct.action = ACTIONS.FOLD
        } else if (action == ACTIONS.ALL_IN) {
          const betAmount = playerToAct.stackSize
          pot += (betAmount - playerToAct.currentBet)
          playerToAct.stackSize = playerToAct.stackSize -  (betAmount - playerToAct.currentBet);
          playerToAct.action = ACTIONS.RAISE
          playerToAct.currentBet = betAmount + playerToAct.currentBet


          LAST_TO_BET.NAME = playerToAct.name;
          LAST_TO_BET.AMOUNT = betAmount;
        } else {
          console.log(`Incorrect input, please retry`)
          playerToAct.isTurn = false;
          continue;
        }

        playerToAct.isTurn = false;

        playerToAct = playerQueue.peek()
        if (playerToAct.name == LAST_TO_BET.NAME && LAST_TO_BET.AMOUNT != BIG_BLIND) {
          actionIsClosed = true;
          await generateMasterCanvas(playersForMasterCanvas,board,pot)
        }

        //set flag playerToact.isTurn = false
    }

    console.log(`Pot is: ${pot}`)
  } 

  // awrd pot to winner
  awardPotToWinner(pot)
  console.log(players)
}

function getPlayersForMasterCanvas() {
  //if action is standby or not fold / empty
  let playerArray = []
  for (let i = 0; i < playerQueue.size(); i++) {
      const player = playerQueue.dequeue();
      playerArray.push(player);
      playerQueue.enqueue(player)
  }

  return playerArray;
}

function awardPotToWinner(pot) {
  if (playerQueue.size() == 1) {
    playerQueue.peek().stackSize += pot
    return;
  } 

  const remainingPlayers = []
  const setOfRemainingSeats = new Set()
  while (!playerQueue.isEmpty()) {
    const player = playerQueue.dequeue()
    remainingPlayers.push(player)
    setOfRemainingSeats.add(player.seatNumber)
  }


  console.log(remainingPlayers)

  let seatNumberThatWon = parseInt(readlineSync.question(`Which Seat won? `))
  while (!setOfRemainingSeats.has(seatNumberThatWon)) {
    console.log(remainingPlayers)
    seatNumberThatWon = parseInt(readlineSync.question(`Invalid Input, please choose seat from remaining players: `))
  }

  players[seatNumberThatWon-1].stackSize += pot;
}

function setBoard(street) {
  if (street === 1) {
    for (let i = 0; i < 3; i++) {
      let isValid = false;
      while (!isValid) {
        const card = readlineSync.question(`Enter card ${i + 1}: `);
        if (isValidCard(card)) {
          board[i] = card;
          isValid = true;
        } else {
          console.log(`${card} is not a valid card.`);
        }
      }
    }
  } else if (street === 2 || street === 3) {
    let isValid = false;
      while (!isValid) {
        const card = readlineSync.question(`Enter card ${street + 2}: `);
        if (isValidCard(card)) {
          board[street+1] = card;
          isValid = true;
        } else {
          console.log(`${card} is not a valid card.`);
        }
   }
  }
}

function isValidCard(card) {
  const cardPath = path.join(__dirname, 'stream_cards', `${card}.png`);
  return fs.existsSync(cardPath);
}

function resetPlayerCurrentBetAndAction() {
  let player = {}
  for (let i = 0; i < playerQueue.size(); i++) {
    player = playerQueue.dequeue()
    player.currentBet = 0.0
    player.action = ACTIONS.STANDBY
    playerQueue.enqueue(player)
  }
}

function adjustPlayerQueueOrder() {
  playerQueue.clear();
  let start = 0;
  for (let i = 0; i < players.length; i++) {
    if (players[i].position == "SB") {
      start = i;
      break;
    }
  }

  for (let i = 0; i < players.length; i++) {
    if (start == players.length) {
      start -= players.length
    }

    if (players[start].action != ACTIONS.FOLD) {
      playerQueue.enqueue(players[start])
    }

    start++
  }
}

function getBetAmount(playerToAct) {
  let betAmount = readlineSync.question(`Bet amount: `)
  while (isNaN(parseInt(betAmount))) {
    betAmount = readlineSync.question(`Invalid input, try again: `)
  }

  while (betAmount > playerToAct.stackSize) {
    betAmount = readlineSync.question(`Invalid input bet > stack size, try again: `)
    while (isNaN(parseInt(betAmount))) {
      betAmount = readlineSync.question(`Invalid input, try again: `)
    }
  }

  return parseInt(betAmount);
}

async function assignCardsToPlayers(buttonSeat) {
  console.log("\nScanning for cards...")
  readlineSync.question(`Press any letter when ready: `)
  let cardArray = []
  try {
    await getScannedCards(cardArray);
  } catch (error) {
    console.error(error);
  }

  let playerIndex = buttonSeat //this is really the SB but players Array is 0 indexed

  let cardIndex = 0;
  for (let i = 0; i < cardArray.length; i++) {
    if (playerIndex >= players.length) {
      playerIndex -= players.length;
    }
    if (i == (cardArray.length / 2)) { cardIndex = 1;}
    const currentPlayer = players[playerIndex++]
    currentPlayer.hand[cardIndex] = cardArray[i];
  }

  sortPlayerHoleCards();
}

function sortPlayerHoleCards() {
  for (player of players) {
    let hand1 = player.hand[0].charAt(0);
    let hand2 = player.hand[1].charAt(0);
    let hand1Value = 0;
    let hand2Value = 0;

    if (hand1 == 'A') {
      hand1Value = 14;
    } else if (hand1 == 'K') {
      hand1Value = 13;
    } else if (hand1 == 'Q') {
      hand1Value = 12;
    } else if (hand1 == 'J') {
      hand1Value = 11;
    } else if (hand1 == 'T') {
      hand1Value = 10;
    } else {
      hand1Value = parseInt(hand1);
    }

    if (hand2 == 'A') {
      hand2Value = 14;
    } else if (hand2 == 'K') {
      hand2Value = 13;
    } else if (hand2 == 'Q') {
      hand2Value = 12;
    } else if (hand2 == 'J') {
      hand2Value = 11;
    } else if (hand2 == 'T') {
      hand2Value = 10;
    }else {
      hand2Value = parseInt(hand2);
    }

    if (hand2Value > hand1Value) {
      const tmp = player.hand[0];
      player.hand[0] = player.hand[1];
      player.hand[1] = tmp;
    }
  }
}

function getScannedCards(array) {
  return new Promise((resolve, reject) => {
    try {
      const scannedCards = JSON.parse(fs.readFileSync("./TEST/hands.json", 'utf8'));
      for (card of scannedCards.tags) {
        array.push(cardMap.get(card.nfcTag.uid))
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


function printScannedCards() {
  return new Promise((resolve, reject) => {
    try {
      const scannedCards = require("./TEST/hands.json");
      for (card of scannedCards.tags) {
        console.log(cardMap.get(card.nfcTag.uid))
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


function getButton() {
  let buttonSeat = parseInt(
    readlineSync.question(
      `\nWhat seat is button at? Enter 1-${players.length}: `
    )
  );

  while (isNaN(buttonSeat) || buttonSeat < 1 || buttonSeat > players.length) {
    buttonSeat = parseInt(
      readlineSync.question(
        `Invalid Input, please enter number from 1-${players.length}: `
      )
    );
  }

  return buttonSeat;
}

function initializePlayerQueue(buttonSeat) {
  let UTG = buttonSeat + 2;
  const numberOfPlayers = players.length;
  if (UTG >= numberOfPlayers) {
    UTG -= numberOfPlayers;
  }
  let start = UTG;
  const positionArray = getPlayerPositions(numberOfPlayers)
  for (let i = 0; i < numberOfPlayers; i++) {
    if (start >= numberOfPlayers) {
      start -= numberOfPlayers;
    }

    let currentPlayer = players[start];
    currentPlayer.action = ""
    currentPlayer.position = positionArray[i];
    if (currentPlayer.position == "SB") {
      currentPlayer.currentBet = SMALL_BLIND
      currentPlayer.stackSize -= SMALL_BLIND
    } else if (currentPlayer.position == "BB") {
      currentPlayer.currentBet = BIG_BLIND
      currentPlayer.stackSize -= BIG_BLIND
      LAST_TO_BET.NAME = currentPlayer.name
      LAST_TO_BET.AMOUNT = currentPlayer.currentBet
    }
    playerQueue.enqueue(currentPlayer);
    start++;
  }
}

function getPlayerPositions(numberOfPlayers) {
  if (numberOfPlayers == 4) {
    return POSITIONS.FOUR_HANDED;
  } else if (numberOfPlayers == 5) {
    return POSITIONS.FIVE_HANDED;
  } else if (numberOfPlayers == 6) { 
    return POSITIONS.SIX_HANDED;
  } else if (numberOfPlayers == 7) {
    return POSITIONS.SEVEN_HANDED;
  } else if (numberOfPlayers == 8) {
    return POSITIONS.EIGHT_HANDED;
  }
}

function editPlayer() {
  while (1) {
    seatNumber = readlineSync.question("Enter seat number to edit: ");
    if (seatNumber < 1 || seatNumber > 8) {
      console.log(`Invalid seat number:`);
      continue;
    }

    console.log();
    const confirm = readlineSync
      .question(`Change ${players[seatNumber - 1].name}? \n Y || N? \n`)
      .toLowerCase();
    if (confirm == "y") {
      players[seatNumber - 1].name = readlineSync.question("Enter New Name: ");
      console.log("Name Changed!");
      printPlayers();
    }
    break;
  }
}

function editPlayerStacks() {
  while (1) {
    seatNumber = readlineSync.question("Enter seat number to edit: ");
    if (seatNumber < 1 || seatNumber > 8) {
      console.log(`Invalid seat number:`);
      continue;
    }

    console.log();
    const confirm = readlineSync
      .question(`Change ${players[seatNumber - 1].name} stack of ${players[seatNumber-1].stackSize}? \n Y || N? \n`)
      .toLowerCase();
    if (confirm == "y") {

      let newStack = parseInt(readlineSync.question("Enter New Stack Size: "))
      while (isNaN(newStack)) {
        newStack = parseInt(readlineSync.question(`Invalid input, please put number of new stack: `))
      }



      players[seatNumber - 1].stackSize = newStack
      console.log("Stack Changed!");
      printPlayersAndStacks();
    }
    break;
  }
}

function populatePlayerStacks() {
  for (let i = 0; i < players.length; i++) {
    let stackSize = parseInt(readlineSync.question(`Seat ${i + 1}. ${players[i].name} Stack: `));
    while (isNaN(stackSize)) {
      stackSize = readlineSync.question(
        `Invalid input, please enter number:  `
      );
    }
    players[i].stackSize = stackSize;
  }
}

function populatePlayerNames() {
  let numberOfPlayers = parseInt(
    readlineSync.question(`Input number of players between 4-8: `)
  );
  while (
    isNaN(numberOfPlayers) ||
    numberOfPlayers > 8 ||
    numberOfPlayers < 4
  ) {
    numberOfPlayers = parseInt(
      readlineSync.question(`Invalid input, please enter number between 4-8: `)
    );
  }

  players = Array.from({ length: numberOfPlayers }, () => new Player());
  // for (let i = 0; i < numberOfPlayers; i++) {
  //   players[i].name = readlineSync.question(`Seat ${i + 1} Name: `);
  //   players[i].seatNumber = i+1;
  // }

  for (let i = 0; i < numberOfPlayers; i++) {
    players[i].name = `Player ${i+1}`
    players[i].seatNumber = i+1
    players[i].stackSize = 100
  }

  printPlayers();
}

function promptUserForOptions() {
  console.log(`Choose actions`);
  console.log();
  console.log(
    `1. ADD PLAYERS 2. EDIT PLAYERS\n3. EDIT STACKS 4. VIEW PLAYERS \n5. START HAND 6. ADD CHIPS`
  );
  let input = 0;
  while (input != 1 && input != 2 && input != 3 && input != 4 && input != 5 && input != 6) {
    input = readlineSync.question("Enter 1-6: ");
    if (input == 1 || input == 2 || input == 3 || input == 4 || input == 5 || input == 6)  {
      selector = input;
    } else {
      console.log("Invalid input. Please enter 1 - 6\n");
    }
  }
}

function welcome() {
  console.log(`Welcome to the stream overlay Creator!`);
}

function printPlayers() {
  for (let i = 0; i < players.length; i++) {
    if (i == 0) {
      console.log(`\n\nPlayer names \n`);
    }
    console.log(`${i + 1}. ${players[i].name}`);
  }

  console.log(`\n\n`);
}

function printPlayersAndStacks() {
  for (let i = 0; i < players.length; i++) {
    if (i == 0) {
      console.log(`\n\n\n\nPlayer names \n`);
    }
    console.log(`${i + 1}. ${players[i].name} ${players[i].stackSize}`);
  }

  console.log(`\n\n`);
}