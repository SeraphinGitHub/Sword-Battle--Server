
"use strict"

// =====================================================================
// Player Class
// =====================================================================
class Player {
   constructor(id, playerObj) {
      this.id = id;
      this.name = playerObj.name;
      this.side = playerObj.side;
      this.hairStyle = playerObj.hairStyle;
      this.hairColor = playerObj.hairColor;
      this.tabardColor = playerObj.tabardColor;
   }
}

module.exports = Player