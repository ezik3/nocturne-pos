import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search } from "lucide-react";

const conversations = [
  { id: "1", name: "Table 5 Guest", lastMessage: "Can we get extra napkins?", time: "2 min", unread: 2 },
  { id: "2", name: "VIP Booth 1", lastMessage: "Thanks for the great service!", time: "15 min", unread: 0 },
  { id: "3", name: "Table 2 Guest", lastMessage: "Is the kitchen still open?", time: "1 hour", unread: 1 },
  { id: "4", name: "Bar Customer", lastMessage: "What cocktails do you recommend?", time: "2 hours", unread: 0 },
];

const messages = [
  { id: "1", sender: "guest", text: "Hi, can we get extra napkins please?", time: "2:34 PM" },
  { id: "2", sender: "venue", text: "Of course! I'll send someone right over.", time: "2:35 PM" },
  { id: "3", sender: "guest", text: "Also, is it possible to get the bill?", time: "2:36 PM" },
];

export default function VenueMessages() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="p-8 h-[calc(100vh-3.5rem)]">
      <h1 className="text-4xl font-bold text-primary mb-6">Messages</h1>

      <div className="grid grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Conversations List */}
        <Card className="glass border-border">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-10 bg-secondary/30 border-border" />
            </div>
            
            <div className="flex-1 space-y-2 overflow-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat.id === conv.id ? 'bg-primary/20' : 'hover:bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {conv.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conv.name}</p>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="glass border-border col-span-2">
          <CardContent className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="pb-4 border-b border-border">
              <p className="font-bold text-lg">{selectedChat.name}</p>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>

            {/* Messages */}
            <div className="flex-1 py-4 space-y-4 overflow-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'venue' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'venue'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'venue' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-secondary/30 border-border"
              />
              <Button className="bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
