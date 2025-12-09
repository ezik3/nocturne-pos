import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ImagePlus, DollarSign, Tag, Layers, Info } from "lucide-react";
import { toast } from "sonner";

export interface MenuItemSize {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  sizes: MenuItemSize[];
  imageUrl: string;
  available: boolean;
  preparationTime?: number;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MenuItem | null;
  categories: string[];
  onSave: (item: MenuItem) => void;
  onAddCategory: (category: string) => void;
}

export default function MenuItemModal({ 
  isOpen, 
  onClose, 
  item, 
  categories, 
  onSave,
  onAddCategory 
}: MenuItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [sizes, setSizes] = useState<MenuItemSize[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [available, setAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || "");
      setCategory(item.category);
      setBasePrice(item.basePrice.toString());
      setSizes(item.sizes || []);
      setImageUrl(item.imageUrl || "");
      setAvailable(item.available);
      setPrepTime(item.preparationTime?.toString() || "");
    } else {
      resetForm();
    }
  }, [item, isOpen]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory(categories[0] || "");
    setBasePrice("");
    setSizes([]);
    setImageUrl("");
    setAvailable(true);
    setPrepTime("");
    setNewSizeName("");
    setNewSizePrice("");
  };

  const addSize = () => {
    if (!newSizeName.trim() || !newSizePrice) {
      toast.error("Enter size name and price");
      return;
    }
    const newSize: MenuItemSize = {
      id: `size-${Date.now()}`,
      name: newSizeName.trim(),
      price: parseFloat(newSizePrice)
    };
    setSizes([...sizes, newSize]);
    setNewSizeName("");
    setNewSizePrice("");
  };

  const removeSize = (id: string) => {
    setSizes(sizes.filter(s => s.id !== id));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory.trim());
    setCategory(newCategory.trim());
    setNewCategory("");
    setShowNewCategory(false);
    toast.success(`Category "${newCategory}" added`);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!category) {
      toast.error("Select a category");
      return;
    }
    if (!basePrice && sizes.length === 0) {
      toast.error("Set a base price or add sizes with prices");
      return;
    }

    const menuItem: MenuItem = {
      id: item?.id || `item-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      basePrice: parseFloat(basePrice) || 0,
      sizes,
      imageUrl,
      available,
      preparationTime: prepTime ? parseInt(prepTime) : undefined
    };

    onSave(menuItem);
    onClose();
    resetForm();
    toast.success(item ? "Item updated" : "Item added to menu");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {item ? "Edit Menu Item" : "Add Menu Item"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {item ? "Update item details" : "Create a new menu item for your venue"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Basic Info */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Signature Margarita"
                className="bg-slate-800 border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item..."
                className="bg-slate-800 border-slate-600 min-h-[80px]"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Category *</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-primary text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                New Category
              </Button>
            </div>
            
            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="bg-slate-800 border-slate-600"
                />
                <Button onClick={handleAddCategory} size="sm" className="bg-primary">
                  Add
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNewCategory(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Pricing
            </Label>
            
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-sm text-slate-400">Base Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            {/* Sizes */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 space-y-3">
                <Label className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4 text-purple-400" />
                  Size Options
                  <span className="text-xs text-slate-500">(for drinks, portions, etc.)</span>
                </Label>

                {sizes.length > 0 && (
                  <div className="space-y-2">
                    {sizes.map((size) => (
                      <div 
                        key={size.id} 
                        className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{size.name}</span>
                          <span className="text-primary ml-2">${size.price.toFixed(2)}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeSize(size.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    placeholder="Size name (e.g., Small)"
                    className="bg-slate-700 border-slate-600"
                  />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={newSizePrice}
                      onChange={(e) => setNewSizePrice(e.target.value)}
                      placeholder="0.00"
                      className="pl-5 bg-slate-700 border-slate-600"
                    />
                  </div>
                  <Button onClick={addSize} size="sm" variant="outline" className="border-slate-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-blue-400" />
              Image URL
            </Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-slate-800 border-slate-600"
            />
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          {/* Prep Time */}
          <div className="space-y-2">
            <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
            <Input
              id="prepTime"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="e.g., 15"
              className="bg-slate-800 border-slate-600"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div>
              <Label>Available for Order</Label>
              <p className="text-xs text-slate-400">Turn off to hide from menu</p>
            </div>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </div>

          {/* Onboarding Tip */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Quick Tips</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Add sizes for items with multiple portions (Small, Medium, Large)</li>
                  <li>• Items sync automatically to POS and customer menu</li>
                  <li>• Toggle availability to hide items temporarily</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-primary">
              {item ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
