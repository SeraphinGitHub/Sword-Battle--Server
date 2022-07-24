
"use strict"

// =====================================================================
// Player Class
// =====================================================================
class Player {
   constructor(id, playerObj) {
      
      this.id = id;
      this.name = playerObj.name;

      // Props
      this.side = playerObj.side;
      this.hairStyle = playerObj.hairStyle;
      this.hairColor = playerObj.hairColor;
      this.tabardColor = playerObj.tabardColor;
      this.swordColor = playerObj.swordColor;
   }
}

module.exports = Player