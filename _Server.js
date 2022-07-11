
"use strict"

require("dotenv").config();
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// =====================================================================
// Import Files
// =====================================================================
const gameHandler = require("./server/scripts/gameHandler.js");
const playerHandler = require("./server/scripts/playerHandler.js");


// =====================================================================
// App init
// =====================================================================
io.on("connection", socket => {

   console.log("Player Connected !");
   
   gameHandler.initSocketList(socket);
   gameHandler.createBattle(socket, playerHandler.initBehavior);
   gameHandler.findBattle(socket);
   gameHandler.joinBattle(socket, playerHandler.initBehavior);
   gameHandler.leaveBattle(socket);
});

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});