const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const Player = require("./player");

const ACTIONS = Object.freeze({
  BET: 'b',
  FOLD: 'f',
  CALL: 'c',
  RAISE: 'r',
  CHECK: 'x',
  ALL_IN: 'a',
  STANDBY: 's'
})

// Function to generate canvas with images and text
async function generateImage(player) {
  
  // Define canvas dimensions
  const canvasWidth = 406;
  const canvasHeight = 119;

  // Define canvas dimensions
  const cardWidth = 150;
  const cardHeight = 70;

  // Create a blank canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext("2d");
  // Load images
  const images = await Promise.all([
    loadImage(__dirname + "/overlay_imgs/background.png"),
    loadImage(__dirname + `/stream_cards/${player.hand[0]}.png`),
    loadImage(__dirname + `/stream_cards/${player.hand[1]}.png`)
  ]);

  images.forEach((image, index) => {
    // Calculate scaling factor to fit image within canvas
    let scale = Math.min(cardWidth / image.width, cardHeight / image.height);
    let x, y;
    if (index === 0) {
      scale = 1;
      x = 0;
      y = 0;
    }

      // Calculate resized dimensions
    const width = image.width * scale;
    const height = image.height * scale;

      // Calculate position to place the first image at the left edge (0, 0)

    if (index === 1) {
      x = 248;
      y = -3; // Center vertically
    } else if (index === 2) {
        // For the second image, place it at the middle of the canvas along the x-axis
      x = 251 + 67; // Center horizontally
      y = -3; // Center vertically
    }

      // Draw the resized image on the canvas
    context.drawImage(image, x, y, width, height);
  });

    // Add text to the canvas
    context.fillStyle = "black";
    context.font = "900 23px Arial";

    let actionText = ""
    let playerBetText = player.currentBet;

    if (player.action == ACTIONS.BET) {
      actionText = "BET"
    } else if (player.action == ACTIONS.CALL) {
      actionText = "CALL"
    } else if (player.action == ACTIONS.RAISE) {
      actionText = "RAISE TO"
    } else if (player.action == ACTIONS.CHECK) {
      actionText = "CHECK"
      playerBetText = ""
    } else if (player.action == ACTIONS.FOLD) {
      actionText = "FOLD"
      playerBetText = ""
    }


    context.fillText(`${player.seatNumber}. ${player.name}`, 10, 50);
    if (player.currentBet > 0 || player.action == ACTIONS.CHECK || player.action == ACTIONS.FOLD) {
      context.fillText(`${actionText} ${playerBetText}`, 25, 100);
    }
    context.fillText(`${player.stackSize}`, 215, 100);
    context.fillText(`${player.position}`, 335, 100);

    return canvas;
}

// card [7c, 2c]
// name
// action amount
// stack size
// position

async function generateMasterCanvas(playerArray, board, pot) { //input array of players & LAST_TO_BET object
  const canvasWidth = 1920
  const canvasHeight = 1080

  const masterCanvas = createCanvas(canvasWidth, canvasHeight);
  const masterContext = masterCanvas.getContext("2d")


  // Create an array to store promises of generated images
  const imagePromises = playerArray.map(player => generateImage(player));
  const canvases = await Promise.all(imagePromises)

  // Place each canvas on the master canvas
  canvases.forEach((canvas, index) => {
    let x = 30;
    if (playerArray[index].isTurn) {
      x += 70;
    }
    if (index > 5) {
      x = 1500
      index -= 6
    }
    const position = {x: x, y: index*150};

    masterContext.drawImage(canvas, position.x, position.y);
  });

  // Load the pot background image
  const potBackgroundImage = await loadImage(__dirname + "/overlay_imgs/pot_background.png");

  masterContext.drawImage(potBackgroundImage, 1333, 950);

  // let board = ["7c","2s","2d","5h","5d"];

  const cardImagePromises = board.map(card => loadImage(__dirname + "/stream_cards/" + card + ".png"));

  try {
    // Wait for all card images to be loaded
    const cardImages = await Promise.all(cardImagePromises);
  
    // Draw the loaded card images onto the master canvas
    cardImages.forEach((cardImage, index) => {
      const xPosition = 1368 + index * 100; // Increment x position by 100 each time
      masterContext.drawImage(cardImage, xPosition, 890, 100, 88);
    });
  } catch (error) {
    console.error("An error occurred while loading card images:", error);
  }

    // Define the text to be written
  const potText = `POT: ${pot}`;

  // Set the font style and color
  masterContext.fillStyle = "black";
  masterContext.font = "900 40px Arial";

  // Write the text on the master canvas
  masterContext.fillText(potText, 1530, 1020);

  const masterCanvasPath = __dirname + "/masterCanvas.png";

  fs.writeFileSync(masterCanvasPath, masterCanvas.toBuffer());

  console.log("The master canvas PNG file was created.");
}

module.exports = generateMasterCanvas;
