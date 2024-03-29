const readlineSync = require("readline-sync");
let AT_MENU = true;
let AT_PLAYER = false;

let playerNames = [
  "Nikhil",
  "Clayton",
  "Colton",
  "Andres",
  "Rahman",
  "Jacob",
  "Wen Chen",
  "Aaro",
];
let playerActions = [];
let playerStacks = [];
let board = [];
let button = 2;

const Queue = require("./Queue");
const Player = require("./player");
const playerQueue = new Queue();

const Menu = Object.freeze({
  HOME_PAGE: 0,
  ADD_PLAYERS: 1,
  EDIT_PLAYERS: 2,
  EDIT_STACKS: 3,
  START_HANDS: 4,
});

let selector = Menu.HOME_PAGE;

welcome();

while (1) {
  if (selector == Menu.HOME_PAGE) {
    promptUserForOptions();
  } else if (selector == Menu.ADD_PLAYERS) {
    populatePlayerNames();
    selector = Menu.HOME_PAGE;
  } else if (selector == Menu.EDIT_PLAYERS) {
    printPlayers();
    editPlayer();
    selector = Menu.HOME_PAGE;
  } else if (selector == Menu.EDIT_STACKS) {
    populatePlayerStacks();
    printPlayersAndStacks();
    selector = Menu.HOME_PAGE;
  } else if (selector == Menu.START_HANDS) {
    initializePlayerQueue(8);

    let lastToBet = null;
    for (let i = 0; i < 3; i++) {
      //action ends if reach lastToBet
      // if queue size is > 1 then go to next street
      // else everyone folds through start new hand
    }
    selector = Menu.HOME_PAGE;
    //read player hands
    // while action isnt over
    // track player actions
    // update pot
    // deal community cards
  }
}

function initializePlayerQueue(buttonSeat) {
  let UTG = buttonSeat + 2;
  if (UTG >= 8) {
    UTG -= 8;
  }
  let start = UTG;
  for (let i = 0; i < 8; i++) {
    if (start >= 8) {
      start -= 8;
    }
    playerQueue.enqueue(playerNames[start]);
    start++;
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
      .question(`Change ${playerNames[seatNumber - 1]}? \n Y || N? \n`)
      .toLowerCase();
    if (confirm == "y") {
      playerNames[seatNumber - 1] = readlineSync.question("Enter New Name: ");
      console.log("Name Changed!");
      printPlayers();
    }
    break;
  }
}

function populatePlayerStacks() {
  playerStacks = [];
  for (let i = 0; i < 8; i++) {
    let stackSize = parseInt(readlineSync.question(`Seat ${i + 1} Stack: `));
    while (parseInt(stackSize) == "NaN") {
      stackSize = readlineSync.question(
        `Invalid input, please enter number:  `
      );
    }
    playerStacks[i] = stackSize;
  }
}

function populatePlayerNames() {
  playerNames = [];
  for (let i = 0; i < 8; i++) {
    playerNames[i] = readlineSync.question(`Seat ${i + 1} Name: `);
  }

  printPlayers();
}

function promptUserForOptions() {
  console.log(`Choose actions`);
  console.log();
  console.log(`1. ADD PLAYERS 2. EDIT PLAYERS 3. EDIT STACKS 4. START HAND`);
  let input = 0;
  while (input != 1 && input != 2 && input != 3 && input != 4) {
    input = readlineSync.question("Enter '1', '2', '3', '4'\n");
    if (input == 1 || input == 2 || input == 3 || input == 4) {
      selector = input;
    } else {
      console.log("Invalid input. Please enter 1 or 2\n");
    }
  }
}

function welcome() {
  console.log(`Welcome to the stream overlay Creator!`);
}

function printPlayers() {
  console.log(`\n\n\n\nPlayer names \n`);

  for (let i = 0; i < playerNames.length; i++) {
    console.log(`${i + 1}. ${playerNames[i]}`);
  }

  console.log(`\n\n`);
}

function printPlayersAndStacks() {
  console.log(`\n\n\n\nPlayer names \n`);

  for (let i = 0; i < playerNames.length; i++) {
    console.log(`${i + 1}. ${playerNames[i]} ${playerStacks[i]}`);
  }

  console.log(`\n\n`);
}
