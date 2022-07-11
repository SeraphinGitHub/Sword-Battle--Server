
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
   
   socket.on("Attacking", (data) => {
      socket.emit("Get", data);
   });
}

exports.initBehavior = (socket) => {
   left(socket);
   right(socket);
   attack(socket);
}