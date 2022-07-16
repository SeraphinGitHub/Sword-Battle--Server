
"use strict"

// =====================================================================
// Player Class
// =====================================================================
class Player {
   constructor(id, playerObj) {
      this.id = id;
      this.name = playerObj.playerName;
      this.color = playerObj.playerColor;
      this.side = playerObj.playerSide;
   }
}

module.exports = Player