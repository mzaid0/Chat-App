import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Send, LogOut, MessageSquare, Menu, X } from "lucide-react";
import api from "@/api/axios-instance";
import useSocketStore from "@/store/useSocketStore";
import useAuthStore from "@/store/useAuthStore";

function Home() {
  const navigate = useNavigate();
  const { user, clearUser, onlineUsers } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/all");
        setActiveUsers(res.data);
      } catch {
        toast.error("Failed to fetch active users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isUserOnline = (id) => onlineUsers?.includes(id);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      clearUser();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    try {
      const res = await api.post(`/message/send/${selectedUser._id}`, { message });
      const msg = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          id: msg._id,
          content: msg.message,
          sender: msg.senderId.username,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      socket.emit("sendMessage", { receiverId: selectedUser._id, message: msg });
      setMessage("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      toast.error("Could not send message.");
    }
  };

  useEffect(() => {
    if (!socket || !selectedUser) return;
    const handleNewMessage = (msg) => {
      if (msg.senderId._id === selectedUser._id) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg._id,
            content: msg.message,
            sender: msg.senderId.username,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  const handleSelectUser = async (activeUser) => {
    setSelectedUser(activeUser);
    setMessages([]);
    setShowContacts(false);
    try {
      const res = await api.get(`/message/${activeUser._id}`);
      const formattedMessages = res.data.messages.map((msg) => ({
        id: msg._id,
        content: msg.message,
        sender: msg.senderId.username,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(formattedMessages);
    } catch {
      toast.error("Could not load messages.");
    }
  };

  useEffect(() => {
    if (!selectedUser && activeUsers.length > 0) {
      handleSelectUser(activeUsers[1]);
    }
  }, [activeUsers]);

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden p-3 flex items-center justify-between bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowContacts(!showContacts)}>
            {showContacts ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback>{selectedUser.fullname?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm truncate max-w-[100px]">
                {selectedUser.fullname}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-sm">Messages</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`fixed z-20 inset-y-0 left-0 w-64 transform md:static md:translate-x-0 transition-transform bg-white dark:bg-gray-800 border-r ${showContacts ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Card className="h-full border-none rounded-none">
            <CardHeader className="pt-4 pb-3">
              <CardTitle className="text-base">Active Users</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-210px)]">
              <CardContent className="p-2">
                {loading ? (
                  Array(5)
                    .fill()
                    .map((_, i) => (
                      <div key={i} className="flex gap-3 mb-4 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))
                ) : activeUsers.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No active users</p>
                ) : (
                  activeUsers.map((activeUser, index) => (
                    <div key={activeUser._id}>
                      <button
                        onClick={() => handleSelectUser(activeUser)}
                        className={`flex items-center gap-3 w-full p-2 rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedUser?._id === activeUser._id ? "bg-gray-100 dark:bg-gray-700" : ""
                          }`}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={activeUser.avatar} />
                            <AvatarFallback>{activeUser.fullname?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {isUserOnline(activeUser._id) && (
                            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activeUser.fullname}</p>
                          <p className="text-xs text-muted-foreground">@{activeUser.username}</p>
                        </div>
                      </button>
                      {index < activeUsers.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </CardContent>
            </ScrollArea>
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.fullname}</p>
                  <p className="text-xs text-muted-foreground">@{user?.username}</p>
                </div>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </Card>
        </aside>

        {showContacts && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setShowContacts(false)}
          />
        )}

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <ScrollArea className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isSender = msg.sender === user.username;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        {!isSender && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedUser?.avatar} />
                            <AvatarFallback>{selectedUser?.fullname?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[75%] p-3 rounded-xl text-sm break-words ${isSender
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none"
                            }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 text-muted-foreground text-right">{msg.timestamp}</p>
                        </div>

                        {isSender && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-gray-800 border-t flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-sm"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-10 w-10 mb-3 text-muted-foreground" />
              <p className="font-semibold mb-1">No chat selected</p>
              <p className="text-sm text-muted-foreground mb-4">Choose a contact to start chatting</p>
              <Button className="md:hidden" onClick={() => setShowContacts(true)}>
                Browse Contacts
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;
