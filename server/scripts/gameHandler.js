
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
exports.initSocketList = (socket) => {
   battleID++;
   socket.id = battleID;
   socketList[socket.id] = socket;
}

exports.createBattle = (socket, callback) => {
   socket.on("createBattle", (battleObj) =>  {

      const battle = new Battle(socket.id);
      const player = new Player(battleObj);

      battle.player = player;
      battle.name = battleObj.battleName;
      battleList[socket.id] = battle;

      callback(socket);
   });
}

exports.findBattle = (socket) => {
   socket.on("findBattle", () =>  {
      
      let battlesArray = [];

      Object.values(battleList).forEach(battle => {

         let battleLight = {
            id : battle.id,
            name : battle.player.name,
         };

         if(!battle.enemy) battlesArray.push(battleLight);
      });

      socket.emit("battleFound", battlesArray);
   });
}

exports.joinBattle = (socket, callback) => {
   socket.on("joinBattle", (enemyObj) =>  {
      
      let curentBattle = battleList[enemyObj.id];
      
      if(!curentBattle.enemy) {
         const player = new Player(enemyObj);

         curentBattle.enemy = player;
         socket.emit("battleJoined", curentBattle.player);
         
         let otherSocket = socketList[enemyObj.id];
         otherSocket.emit("enemyJoined", curentBattle.enemy);
   
         callback(socket);
      }
      else return;
   });
}

exports.leaveBattle = (socket) => {
   socket.on("disconnect", () => {
   
      // console.log("Player Disconnected !");
      delete socketList[socket.id];
      if(battleList[socket.id]) delete battleList[socket.id];
   });
}