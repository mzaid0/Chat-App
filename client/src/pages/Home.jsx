import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Send, LogOut, MessageSquare } from "lucide-react";
import api from "@/api/axios-instance";
import useAuthStore from "@/store/useAuthStore";

function Home() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/all");
        setActiveUsers(res.data);
      } catch (error) {
        console.error("Error fetching active users:", error);
        toast.error("Failed to fetch active users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      clearUser();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    try {
      const res = await api.post(`/message/send/${selectedUser._id}`, {
        message,
      });

      const msg = res.data.data;

      setMessages((prev) => [
        ...prev,
        {
          id: msg._id,
          content: msg.message,
          sender: msg.senderId.username,
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Could not send message.");
    }
  };


  const handleSelectUser = async (activeUser) => {
    setSelectedUser(activeUser);
    setMessages([]); // Clear old messages

    try {
      const res = await api.get(`/message/${activeUser._id}`);
      const formattedMessages = res.data.messages.map((msg) => ({
        id: msg._id,
        content: msg.message,
        sender: msg.senderId.username,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Could not load messages.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-background">
      {/* Mobile: Horizontal User List */}
      <div className="md:hidden">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Active Users</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="w-full whitespace-nowrap" orientation="horizontal">
              <div className="flex gap-3">
                {loading ? (
                  Array(5)
                    .fill()
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 w-12 rounded-full" />
                    ))
                ) : activeUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active users found
                  </p>
                ) : (
                  activeUsers.map((activeUser) => (
                    <button
                      key={activeUser._id}
                      onClick={() => handleSelectUser(activeUser)}
                      className={`flex-shrink-0 p-2 rounded-full ${selectedUser?._id === activeUser._id
                        ? "bg-accent"
                        : "hover:bg-accent"
                        } transition-colors`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={activeUser.avatar} alt={activeUser.username} />
                        <AvatarFallback>
                          {activeUser.fullname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Separator />
      </div>

      {/* Desktop: Sidebar and Message Container */}
      <div className="flex flex-1">
        {/* Sidebar (Desktop Only) */}
        <Card className="hidden md:block w-64 h-screen flex-shrink-0 border-r">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Active Users</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <CardContent className="p-4">
              {loading ? (
                Array(5)
                  .fill()
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
              ) : activeUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active users found
                </p>
              ) : (
                activeUsers.map((activeUser, index) => (
                  <div key={activeUser._id}>
                    <button
                      onClick={() => handleSelectUser(activeUser)}
                      className={`flex items-center gap-3 mb-1 w-full text-left p-2 rounded-md hover:bg-accent transition-colors ${selectedUser?._id === activeUser._id ? "bg-accent" : ""
                        }`}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={activeUser.avatar} alt={activeUser.username} />
                          <AvatarFallback>
                            {activeUser.fullname.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-background" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activeUser.fullname}</p>
                        <p className="text-xs text-muted-foreground">
                          @{activeUser.username}
                        </p>
                      </div>
                    </button>
                    {index < activeUsers.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </CardContent>
          </ScrollArea>
          <Separator />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>
                  {user?.fullname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.fullname}</p>
                <p className="text-xs text-muted-foreground">@{user?.username}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Message Container */}
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {selectedUser ? `Chat with ${selectedUser.fullname}` : "Messages"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {selectedUser ? (
                <>
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === user.username ? "justify-end" : "justify-start"
                            } mb-4`}
                        >
                          <div
                            className={`max-w-xs rounded-lg p-3 ${msg.sender === user.username
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                              }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                  <Separator />
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 flex items-center gap-2"
                  >
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Select a user to start messaging</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;