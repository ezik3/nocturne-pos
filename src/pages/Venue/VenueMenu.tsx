import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";

const menuCategories = ["All", "Cocktails", "Beer", "Wine", "Spirits", "Food", "Non-Alcoholic"];

const menuItems = [
  { id: 1, name: "Espresso Martini", category: "Cocktails", price: 18, available: true, popular: true },
  { id: 2, name: "Margarita", category: "Cocktails", price: 16, available: true, popular: true },
  { id: 3, name: "Old Fashioned", category: "Cocktails", price: 19, available: true, popular: false },
  { id: 4, name: "Corona", category: "Beer", price: 9, available: true, popular: false },
  { id: 5, name: "Heineken", category: "Beer", price: 9, available: false, popular: false },
  { id: 6, name: "House Red", category: "Wine", price: 12, available: true, popular: false },
  { id: 7, name: "Loaded Fries", category: "Food", price: 14, available: true, popular: true },
  { id: 8, name: "Chicken Wings", category: "Food", price: 16, available: true, popular: false },
];

export default function VenueMenu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your venue's menu items</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card className="glass border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="All" onValueChange={setSelectedCategory}>
            <TabsList className="mb-6 flex-wrap h-auto gap-2">
              {menuCategories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="px-4">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    item.available ? 'bg-background/30 border-border' : 'bg-muted/20 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.popular && (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-primary">${item.price}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {item.available ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
