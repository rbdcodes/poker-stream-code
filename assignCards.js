const fs = require("fs");
const readline = require("readline");

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function assignCards(cardMap) {
  return new Promise((resolve, reject) => {
    assignClubs(cardMap)
      .then(() => assignSpades(cardMap))
      .then(() => assignHearts(cardMap))
      .then(() => assignDiamonds(cardMap))
      .then(() => {
        resolve(); 
      })
      .catch(reject); 
  });
}

function assignClubs(cardMap) {
  return new Promise((resolve, reject) => {
    const clubsFile = readline.createInterface({
      input: fs.createReadStream("cardUIDS/clubs.txt"),
      output: process.stdout,
      terminal: false,
    });

    let i = 0;
    clubsFile.on("line", (cardUID) => {
      cardMap.set(cardUID, `${cardValues[i++]}c`)
    });

    clubsFile.on("close", resolve);
    clubsFile.on("error", reject);
  });
}

function assignSpades(cardMap) {
  return new Promise((resolve, reject) => {
    const spadesFile = readline.createInterface({
      input: fs.createReadStream("cardUIDS/spades.txt"),
      output: process.stdout,
      terminal: false,
    });

    let i = 0;
    spadesFile.on("line", (cardUID) => {
      cardMap.set(cardUID, `${cardValues[i++]}s`)
    });

    spadesFile.on("close", resolve);
    spadesFile.on("error", reject);
  });
}

function assignDiamonds(cardMap) {
  return new Promise((resolve, reject) => {
    const diamondsFile = readline.createInterface({
      input: fs.createReadStream("cardUIDS/diamonds.txt"),
      output: process.stdout,
      terminal: false,
    });

    let i = 0;
    diamondsFile.on("line", (cardUID) => {
      cardMap.set(cardUID, `${cardValues[i++]}d`)
    });

    diamondsFile.on("close", resolve);
    diamondsFile.on("error", reject);
  });
}

function assignHearts(cardMap) {
  return new Promise((resolve, reject) => {
    const heartsFile = readline.createInterface({
      input: fs.createReadStream("cardUIDS/hearts.txt"),
      output: process.stdout,
      terminal: false,
    });

    let i = 0;
    heartsFile.on("line", (cardUID) => {
      cardMap.set(cardUID, `${cardValues[i++]}h`)
    });

    heartsFile.on("close", resolve);
    heartsFile.on("error", reject);
  });
}

function printScannedCards() {
  const scannedCards = require("./TEST/hands.json");
  for (card of scannedCards.tags) {
    console.log(cardMap.get(card.nfcTag.uid))
  }
}

module.exports = assignCards;
