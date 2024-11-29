Sorry lol, this repo is a mess... I made it as a prototype in college.

Architecture of project:

RFID cards are scanned by NFC scanner and exported as a JSON in TEST/hands.json

Each RFID cards has a unique identifier (UID), which has been prior identified in /cardUIDS

Before each card is dealt to players, it is scanned and stored in a buffer which is flushed into hands.json.

Afterwards, stream.js is ran.

stream.js is a shell that constructs the state of poker game. 

It takes input from users (bet, check, raise, fold) and dynamically creates masterCanvas.png after each input. Starting from preflop until the hand ends.

masterCanvas.png is the overlay shown on stream which is broadcasted to OBS over the video.

Community cards (flop, turn, river) aren't scanned and are require user input to identify and broadcast to stream.

stream.js interacts with createOverlay.js by passing player objects (defined in stream.js) and populating the player card as show in masterCanvas.png
