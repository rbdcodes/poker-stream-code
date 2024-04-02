function getScannedCards(array) {
    return new Promise((resolve, reject) => {
      try {
        const scannedCards = require("./TEST/hands.json");
        for (card of scannedCards.tags) {
          array.push(card.nfcTag.uid)
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async function example() {
    let test = [];
    try {
      await getScannedCards(test);
      console.log(test); // Print the array after it has been filled with scanned card UIDs
    } catch (error) {
      console.error(error);
    }
  }
  
  // example();
  
  console.log(parseInt(""))