import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, UtensilsCrossed } from "lucide-react";
import { useVenueMenuDB, MenuItem } from "@/hooks/useVenueMenuDB";
import MenuItemModal from "@/components/Venue/MenuItemModal";
import CategoryModal from "@/components/Venue/CategoryModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Menu() {
  const [venueId, setVenueId] = useState<string | null>(null);
  
  // Get venue ID from localStorage
  useEffect(() => {
    const storedVenueId = localStorage.getItem('jv_current_venue_id');
    if (storedVenueId) {
      setVenueId(storedVenueId);
    }
  }, []);

  const { menuItems, categories, loading, saveItem, deleteItem, toggleAvailability, setAllCategories } = useVenueMenuDB(venueId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveItem = (item: MenuItem) => {
    saveItem(item);
    setIsItemModalOpen(false);
    setEditingItem(undefined);
    toast.success(editingItem ? "Item updated!" : "Item added!");
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    deleteItem(id);
    setDeleteConfirmId(null);
    toast.success("Item deleted!");
  };

  const handleToggleAvailability = (id: string, currentStatus: boolean) => {
    toggleAvailability(id);
    toast.success(currentStatus ? "Item marked unavailable" : "Item marked available");
  };

  const getItemPrice = (item: MenuItem) => {
    if (item.sizes && item.sizes.length > 0) {
      const prices = item.sizes.map(s => s.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    }
    return `$${item.basePrice.toFixed(2)}`;
  };

  if (loading || !venueId) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Menu Management</h1>
          <p className="text-muted-foreground">
            {menuItems.length} items • {categories.length} categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
            Categories
          </Button>
          <Button className="neon-glow" onClick={() => { setEditingItem(undefined); setIsItemModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Empty state with onboarding */}
      {menuItems.length === 0 && (
        <Card className="glass border-primary/30 mb-6">
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-2xl font-bold mb-2">Welcome to Menu Management</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by creating categories for your menu, then add items. Items will automatically appear in your POS New Order screen.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
                1. Set Up Categories
              </Button>
              <Button className="neon-glow" onClick={() => setIsItemModalOpen(true)}>
                2. Add Your First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and filters */}
      {menuItems.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Menu items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className={`glass border-border transition-all ${!item.available ? 'opacity-50' : ''}`}>
            <CardContent className="p-4">
              <div className="aspect-square bg-secondary/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">🍽️</span>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <Badge variant={item.available ? "default" : "secondary"} className="text-xs">
                  {item.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              
              <p className="text-sm text-primary mb-1">{item.category}</p>
              
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
              )}
              
              <p className="text-xl font-bold text-primary mb-1">{getItemPrice(item)}</p>
              
              {item.sizes && item.sizes.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  {item.sizes.map(s => s.name).join(" • ")}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditItem(item)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleAvailability(item.id, item.available)}
                >
                  {item.available ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && menuItems.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items match your search</p>
        </div>
      )}

      {/* Modals */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        onClose={() => { setIsItemModalOpen(false); setEditingItem(undefined); }}
        onSave={handleSaveItem}
        onAddCategory={(cat) => setAllCategories([...categories, cat])}
        item={editingItem}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSave={setAllCategories}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirmId && handleDeleteItem(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
