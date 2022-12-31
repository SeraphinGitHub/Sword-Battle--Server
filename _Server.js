
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


// =====================================================================
// App init
// =====================================================================
io.on("connection", socket => {
   
   socket.emit("connected");

   socket.on("checkToken", (securityToken) => {
      gameHandler.check(securityToken, "string", () => {
         
         if(securityToken === process.env.SECURITY_TOKEN) {
            gameHandler.init(socket);
            console.log("Player Connected !");
         }

         else {
            socket.emit("authFailed");
            console.log("Authentification failed !");
         }
      });
   });
});

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});