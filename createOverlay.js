const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const Player = require("./player");


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
    loadImage(__dirname + "/stream_cards/7h.png"),
    loadImage(__dirname + "/stream_cards/2c.png")
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
    context.fillText(`${player.seatNumber}. ${player.name}`, 10, 50);
    context.fillText(`${player.action} ${player.currentBet}`, 25, 100);
    context.fillText(`${player.stackSize}`, 215, 100);
    context.fillText(`${player.position}`, 335, 100);

    return canvas;
}

// card [7c, 2c]
// name
// action amount
// stack size
// position

// Generate multiple instances of the canvas
const testPlayer = new Player()
this.name = "";
this.stackSize = 0.0;
this.seatNumber = "";
this.currentBet = 0.0;
this.position = "";
this.hand = ["", ""]
this.action = ""

testPlayer.name = "Rebuy Rodney"
testPlayer.stackSize = 1000
testPlayer.seatNumber = "1"
testPlayer.currentBet = 10
testPlayer.position = "D"
testPlayer.hand = ["Ah", "Ad"]
testPlayer.action = "b"

const testPlayer2 = new Player()
this.name = "";
this.stackSize = 0.0;
this.seatNumber = "";
this.currentBet = 0.0;
this.position = "";
this.hand = ["", ""]
this.action = ""

testPlayer2.name = "Nikhil G"
testPlayer2.stackSize = 1000
testPlayer2.seatNumber = "2"
testPlayer2.currentBet = 10
testPlayer2.position = "UTG"
testPlayer2.hand = ["Ac", "As"]
testPlayer2.action = "b"

const playerArray = [testPlayer, testPlayer2]

async function generateMasterCanvas(playerArray) { //input array of players & LAST_TO_BET object
  const canvasWidth = 1920
  const canvasHeight = 1080

  const masterCanvas = createCanvas(canvasWidth, canvasHeight);
  const masterContext = masterCanvas.getContext("2d")

  console.log(`test 1`)

  // Create an array to store promises of generated images
  const imagePromises = playerArray.map(player => generateImage(player));
  console.log(imagePromises)
  const canvases = await Promise.all(imagePromises)

  // Place each canvas on the master canvas
  canvases.forEach((canvas, index) => {
    let x = 0;
    if (index > 5) {
      x = 1500
      index -= 6
    }
    const position = {x: x, y: index*150};

    masterContext.drawImage(canvas, position.x, position.y);
  });

  const masterCanvasPath = __dirname + "/masterCanvas.png";

  fs.writeFileSync(masterCanvasPath, masterCanvas.toBuffer());

  console.log("The master canvas PNG file was created.");
}

// generateMasterCanvas(playerArray)

// generateMasterCanvas(playerArray)
module.exports = generateMasterCanvas;
