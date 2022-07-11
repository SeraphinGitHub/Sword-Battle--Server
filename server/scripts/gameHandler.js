
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
let battleList = {};
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
   
      console.log(battleObj); // ******************************************************
      // ==> [ 'Séraphin', 'Battle 1' ]

      this.check(battleObj, "object", () => {

         const battle = new Battle(socket.id);
         const creatingPlayer = new Player(socket.id, battleObj);
   
         battle.ownerPlayer = creatingPlayer;
         battle.name = battleObj.battleName;
         battleList[socket.id] = battle;
      });
   });
}

const findBattle = (socket) => {
   socket.on("findBattle", () =>  {
      
      let battlesArray = [];
      
      // Sending battle light pack 
      Object.values(battleList).forEach(battle => {
      
         let battleLight = {
            id : battle.id,
            name : battle.ownerPlayer.name,
         };

         // Sending only joinable battle
         if(!battle.joinPlayer) battlesArray.push(battleLight);
      });

      socket.emit("battleFound", battlesArray);
   });
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
   findBattle(socket);
   joinBattle(socket);
   leaveBattle(socket);
}