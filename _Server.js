
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
const gameHandler = require("./scripts/_GameHandler.js");


// =====================================================================
// App init
// =====================================================================
io.on("connection", socket => {
   gameHandler.left(socket);
   gameHandler.right(socket);
   gameHandler.attack(socket);
});

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});