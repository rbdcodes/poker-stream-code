const Player = require("./player");
let players = Array.from({ length: 3 }, () => new Player());
console.log(players);

let testp = players[0];
testp.name = "BOB";

console.log(players);
