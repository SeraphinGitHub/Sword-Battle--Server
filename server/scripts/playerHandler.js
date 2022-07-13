
"use strict"

// =====================================================================
// Methods
// =====================================================================
const left = (socket) => {
   
   socket.on("Left", (data) => {
      socket.emit("Get", data);
   });
}

const right = (socket) => {
   
   socket.on("Right", (data) => {
      socket.emit("Get", data);
   });
}

const attack = (socket) => {
   
   socket.on("AttackStrike", (data) => {
      socket.emit("Get", data);
   });

   socket.on("AttackEstoc", (data) => {
      socket.emit("Get", data);
   });
}

exports.init = (socket) => {
   left(socket);
   right(socket);
   attack(socket);
}