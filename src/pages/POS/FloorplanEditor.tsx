import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Text, Transformer } from "react-konva";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Square, Circle as CircleIcon, Save, Download, Upload, Grid3x3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface FloorplanItem {
  id: string;
  type: 'table' | 'chair' | 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  tableNumber?: string;
  capacity?: number;
}

export default function FloorplanEditor() {
  const [items, setItems] = useState<FloorplanItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [floorplanName, setFloorplanName] = useState("Main Floor");
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(20);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    loadFloorplans();
  }, []);

  const loadFloorplans = async () => {
    const { data, error } = await supabase
      .from('floorplans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      setFloorplanName(data.name);
      const parsedItems = Array.isArray(data.items) ? (data.items as unknown as FloorplanItem[]) : [];
      setItems(parsedItems);
      setCanvasSize({ width: data.canvas_width || 1200, height: data.canvas_height || 800 });
    }
  };

  const saveFloorplan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to save floorplans');
      return;
    }

    const { error } = await supabase
      .from('floorplans')
      .upsert({
        name: floorplanName,
        venue_id: 'default',
        canvas_width: canvasSize.width,
        canvas_height: canvasSize.height,
        items: JSON.parse(JSON.stringify(items)),
        created_by: user.id,
      });

    if (error) {
      toast.error('Failed to save floorplan');
      console.error(error);
    } else {
      toast.success('Floorplan saved successfully!');
    }
  };

  const addItem = (type: 'table' | 'chair' | 'rectangle' | 'circle') => {
    const newItem: FloorplanItem = {
      id: uuidv4(),
      type,
      x: 100,
      y: 100,
      width: type === 'table' ? 120 : type === 'chair' ? 50 : 100,
      height: type === 'table' ? 120 : type === 'chair' ? 50 : 100,
      rotation: 0,
      fill: type === 'table' ? '#00e5ff' : type === 'chair' ? '#4a5568' : '#2d3748',
      tableNumber: type === 'table' ? `T${items.filter(i => i.type === 'table').length + 1}` : undefined,
      capacity: type === 'table' ? 4 : undefined,
    };
    setItems([...items, newItem]);
  };

  const handleDragEnd = (id: string, e: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    let x = e.target.x();
    let y = e.target.y();

    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    setItems(items.map(i => i.id === id ? { ...i, x, y } : i));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleDelete = () => {
    if (selectedId) {
      setItems(items.filter(i => i.id !== selectedId));
      setSelectedId(null);
    }
  };

  const exportJSON = () => {
    const data = {
      name: floorplanName,
      canvas: canvasSize,
      items,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${floorplanName.replace(/\s+/g, '_')}.json`;
    link.click();
    toast.success('Floorplan exported!');
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Floorplan Editor</h1>
          <p className="text-muted-foreground">Design your venue layout</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveFloorplan} className="neon-glow">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={exportJSON} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
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
              <Input
                value={floorplanName}
                onChange={(e) => setFloorplanName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Add Items</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => addItem('table')} variant="outline" size="sm">
                  <Square className="h-4 w-4 mr-1" />
                  Table
                </Button>
                <Button onClick={() => addItem('chair')} variant="outline" size="sm">
                  <CircleIcon className="h-4 w-4 mr-1" />
                  Chair
                </Button>
                <Button onClick={() => addItem('rectangle')} variant="outline" size="sm">
                  <Square className="h-4 w-4 mr-1" />
                  Rectangle
                </Button>
                <Button onClick={() => addItem('circle')} variant="outline" size="sm">
                  <CircleIcon className="h-4 w-4 mr-1" />
                  Circle
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded"
                />
                <Grid3x3 className="h-4 w-4" />
                Snap to Grid
              </Label>
            </div>

            {selectedId && (
              <Button onClick={handleDelete} variant="destructive" className="w-full">
                Delete Selected
              </Button>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Items: {items.length}</p>
              <p className="text-sm text-muted-foreground">
                Tables: {items.filter(i => i.type === 'table').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border lg:col-span-3">
          <CardContent className="p-6">
            <div className="border border-border rounded-lg overflow-hidden bg-background/50">
              <Stage
                width={canvasSize.width}
                height={canvasSize.height}
                ref={stageRef}
                onClick={(e) => {
                  if (e.target === e.target.getStage()) {
                    setSelectedId(null);
                  }
                }}
              >
                <Layer>
                  {snapToGrid && Array.from({ length: Math.ceil(canvasSize.width / gridSize) }).map((_, i) =>
                    Array.from({ length: Math.ceil(canvasSize.height / gridSize) }).map((_, j) => (
                      <Circle
                        key={`${i}-${j}`}
                        x={i * gridSize}
                        y={j * gridSize}
                        radius={1}
                        fill="#444"
                      />
                    ))
                  )}
                  
                  {items.map((item) => {
                    if (item.type === 'circle' || item.type === 'chair') {
                      return (
                        <Circle
                          key={item.id}
                          x={item.x}
                          y={item.y}
                          radius={item.width / 2}
                          fill={item.fill}
                          draggable
                          onClick={() => handleSelect(item.id)}
                          onDragEnd={(e) => handleDragEnd(item.id, e)}
                          stroke={selectedId === item.id ? '#00e5ff' : undefined}
                          strokeWidth={selectedId === item.id ? 3 : 0}
                        />
                      );
                    } else {
                      return (
                        <>
                          <Rect
                            key={item.id}
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            fill={item.fill}
                            draggable
                            onClick={() => handleSelect(item.id)}
                            onDragEnd={(e) => handleDragEnd(item.id, e)}
                            stroke={selectedId === item.id ? '#00e5ff' : undefined}
                            strokeWidth={selectedId === item.id ? 3 : 0}
                          />
                          {item.tableNumber && (
                            <Text
                              x={item.x}
                              y={item.y + item.height / 2 - 10}
                              width={item.width}
                              text={item.tableNumber}
                              fontSize={18}
                              fontFamily="Arial"
                              fill="#fff"
                              align="center"
                            />
                          )}
                        </>
                      );
                    }
                  })}
                </Layer>
              </Stage>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
