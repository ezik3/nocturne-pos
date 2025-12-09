import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Tag, Info } from "lucide-react";
import { toast } from "sonner";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSave: (categories: string[]) => void;
}

export default function CategoryModal({ isOpen, onClose, categories, onSave }: CategoryModalProps) {
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Enter a category name");
      return;
    }
    if (localCategories.includes(newCategory.trim())) {
      toast.error("Category already exists");
      return;
    }
    setLocalCategories([...localCategories, newCategory.trim()]);
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    setLocalCategories(localCategories.filter(c => c !== cat));
  };

  const handleSave = () => {
    onSave(localCategories);
    onClose();
    toast.success("Categories updated");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Manage Categories
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Create custom categories for your menu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Category */}
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="New category name..."
              className="bg-slate-800 border-slate-600"
            />
            <Button onClick={addCategory} className="bg-primary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Category List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {localCategories.length === 0 ? (
              <p className="text-center text-slate-500 py-4">
                No categories yet. Add your first category above.
              </p>
            ) : (
              localCategories.map((cat, index) => (
                <div 
                  key={cat}
                  className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <GripVertical className="h-4 w-4 text-slate-500" />
                  <span className="flex-1">{cat}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(cat)}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Help Card */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-3 flex gap-2">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400">
                <p>Create categories that match your venue type:</p>
                <p className="text-blue-400 mt-1">
                  Bar: Cocktails, Beers, Wines, Spirits, Mocktails
                </p>
                <p className="text-purple-400">
                  Restaurant: Starters, Mains, Desserts, Sides
                </p>
                <p className="text-pink-400">
                  Cafe: Hot Drinks, Cold Drinks, Pastries, Snacks
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-primary">
              Save Categories
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
