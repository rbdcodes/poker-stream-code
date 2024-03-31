const fs = require("fs");
const readline = require("readline");

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const cardMap = new Map();

// Call the functions in sequence
assignClubs(() => {
  assignSpades(() => {
    assignHearts(() => {
      assignDiamonds(() => {
        // All functions have finished
        printScannedCards();
        
      });
    });
  });
});

function printScannedCards() {
  const scannedCards = require("./TEST/hands.json");
  for (card of scannedCards.tags) {
    console.log(cardMap.get(card.nfcTag.uid))
  }
}
function assignClubs(callback) {
  const clubsFile = readline.createInterface({
    input: fs.createReadStream("cardUIDS/clubs.txt"),
    output: process.stdout,
    terminal: false,
  });

  let i = 0;
  clubsFile.on("line", (cardUID) => {
    cardMap.set(cardUID, `${cardValues[i++]}c`)
  });

  clubsFile.on("close", callback);
}

function assignSpades(callback) {
  const spadesFile = readline.createInterface({
    input: fs.createReadStream("cardUIDS/spades.txt"),
    output: process.stdout,
    terminal: false,
  });

  let i = 0;
  spadesFile.on("line", (cardUID) => {
    cardMap.set(cardUID, `${cardValues[i++]}s`)
  });

  spadesFile.on("close", callback);
}

function assignDiamonds(callback) {
  const diamondsFile = readline.createInterface({
    input: fs.createReadStream("cardUIDS/diamonds.txt"),
    output: process.stdout,
    terminal: false,
  });

  let i = 0;
  diamondsFile.on("line", (cardUID) => {
    cardMap.set(cardUID, `${cardValues[i++]}d`)
  });

  diamondsFile.on("close", callback);
}

function assignHearts(callback) {
  const heartsFile = readline.createInterface({
    input: fs.createReadStream("cardUIDS/hearts.txt"),
    output: process.stdout,
    terminal: false,
  });

  let i = 0;
  heartsFile.on("line", (cardUID) => {
    cardMap.set(cardUID, `${cardValues[i++]}h`)
  });

  heartsFile.on("close", callback);
}
