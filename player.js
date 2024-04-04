class Player {
  constructor() {
    this.name = "";
    this.stackSize = 0.0;
    this.seatNumber = "";
    this.currentBet = 0.0;
    this.position = "";
    this.hand = ["", ""]
    this.action = ""
    this.isTurn = false
  }
}

module.exports = Player;
