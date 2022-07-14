
"use strict"

// =====================================================================
// Import Files
// =====================================================================
const Battle = require("../classes/Battle.js");
const Player = require("../classes/Player.js");


// =====================================================================
// Global Variables
// =====================================================================
let battleID = 0;
let battleList = {
   '1': { id: 1, ownerPlayer: { id: 1 }, name: 'BattleField 1' },
   '2': { id: 2, ownerPlayer: { id: 2 }, name: 'War of worlds' },
   '3': { id: 3, ownerPlayer: { id: 3 }, name: 'Sunshine' },
   '4': { id: 4, ownerPlayer: { id: 4 }, name: 'Battle 123' },
   '5': { id: 5, ownerPlayer: { id: 5 }, name: 'Abdoul Wesh' },
   // '6': { id: 6, ownerPlayer: { id: 6 }, name: 'Angtoria' },
   // '7': { id: 7, ownerPlayer: { id: 7 }, name: 'Warmen' },
   // '8': { id: 8, ownerPlayer: { id: 8 }, name: 'NightWish' },
   // '9': { id: 9, ownerPlayer: { id: 9 }, name: 'Maverick' },
   // '10': { id: 10, ownerPlayer: { id: 10 }, name: 'Bruce Willis' },
   // '11': { id: 11, ownerPlayer: { id: 11 }, name: 'Tom Cruise' },
   // '12': { id: 12, ownerPlayer: { id: 12 }, name: 'Enshine' },
   // '13': { id: 13, ownerPlayer: { id: 13 }, name: 'Saul Goodman' },
   // '14': { id: 14, ownerPlayer: { id: 14 }, name: 'Scarie Movie' },
   // '15': { id: 15, ownerPlayer: { id: 15 }, name: 'Marlon Wayans' },
};
let socketList = {};

// setTimeout(() => {
   
//    battleList['10'] = { id: 10, ownerPlayer: { id: 10 }, name: 'XXX XXX' };
//    battleList['11'] = { id: 11, ownerPlayer: { id: 11 }, name: 'Azerty 789' };
//    console.log("Battle Added !"); // ******************************************************

// }, 10000);


setTimeout(() => {
   
   delete battleList['1'];
   delete battleList['3'];
   delete battleList['5'];

   console.log("Battle Removed !"); // ******************************************************

}, 10000);



// =====================================================================
// Methods
// =====================================================================
exports.check = (data, dataType, callback) => {
   
   if(data && typeof(data) === dataType) {
      callback();
   }
}

const initSocketList = (socket) => {
   battleID++;
   socket.id = battleID;
   socketList[socket.id] = socket;
}

const createBattle = (socket) => {
   socket.on("createBattle", (battleObj) =>  {

      this.check(battleObj, "object", () => {

         const battle = new Battle(socket.id);
         const creatingPlayer = new Player(socket.id, battleObj);
   
         battle.ownerPlayer = creatingPlayer;
         battle.name = battleObj.battleName;
         battleList[socket.id] = battle;

         console.log(battleObj); // ******************************************************
      });
   });
}

exports.findBattle = (req, res, next) => {

   let battlesArray = [];
   
   // Sending battle light pack 
   Object.values(battleList).forEach(battle => {
      
      let battleLight = {
         id : `${battle.id}`,
         name : battle.name,
      };

      // Sending only joinable battle
      if(!battle.joinPlayer) battlesArray.push(battleLight);
   });

   res.send(JSON.stringify(battlesArray));

   next();
}

const joinBattle = (socket) => {
   socket.on("joinBattle", (joinPlayerObj) =>  {
      
      this.check(joinPlayerObj, "object", () => {
         let currentBattle = battleList[joinPlayerObj.id];

         // If battle exist & no second player
         if(currentBattle && !currentBattle.joinPlayer) {

            const joiningPlayer = new Player(socket.id, joinPlayerObj);
            currentBattle.joinPlayer = joiningPlayer;

            // Sending ownerPlayer data > to joinPlayer 
            socket.emit("battleJoined", currentBattle.ownerPlayer);
            
            // Sending joinPlayer data > to ownerPlayer 
            let ownerSocket = socketList[joinPlayerObj.id];
            ownerSocket.emit("enemyJoined", currentBattle.joinPlayer);
         }
      });
   });
}

const leaveBattle = (socket) => {
   socket.on("disconnect", () => {
      
      for(let i in battleList) {
         let currentBattle = battleList[i];
   
         // If leaving player is battle owner
         if(socket.id === currentBattle.ownerPlayer.id) {

            if(currentBattle.joinPlayer) {
               let joinSocket = socketList[currentBattle.joinPlayer.id];
               joinSocket.emit("battleEnded", "OwnerPlayer left battle");
            }

            delete battleList[i];
         }

         // If leaving player is NOT battle owner
         else {
            socket.emit("battleEnded", "You left battle");
            currentBattle.joinPlayer = undefined;
         }
      }
      
      delete socketList[socket.id];
      console.log("Player Disconnected !");
   });
}

exports.init = (socket) => {
   initSocketList(socket);
   createBattle(socket);
   joinBattle(socket);
   leaveBattle(socket);
}