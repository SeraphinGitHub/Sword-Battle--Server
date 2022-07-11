
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
   
   socket.on("AttackingStrike", (data) => {
      // socket.emit("Get", data);
      console.log(data); // ******************************************************
   });

   socket.on("AttackingEstoc", (data) => {
      // socket.emit("Get", data);
      socket.emit("azerty", ["Abdoul", "123", "false"]);
      // socket.emit("azerty", "Abdoul");
   });
}

exports.init = (socket) => {
   left(socket);
   right(socket);
   attack(socket);
}