
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
};
let socketList = {};


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