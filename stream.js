const readlineSync = require("readline-sync");

const Queue = require("./Queue");
const Player = require("./player");
const assignCardsToMap = require('./assignCards.js');
const playerQueue = new Queue();

const SMALL_BLIND = 0.50
const BIG_BLIND = 1.0

const POSITIONS = { //in order of who acts first preflop
  FOUR_HANDED: ["UTG", "D", "SB", "BB"],
  FIVE_HANDED: ["UTG", "CO", "D", "SB", "BB"],
  SIX_HANDED: ["UTG", "HJ", "CO", "D", "SB", "BB"],
  SEVEN_HANDED: ["UTG", "UTG1", "HJ", "CO", "D", "SB,", "BB"],
  EIGHT_HANDED: ["UTG", "UTG1", "UTG2", "HJ", "CO", "D", "SB,", "BB"]
}

const Menu = Object.freeze({
  HOME_PAGE: 0,
  ADD_PLAYERS: 1,
  EDIT_PLAYERS: 2,
  EDIT_STACKS: 3,
  VIEW_PLAYERS: 4,
  START_HANDS: 5,
});

let players = [];

let board = [];
let button = 2;
const cardMap = new Map();
let selector = Menu.HOME_PAGE;

let LAST_TO_BET = {
  NAME: "",
  AMOUNT: 0
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
    } else if (selector == Menu.START_HANDS) {
      selector = Menu.HOME_PAGE;
      const buttonStartingPosition = getButton();
      initializePlayerQueue(buttonStartingPosition);
      //assignCardsToPlayers()      
    }
  }
}

function assignCardsToPlayers() {
  
}

function getButton() {
  let buttonSeat = parseInt(
    readlineSync.question(
      `\nWhat seat is button at? Enter 1-${players.length}: `
    )
  );

  while (buttonSeat == "NaN" || buttonSeat < 1 || buttonSeat > players.length) {
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
    currentPlayer.position = positionArray[i];
    if (currentPlayer.position == "SB") {
      currentPlayer.currentBet = SMALL_BLIND
    } else if (currentPlayer.position == "BB") {
      currentPlayer.currentBet = BIG_BLIND
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

function populatePlayerStacks() {
  for (let i = 0; i < players.length; i++) {
    let stackSize = parseInt(readlineSync.question(`Seat ${i + 1} Stack: `));
    while (stackSize == "NaN") {
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
    numberOfPlayers == "NaN" ||
    numberOfPlayers > 8 ||
    numberOfPlayers < 4
  ) {
    numberOfPlayers = parseInt(
      readlineSync.question(`Invalid input, please enter number between 4-8: `)
    );
  }

  players = Array.from({ length: numberOfPlayers }, () => new Player());
  for (let i = 0; i < numberOfPlayers; i++) {
    players[i].name = readlineSync.question(`Seat ${i + 1} Name: `);
  }

  printPlayers();
}

function promptUserForOptions() {
  console.log(`Choose actions`);
  console.log();
  console.log(
    `1. ADD PLAYERS 2. EDIT PLAYERS\n3. EDIT STACKS 4. VIEW PLAYERS \n5. START HAND`
  );
  let input = 0;
  while (input != 1 && input != 2 && input != 3 && input != 4 && input != 5) {
    input = readlineSync.question("Enter 1-5: ");
    if (input == 1 || input == 2 || input == 3 || input == 4 || input == 5) {
      selector = input;
    } else {
      console.log("Invalid input. Please enter 1 - 5\n");
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