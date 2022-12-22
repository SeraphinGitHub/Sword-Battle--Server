
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

   socket.emit("connected");
}

const createBattle = (socket) => {
   socket.on("createBattle", (battleObj) =>  {
      
      this.check(battleObj, "object", () => {

         const battle = new Battle(socket.id);
         const hostPlayer = new Player(socket.id, battleObj.player);
   
         battle.name = battleObj.battleName;
         battle.hostPlayer = hostPlayer;
         battleList[socket.id] = battle;

         socket.emit("battleCreated", socket.id);
      });
   });
}

const findBattle = (socket) => {
   socket.on("findBattle", () => {

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

      socket.emit("battleFound", battlesArray);
   });
}

const joinBattle = (socket) => {

   let battleToJoin;

   socket.on("joinBattleRequest", (battleID) =>  {
      this.check(battleID, "string", () => {

         battleToJoin = battleList[battleID];

         // If battle exist
         if(battleToJoin
         && battleToJoin.hostPlayer
         && !battleToJoin.joinPlayer) {

            // Sending hostPlayer data > to joinPlayer 
            socket.emit("joinBattleAccepted", battleToJoin.hostPlayer);
         }
      });
   });

   socket.on("joinBattle", (joinPlayerObj) =>  {
      this.check(joinPlayerObj, "object", () => {

         const joiningPlayer = new Player(socket.id, joinPlayerObj);
         battleToJoin.joinPlayer = joiningPlayer;

         // Sending joinPlayer data > to hostPlayer 
         let hostSocket = socketList[battleToJoin.hostPlayer.id];
         hostSocket.emit("enemyJoined", battleToJoin.joinPlayer);

         socket.emit("battleJoined", `You join battle : ${battleToJoin.name}`);
         
         // Battle Sync between players
         battleSync(socket, hostSocket);
         battleLoose(socket, hostSocket);
      });
   });
   
}

const leaveBattle = (socket) => {
   socket.on("EndBattle", (battleID) => {
   
      this.check(battleID, "string", () => {
         let currentBattle = battleList[battleID];

         if(currentBattle && currentBattle.hostPlayer.id) {
            // If leaving player is hostPlayer
            if(socket.id === currentBattle.hostPlayer.id) {
   
               // If another player has joined
               if(currentBattle.joinPlayer) {
                  let joinSocket = socketList[currentBattle.joinPlayer.id];
                  joinSocket.emit("battleEnded", { isHostPlayer: true });
               }
               
               delete battleList[battleID];
            }
            
            // If leaving player is joinPlayer
            else {
               currentBattle.joinPlayer = undefined;
               let hostSocket = socketList[currentBattle.hostPlayer.id];
               hostSocket.emit("battleEnded", { isJoinPlayer: true });
            }
         }
      });
   });

   socket.on("disconnect", () => {
      delete socketList[socket.id];
      console.log("Player Disconnected !");
   })
}

const battleLoose = (socket, hostSocket) => {

   socket.on("battleLoose", (winnerName) =>  {
      this.check(winnerName, "string", () => {

         socket.emit("battleReset", winnerName);
         hostSocket.emit("battleReset", winnerName);
      });
   });
}

const savePlayerStats = (socket) => {

   socket.on("savePlayerStats", (saveObj) =>  {
      this.check(saveObj, "object", () => {

         let currentBattle = battleList[saveObj.battleID];
         let host = currentBattle.hostPlayer;
         let join = currentBattle.joinPlayer;
         
         if(currentBattle) {
            channelToSave(socket, host, join, "hostPlayer", saveObj);
            channelToSave(socket, join, host, "joinPlayer", saveObj);
         }
      });
   });
}

const channelToSave = (socket, localPlayer, enemyPlayer, status, saveObj) => {

   if(localPlayer && socket.id === localPlayer.id) {
      
      // Init join player stats
      if(saveObj.channel === "initStats" && status === "joinPlayer") {
         
         if(localPlayer.healthBarValue === 0) statToSave(localPlayer.healthBarValue, "healthBar", saveObj.dataName, saveObj.dataValue);
         if(localPlayer.shieldBarValue === 0) statToSave(localPlayer.shieldBarValue, "shieldBar", saveObj.dataName, saveObj.dataValue);
         
         socket.emit("usedStats", {
            hostHealth: enemyPlayer.healthBarValue,
            hostShield: enemyPlayer.shieldBarValue,
            
            joinHealth: localPlayer.healthBarValue,
            joinShield: localPlayer.shieldBarValue
         });
      }


      // Save player stats while combat
      if(saveObj.channel === "saveStats") {
         statToSave(localPlayer.healthBarValue, "healthBar", saveObj.dataName, saveObj.dataValue);
         statToSave(localPlayer.shieldBarValue, "shieldBar", saveObj.dataName, saveObj.dataValue);
      }
   }
}

const statToSave = (playerStat, statName, dataName, dataValue) => {

   if(dataName === statName) playerStat = dataValue;
}


// =====================================================================
// Syncronization
// =====================================================================
const battleSync = (socket, hostSocket) => {

   // Send JoinPlayer's data to HostPlayer
   socket.on("ServerSync", (data) => {
      hostSocket.emit("ReceiveServerSync", data);
   });

   // Send HostPlayer's data to JoinPlayer
   hostSocket.on("ServerSync", (data) => {
      socket.emit("ReceiveServerSync", data);
   });
}


exports.init = (socket) => {
   initSocketList(socket);
   createBattle(socket);
   findBattle(socket);
   joinBattle(socket);
   leaveBattle(socket);
   savePlayerStats(socket);
}