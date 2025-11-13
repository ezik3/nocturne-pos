import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square, Circle as CircleIcon, Save, Download, Grid3x3, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Floorplan item shape used for persistence
interface FloorplanItem {
  id: string;
  type: "table" | "chair" | "rectangle" | "circle";
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  meta?: { tableNumber?: string; capacity?: number };
}

export default function FloorplanEditor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [floorplanName, setFloorplanName] = useState("Main Floor");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const grid = 20;

  // Init Fabric
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#0f1419",
      selection: true,
    });

    // light grid dots
    for (let i = 0; i < 1200; i += grid) {
      for (let j = 0; j < 800; j += grid) {
        const dot = new Circle({ left: i, top: j, radius: 0.8, fill: "#2a2f36", selectable: false, evented: false });
        canvas.add(dot);
        canvas.sendObjectToBack(dot);
      }
    }

    // Snap on move/scale/rotate end
    const snapObject = (obj: any) => {
      if (!snapToGrid || !obj) return;
      obj.set({
        left: Math.round(obj.left / grid) * grid,
        top: Math.round(obj.top / grid) * grid,
      });
    };

    canvas.on("object:moving", (e) => snapObject(e.target));
    canvas.on("object:modified", (e) => snapObject(e.target));

    setFabricCanvas(canvas);
    toast("Floorplan canvas ready");

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers to add shapes
  const addTable = () => {
    if (!fabricCanvas) return;
    const rect = new Rect({
      left: 120,
      top: 120,
      fill: "#00e5ff",
      width: 120,
      height: 120,
      rx: 6,
      ry: 6,
    });
    // attach metadata
    // @ts-ignore
    rect.data = { id: uuidv4(), type: "table", meta: { tableNumber: `T${Date.now() % 1000}`, capacity: 4 } };
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.requestRenderAll();
  };

  const addChair = () => {
    if (!fabricCanvas) return;
    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 25,
      fill: "#4a5568",
    });
    // @ts-ignore
    circle.data = { id: uuidv4(), type: "chair" };
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    fabricCanvas.requestRenderAll();
  };

  const addRect = () => {
    if (!fabricCanvas) return;
    const rect = new Rect({ left: 200, top: 160, fill: "#2d3748", width: 160, height: 100 });
    // @ts-ignore
    rect.data = { id: uuidv4(), type: "rectangle" };
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.requestRenderAll();
  };

  const addCircle = () => {
    if (!fabricCanvas) return;
    const circle = new Circle({ left: 260, top: 200, radius: 60, fill: "#2d3748" });
    // @ts-ignore
    circle.data = { id: uuidv4(), type: "circle" };
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    fabricCanvas.requestRenderAll();
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObjects();
    if (!active.length) return;
    active.forEach((obj) => fabricCanvas.remove(obj));
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  };

  // Persistence (serialize simple shape data only)
  const serialize = (): FloorplanItem[] => {
    if (!fabricCanvas) return [];
    return fabricCanvas
      .getObjects()
      .filter((o) => !(o instanceof Circle && (o as any).radius < 2)) // skip grid dots
      .map((o: any) => {
        const isCircle = o.type === "circle";
        const isRect = o.type === "rect";
        const base = o.data || { id: uuidv4(), type: isCircle ? "circle" : "rectangle" };
        return {
          id: base.id || uuidv4(),
          type: base.type || (isCircle ? "circle" : "rectangle"),
          x: o.left,
          y: o.top,
          w: isCircle ? o.radius * 2 : o.width * o.scaleX,
          h: isCircle ? o.radius * 2 : o.height * o.scaleY,
          rotation: o.angle || 0,
          meta: base.meta,
        } as FloorplanItem;
      });
  };

  const restore = (items: FloorplanItem[]) => {
    if (!fabricCanvas) return;
    // Remove all but grid dots
    fabricCanvas.getObjects().forEach((o: any) => {
      if (!(o instanceof Circle && o.radius < 2)) fabricCanvas.remove(o);
    });

    items.forEach((it) => {
      if (it.type === "circle" || it.type === "chair") {
        const c = new Circle({ left: it.x, top: it.y, radius: it.w / 2, fill: it.type === "chair" ? "#4a5568" : "#2d3748", angle: it.rotation });
        // @ts-ignore
        c.data = { id: it.id, type: it.type, meta: it.meta };
        fabricCanvas.add(c);
      } else {
        const r = new Rect({ left: it.x, top: it.y, width: it.w, height: it.h, fill: it.type === "table" ? "#00e5ff" : "#2d3748", angle: it.rotation, rx: it.type === "table" ? 6 : 0, ry: it.type === "table" ? 6 : 0 });
        // @ts-ignore
        r.data = { id: it.id, type: it.type, meta: it.meta };
        fabricCanvas.add(r);
      }
    });

    fabricCanvas.requestRenderAll();
  };

  const saveFloorplan = async () => {
    const items = serialize();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in to save floorplans");
      return;
    }
    const { error } = await supabase.from("floorplans").upsert({
      name: floorplanName,
      venue_id: "default",
      canvas_width: 1200,
      canvas_height: 800,
      items: JSON.parse(JSON.stringify(items)),
      created_by: user.id,
    });
    if (error) {
      console.error(error);
      toast.error("Failed to save floorplan");
    } else {
      toast.success("Floorplan saved");
    }
  };

  const loadLatest = async () => {
    const { data } = await supabase
      .from("floorplans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.items && Array.isArray(data.items)) {
      restore(data.items as unknown as FloorplanItem[]);
      setFloorplanName(data.name);
    } else {
      toast("No saved floorplan. Start by placing items.");
    }
  };

  const exportJSON = () => {
    const json = serialize();
    const blob = new Blob([JSON.stringify({ name: floorplanName, items: json }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${floorplanName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-1">Floorplan Editor</h1>
          <p className="text-muted-foreground">Design your venue layout</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveFloorplan} className="neon-glow">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <Button onClick={exportJSON} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass border-border lg:col-span-1">
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Floorplan Name</Label>
              <Input value={floorplanName} onChange={(e) => setFloorplanName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={addTable} variant="outline" size="sm">
                <Square className="h-4 w-4 mr-1" /> Table
              </Button>
              <Button onClick={addChair} variant="outline" size="sm">
                <CircleIcon className="h-4 w-4 mr-1" /> Chair
              </Button>
              <Button onClick={addRect} variant="outline" size="sm">
                <Square className="h-4 w-4 mr-1" /> Rectangle
              </Button>
              <Button onClick={addCircle} variant="outline" size="sm">
                <CircleIcon className="h-4 w-4 mr-1" /> Circle
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
              <Grid3x3 className="h-4 w-4" />
              <span className="text-sm">Snap to grid</span>
            </div>

            <div className="flex gap-2">
              <Button onClick={loadLatest} variant="secondary" className="flex-1">
                Load Latest
              </Button>
              <Button onClick={deleteSelected} variant="destructive" className="flex-1">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">Tip: Select shapes to move/resize/rotate. Use snap-to-grid for clean alignment.</p>
          </CardContent>
        </Card>

        <Card className="glass border-border lg:col-span-3">
          <CardContent className="p-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="block max-w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
