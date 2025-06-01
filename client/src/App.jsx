import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import io from "socket.io-client";
import ProtectedRoute from "./components/protected-route";
import PublicRoute from "./components/public-route";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import useAuthStore from "./store/useAuthStore";
import useSocketStore from "./store/useSocketStore";

function App() {
  const { user, setOnlineUsers } = useAuthStore();
  const { setSocket, clearSocket } = useSocketStore();
  useEffect(() => {
    if (user) {
      const socket = io("http://localhost:8080", {
        query: { userId: user._id },
        withCredentials: true,
      });

      setSocket(socket);

      socket.on("connectedUsers", (onlineUsers) => {
        setOnlineUsers(onlineUsers);
      })

      return () => {
        socket.disconnect();
        clearSocket();
      };
    }
  }, [user, setSocket, clearSocket, setOnlineUsers]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
    </Routes>
  );
}

export default App;
