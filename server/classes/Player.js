
"use strict"

// =====================================================================
// Player Class
// =====================================================================
class Player {
   constructor(id, playerObj) {
      this.id = id;
      this.name = playerObj.name;
      this.color = playerObj.color;
      this.side = playerObj.side;
   }
}

module.exports = Player