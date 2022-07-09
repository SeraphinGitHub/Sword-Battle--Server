
"use strict"

exports.left = (socket) => {
   
   socket.on("Left", (data) => {
      socket.emit("Get", data);
   });
}

exports.right = (socket) => {
   
   socket.on("Right", (data) => {
      socket.emit("Get", data);
   });
}

exports.attack = (socket) => {
   
   socket.on("Attacking", (data) => {
      socket.emit("Get", data);
   });
}