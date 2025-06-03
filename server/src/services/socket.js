import { Server } from "socket.io";

let io;
let connectedUsers = {};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      connectedUsers[userId] = socket.id;
    }

    io.emit("connectedUsers", Object.keys(connectedUsers));

    socket.on("disconnect", () => {
      delete connectedUsers[userId];
      io.emit("connectedUsers", Object.keys(connectedUsers));
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => {
  return connectedUsers[receiverId] || null;
};

export { initializeSocket, io, connectedUsers };
