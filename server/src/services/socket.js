import { Server } from "socket.io";

let io;
let connectedUsers = {};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🤓 New client connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;

    if (userId) {
      connectedUsers[userId] = socket.id;
    }

    io.emit("connectedUsers", Object.keys(connectedUsers));

    socket.on("disconnect", () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
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
