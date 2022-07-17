
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
   // '1': { id: 1, hostPlayer: { id: 1 }, name: 'B1 Battle' },
   // '2': { id: 2, hostPlayer: { id: 2 }, name: 'B2 Maverick' },
   // '3': { id: 3, hostPlayer: { id: 3 }, name: 'B3 Shylhnar' },
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
   
         battle.name = battleObj.battleName;
         battle.hostPlayer = creatingPlayer;
         battleList[socket.id] = battle;

         socket.emit("battleCreated", "Battle created !");
      });
   });
}

const findBattle = (socket) => {

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

   socket.emit("findBattle", battlesArray);
}

const joinBattle = (socket) => {
   socket.on("joinBattle", (joinPlayerObj) =>  {
      
      this.check(joinPlayerObj, "object", () => {
         let currentBattle = battleList[joinPlayerObj.battleID];

         // If battle exist & no second player
         if(currentBattle && !currentBattle.joinPlayer) {

            const joiningPlayer = new Player(socket.id, joinPlayerObj);
            currentBattle.joinPlayer = joiningPlayer;

            // Sending hostPlayer data > to joinPlayer 
            socket.emit("battleJoined", currentBattle.hostPlayer);
            
            // Sending joinPlayer data > to hostPlayer 
            let hostSocket = socketList[joinPlayerObj.battleID];
            hostSocket.emit("enemyJoined", currentBattle.joinPlayer);
         }
      });
   });
}

const leaveBattle = (socket) => {
   socket.on("disconnect", () => {
      
      for(let i in battleList) {
         let currentBattle = battleList[i];
   
         // If leaving player is hostPlayer
         if(socket.id === currentBattle.hostPlayer.id) {

            // If another player has joined
            if(currentBattle.joinPlayer) {
               let joinSocket = socketList[currentBattle.joinPlayer.id];
               joinSocket.emit("battleEnded", { isHostPlayer: true });
            }
            
            socket.emit("battleEnded", { isHostPlayer: false });
            delete battleList[i];
         }
         
         // If leaving player is joinPlayer
         else {
            currentBattle.joinPlayer = undefined;
            let hostSocket = socketList[currentBattle.hostPlayer.id];
            hostSocket.emit("battleEnded", { isJoinPlayer: true });
            socket.emit("battleEnded", { isJoinPlayer: false });
         }
      }
      
      delete socketList[socket.id];
      console.log("Player Disconnected !");
   });
}

exports.init = (socket) => {
   initSocketList(socket);
   createBattle(socket);
   findBattle(socket);
   joinBattle(socket);
   leaveBattle(socket);
}