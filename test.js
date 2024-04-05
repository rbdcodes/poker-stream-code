const generateMasterCanvas = require("./createOverlay");
const Player = require("./player");
const readlineSync = require("readline-sync");


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
testPlayer.seatNumber = 1
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

testPlayer2.name = "Nikhil GGG"
testPlayer2.stackSize = 1000
testPlayer2.seatNumber = 2
testPlayer2.currentBet = 10
testPlayer2.position = "UTG"
testPlayer2.hand = ["Ac", "As"]
testPlayer2.action = "b"

const playerArray = [testPlayer, testPlayer2]

generateMasterCanvas(playerArray)