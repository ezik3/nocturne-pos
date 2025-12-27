import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Eye,
  EyeOff,
  Info,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useVenueMenuDB } from "@/hooks/useVenueMenuDB";
import MenuItemModal, { MenuItem } from "@/components/Venue/MenuItemModal";
import CategoryModal from "@/components/Venue/CategoryModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function VenueMenu() {
  const { user } = useAuth();
  const [venueId, setVenueId] = useState<string | null>(null);
  const [venueLoading, setVenueLoading] = useState(true);

  useEffect(() => {
    const loadVenueId = async () => {
      if (!user) {
        setVenueLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("venues")
          .select("id")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data?.id) {
          setVenueId(data.id);
          localStorage.setItem("jv_current_venue_id", data.id);
        }
      } catch (e) {
        console.error("Failed to resolve venue id", e);
      } finally {
        setVenueLoading(false);
      }
    };

    loadVenueId();
  }, [user]);

  const {
    menuItems,
    categories,
    loading,
    saveItem,
    deleteItem: removeItem,
    toggleAvailability,
    addCategory,
    setAllCategories,
  } = useVenueMenuDB(venueId);


  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleDelete = (id: string) => {
    removeItem(id);
    setDeleteConfirm(null);
    toast.success("Item deleted");
  };

  const handleSaveItem = (item: MenuItem) => {
    saveItem(item);
    setEditingItem(null);
  };

  const handleModalClose = () => {
    setShowItemModal(false);
    setEditingItem(null);
  };

  if (venueLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading menu...</div>
      </div>
    );
  }

  if (!venueId) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-muted-foreground">No venue found for this account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Menu Management</h1>
          <p className="text-muted-foreground">
            {menuItems.length} items • {categories.length} categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCategoryModal(true)}
            className="border-border"
          >
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={() => setShowItemModal(true)} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Onboarding Card for Empty State */}
      {menuItems.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Welcome to Menu Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building your venue's menu. Items you add here will automatically appear in:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">POS New Order</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">Customer Menu</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm">AI Waiter</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowCategoryModal(true)} variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-2" />
                    Setup Categories First
                  </Button>
                  <Button onClick={() => setShowItemModal(true)} size="sm" className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      {menuItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-slate-800 border-slate-700 flex-wrap">
              <TabsTrigger value="All">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Menu Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`bg-slate-800/50 border-slate-700 transition-all hover:border-primary/50 ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-4">
                {/* Image */}
                <div className="aspect-video bg-slate-700/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🍽️</span>';
                      }}
                    />
                  ) : (
                    <span className="text-4xl">🍽️</span>
                  )}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {item.category}
                    </Badge>
                  </div>
                  <Badge 
                    variant={item.available ? "default" : "secondary"}
                    className={`text-xs ${item.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {item.available ? 'Available' : 'Hidden'}
                  </Badge>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="mb-3">
                  {item.sizes && item.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.sizes.map(size => (
                        <Badge 
                          key={size.id} 
                          variant="outline" 
                          className="text-xs bg-primary/10 text-primary border-primary/30"
                        >
                          {size.name}: ${size.price.toFixed(2)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-primary">
                      ${item.basePrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Prep Time */}
                {item.preparationTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <Clock className="h-3 w-3" />
                    <span>{item.preparationTime} min prep</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-slate-600"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAvailability(item.id)}
                    className="border-slate-600"
                  >
                    {item.available ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(item.id)}
                    className="border-slate-600 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : menuItems.length > 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No items match your search</p>
        </div>
      ) : null}

      {/* Modals */}
      <MenuItemModal
        isOpen={showItemModal}
        onClose={handleModalClose}
        item={editingItem}
        categories={categories}
        onSave={handleSaveItem}
        onAddCategory={addCategory}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onSave={setAllCategories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from your menu. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
