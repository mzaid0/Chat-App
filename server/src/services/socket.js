import { Server } from "socket.io";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = {};

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

export default initializeSocket;
