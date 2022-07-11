
"use strict"

// =====================================================================
// Player Class
// =====================================================================
class Player {
   constructor(playerObj) {
      this.name = playerObj.playerName;
      this.health = playerObj.playerHealth;
      this.damage = playerObj.playerDamage;
      this.posX = playerObj.playerPosX;
      this.side = playerObj.playerSide;
   }
}

module.exports = Player