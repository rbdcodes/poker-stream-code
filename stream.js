const readlineSync = require("readline-sync");
let AT_MENU = true;
let AT_PLAYER = false;

let players = [];
let button = 0;
let playerActions = [];
let board = [];

const Menu = Object.freeze({
  HOME_PAGE: 0,
  PLAYER_EDIT: 1,
  READ_HANDS: 2,
});

let selector = Menu.HOME_PAGE;
// Import the prompt-sync module

welcome();

promptUserForOptions();

while (1) {
  if (selector == Menu.HOME_PAGE) {
    promptUserForOptions();
  } else if (selector == Menu.PLAYER_EDIT) {
    console.log(`player edit reached`);
    break;
  } else if (selector == Menu.READ_HANDS) {
    console.log(`start hand reached`);
    break;
  }
}

function promptUserForOptions() {
  console.log(`Choose actions`);
  console.log();
  console.log(`Option 1: EDIT PLAYERS, Option 2: START HAND`);

  let input = 0;
  while (input != 1 && input != 2) {
    input = readlineSync.question("Enter '1' or '2'\n");
    if (input == 1 || input == 2) {
      selector = input;
    } else {
      console.log("Invalid input. Please enter 1 or 2\n");
      console.log(`Option 1: EDIT PLAYERS, Option 2: START HAND`);
    }
  }
}

function welcome() {
  console.log(`Welcome to the stream overlay Creator!`);
}
