
"use strict"

require("dotenv").config();
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require("body-parser");


// =====================================================================
// Import Files
// =====================================================================
const gameHandler = require("./server/scripts/gameHandler.js");
const playerHandler = require("./server/scripts/playerHandler.js");


// =====================================================================
// App init
// =====================================================================
app.get("/find-battle", (req, res, next) => gameHandler.findBattle(req, res, next));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

io.on("connection", socket => {

   console.log("Player Connected !");
   
   gameHandler.init(socket);
   playerHandler.init(socket);
});

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});