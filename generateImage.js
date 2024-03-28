const { createCanvas, loadImage } = require("canvas");
const readline = require("readline");

const fs = require("fs");

// Create a canvas with specified dimensions
const width = 1920;
const height = 1080;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "transparent";
ctx.fillRect(0, 0, width, height);

// Define the list of image file paths
const imagePaths = [
  "cards/Qh.png",
  "cards/Th.png",
  "cards/Ah.png",
  "cards/Qd.png",
  "cards/9s.png",
  "cards/4d.png",
  "cards/9c.png",
  "overlay_1.png",
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

outputPath = "C:/Users/DarkenedAsian/Videos/av/overlays";
// Function to load and draw images onto the canvas
function drawImages(images, index, fileName) {
  if (index >= images.length) {
    // Output the canvas to a file when all images are drawn
    console.log(`file name is : ${fileName}`);
    const out = fs.createWriteStream(outputPath + `/${fileName}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log("The PNG file was created."));
    return;
  }

  loadImage(__dirname + "/" + images[index])
    .then((image) => {
      // Draw the image onto the canvas
      if (index === 0) {
        ctx.drawImage(image, 45, 864, 126, 175);
      } else if (index === 1) {
        ctx.drawImage(image, 184, 864, 125, 175);
      } else if (index === 2) {
        ctx.drawImage(image, 436, 864, 126, 175);
      } else if (index === 3) {
        ctx.drawImage(image, 575, 864, 126, 175);
      } else if (index === 4) {
        ctx.drawImage(image, 710, 864, 126, 175);
      } else if (index === 5) {
        ctx.drawImage(image, 849, 864, 126, 175);
      } else if (index === 6) {
        ctx.drawImage(image, 987, 864, 126, 175);
      } else {
        // For other images, just draw them at default positions and sizes
        ctx.drawImage(image, 0, 0, 1920, 1080);
      }

      // Draw the next image recursively
      drawImages(images, index + 1, fileName);
    })
    .catch((err) => {
      console.error("Error loading image:", err);
    });
}

function askForCardNames() {
  rl.question("Give me card names: \n", (input) => {
    var cardNames = input.split(" ");
    for (var i = 0; i < cardNames.length; i++) {
      cardNames[i] = `cards/${cardNames[i]}.png`;
    }

    cardNames.push("/overlay_1.png");
    askForFileName(cardNames);
  });
}

function askForFileName(cardNames) {
  rl.question("File Name? \n", (fileName) => {
    drawImages(cardNames, 0, fileName);
    askToContinue();
  });
}

function askToContinue() {
  rl.question("Continue?  Y||N \n", (answer) => {
    if (answer.toUpperCase() === "Y") {
      askForCardNames();
    } else {
      rl.close();
    }
  });
}

askForCardNames();
