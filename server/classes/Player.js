
"use strict"

// =====================================================================
// Player Class
// =====================================================================
class Player {
   constructor(id, playerObj) {
      this.id = id;
      this.name = playerObj.name;
      this.side = playerObj.side;
      this.hair = playerObj.hair;
      this.color = playerObj.color;
   }
}

module.exports = Player