
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
      this.hairColor = playerObj.hairColor;
      this.bodyColor = playerObj.bodyColor;
   }
}

module.exports = Player