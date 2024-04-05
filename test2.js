const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function isValidCard(card) {
  const cardPath = path.join(__dirname, 'stream_cards', `${card}.png`);
  return fs.existsSync(cardPath);
}

rl.question('Enter a card: ', (card) => {
  if (isValidCard(card)) {
    console.log(`${card} is a valid card.`);
  } else {
    console.log(`${card} is not a valid card.`);
  }
  rl.close();
});