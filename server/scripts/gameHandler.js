
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

const channelsArray = [
   "Position",
   "AttackStrike",
   "AttackEstoc",
];


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
         const hostPlayer = new Player(socket.id, battleObj.player);
   
         battle.name = battleObj.battleName;
         battle.hostPlayer = hostPlayer;
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
         let hostSocket = socketList[battleToJoin.id];
         hostSocket.emit("enemyJoined", battleToJoin.joinPlayer);

         socket.emit("battleJoined", `You join battle : ${battleToJoin.name}`);
         
         // Battle Sync between players
         battleSync(socket, battleToJoin);
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


// =====================================================================
// Syncronization
// =====================================================================
const battleSync = (socket, battle) => {

   let hostSocket = socketList[battle.hostPlayer.id];
   let joinSocket = socketList[battle.joinPlayer.id];

   channelsArray.forEach(channel => {
      socket.on(channel, (data) => {

         console.log(data); // ******************************************************

         // If socket is hostPlayer > send data to joinPlayer
         if(socket.id === battle.hostPlayer.id) {
            joinSocket.emit(`Get_${channel}`, {data : data});
         }

         // If socket is joinPlayer > send data to hostPlayer
         if(socket.id === battle.joinPlayer.id) hostSocket.emit(`Get_${channel}`, {data : data});
      });
   });
}


exports.init = (socket) => {
   initSocketList(socket);
   createBattle(socket);
   findBattle(socket);
   joinBattle(socket);
   leaveBattle(socket);
}