import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Square, Circle as CircleIcon, Save, Download, Grid3x3, Trash2, 
  Upload, Eye, Edit, RotateCcw, Image as ImageIcon, Video, Camera,
  Plus, Users, ChevronRight
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Floorplan item shape used for persistence
interface FloorplanItem {
  id: string;
  type: "table" | "chair" | "rectangle" | "circle";
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number;
  h: number;
  rotation: number;
  meta?: { tableNumber?: string; capacity?: number; shape?: 'circle' | 'square'; status?: 'available' | 'occupied' | 'reserved' };
}

type FloorplanMode = 'upload' | 'editor' | 'preview';
type MediaType = '360photo' | '360video' | 'photo' | 'video';

export default function FloorplanEditor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [floorplanName, setFloorplanName] = useState("Main Floor");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [floorplanMode, setFloorplanMode] = useState<FloorplanMode>('upload');
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [tables, setTables] = useState<FloorplanItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<FloorplanItem | null>(null);
  const [tableCounter, setTableCounter] = useState(1);
  const grid = 20;

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setUploadedMedia(fileURL);
      setFloorplanMode('editor');
      toast.success("Media uploaded! Now place your tables.");
    }
  };

  // Add a table at click position
  const addTable = (x?: number, y?: number) => {
    const newTable: FloorplanItem = {
      id: uuidv4(),
      type: 'table',
      x: x ?? 20 + Math.random() * 60, // Random position if not specified
      y: y ?? 20 + Math.random() * 60,
      w: 80,
      h: 80,
      rotation: 0,
      meta: { 
        tableNumber: `T${tableCounter}`, 
        capacity: 4, 
        shape: 'circle',
        status: 'available'
      }
    };
    setTables(prev => [...prev, newTable]);
    setTableCounter(prev => prev + 1);
    setSelectedTable(newTable);
    toast.success(`Table ${newTable.meta?.tableNumber} added`);
  };

  // Update table position via drag
  const handleTableDrag = (tableId: string, newX: number, newY: number) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, x: newX, y: newY } : t
    ));
  };

  // Delete selected table
  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    setSelectedTable(null);
    toast.success("Table deleted");
  };

  // Update table properties
  const updateTable = (tableId: string, updates: Partial<FloorplanItem['meta']>) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, meta: { ...t.meta, ...updates } } : t
    ));
  };

  // Save to localStorage and Supabase
  const saveFloorplan = async () => {
    const floorplanData = {
      name: floorplanName,
      mediaType,
      mediaURL: uploadedMedia,
      tables,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage for Tables page
    localStorage.setItem('venue_floorplan', JSON.stringify(floorplanData));
    
    // Also save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("floorplans").upsert({
        name: floorplanName,
        venue_id: "default",
        canvas_width: 1200,
        canvas_height: 800,
        items: JSON.parse(JSON.stringify(tables)),
        created_by: user.id,
      });
      if (error) {
        console.error(error);
        toast.error("Failed to save to cloud");
      }
    }
    
    toast.success("Floorplan saved successfully!");
  };

  // Load from localStorage
  const loadFloorplan = () => {
    const saved = localStorage.getItem('venue_floorplan');
    if (saved) {
      const data = JSON.parse(saved);
      setFloorplanName(data.name || "Main Floor");
      setMediaType(data.mediaType || 'photo');
      setUploadedMedia(data.mediaURL || null);
      setTables(data.tables || []);
      if (data.mediaURL) {
        setFloorplanMode('editor');
      }
      toast.success("Floorplan loaded");
    } else {
      toast("No saved floorplan found");
    }
  };

  // Export JSON
  const exportJSON = () => {
    const data = {
      name: floorplanName,
      mediaType,
      tables: tables.map(t => ({
        ...t,
        x: t.x,
        y: t.y,
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${floorplanName.replace(/\s+/g, "_")}_floorplan.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  // Render upload mode
  const renderUploadMode = () => (
    <div className="space-y-6">
      {/* Media Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Media Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: '360photo' as MediaType, icon: Camera, label: '360° Photo', desc: 'Immersive 360 photo' },
            { type: '360video' as MediaType, icon: Video, label: '360° Video', desc: 'Immersive 360 video' },
            { type: 'photo' as MediaType, icon: ImageIcon, label: 'Photo', desc: 'Standard image' },
            { type: 'video' as MediaType, icon: Video, label: 'Video', desc: 'Standard video' },
          ].map((item) => (
            <Card
              key={item.type}
              className={`cursor-pointer transition-all hover:border-primary ${mediaType === item.type ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
              onClick={() => setMediaType(item.type)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${mediaType === item.type ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold">{item.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                {mediaType === item.type && <Badge className="mt-2 bg-primary">Selected</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-border">
        <CardContent className="p-12">
          <div 
            className="text-center cursor-pointer"
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Upload Your Venue Media</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop or click to select a file
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: JPG, PNG, WebP, MP4, WebM, MOV
            </p>
            <Button className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
          <input 
            id="media-upload" 
            type="file" 
            accept="image/*,video/*" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-2 text-primary">Pro Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• For best results, use a 360° photo taken from the center of your venue</li>
            <li>• Ensure good lighting for clear table positioning</li>
            <li>• Standard photos work great for smaller venues</li>
          </ul>
        </CardContent>
      </Card>

      {/* Load Existing */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={loadFloorplan}>
          Load Existing Floorplan
        </Button>
      </div>
    </div>
  );

  // Render editor mode
  const renderEditorMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Toolbar */}
      <Card className="glass border-border lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Floorplan Name</Label>
            <Input value={floorplanName} onChange={(e) => setFloorplanName(e.target.value)} />
          </div>

          <Button onClick={() => addTable()} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Table
          </Button>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
            <Grid3x3 className="h-4 w-4" />
            <span className="text-sm">Snap to grid</span>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Button onClick={saveFloorplan} className="w-full neon-glow">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button onClick={exportJSON} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={() => setFloorplanMode('preview')} variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button onClick={() => setFloorplanMode('upload')} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" /> Change Media
            </Button>
          </div>

          {/* Tables List */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Tables ({tables.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tables.map((table) => (
                <div 
                  key={table.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${selectedTable?.id === table.id ? 'bg-primary/20 border border-primary' : 'bg-secondary/30 hover:bg-secondary/50'}`}
                  onClick={() => setSelectedTable(table)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{table.meta?.tableNumber}</span>
                    <Badge className={`${getStatusColor(table.meta?.status)} text-white text-xs`}>
                      {table.meta?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Users className="w-3 h-3" />
                    {table.meta?.capacity} seats
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Area */}
      <Card className="glass border-border lg:col-span-2">
        <CardContent className="p-4">
          <div 
            ref={canvasContainerRef}
            className="relative w-full aspect-video rounded-lg overflow-hidden border border-border"
            style={{ minHeight: '500px' }}
          >
            {/* Background Media */}
            {uploadedMedia && (
              mediaType.includes('photo') ? (
                <img 
                  src={uploadedMedia} 
                  alt="Venue Floorplan" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <video 
                  src={uploadedMedia} 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  muted
                  loop
                  autoPlay
                />
              )
            )}

            {/* Grid Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Table Hotspots */}
            {tables.map((table) => (
              <div
                key={table.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  selectedTable?.id === table.id ? 'scale-110 z-10' : 'hover:scale-105'
                }`}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                }}
                onClick={() => setSelectedTable(table)}
                draggable
                onDragEnd={(e) => {
                  const container = canvasContainerRef.current;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const newX = ((e.clientX - rect.left) / rect.width) * 100;
                    const newY = ((e.clientY - rect.top) / rect.height) * 100;
                    handleTableDrag(table.id, Math.max(5, Math.min(95, newX)), Math.max(5, Math.min(95, newY)));
                  }
                }}
              >
                <div 
                  className={`relative w-16 h-16 ${table.meta?.shape === 'square' ? 'rounded-lg' : 'rounded-full'} 
                    ${getStatusColor(table.meta?.status)} bg-opacity-80 border-4 border-white shadow-xl
                    flex items-center justify-center
                    ${selectedTable?.id === table.id ? 'ring-4 ring-primary' : ''}
                  `}
                >
                  <div className="text-center text-white">
                    <div className="font-bold text-sm">{table.meta?.tableNumber}</div>
                    <div className="text-xs flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      {table.meta?.capacity}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Click to add table */}
            <div 
              className="absolute inset-0"
              onDoubleClick={(e) => {
                const container = canvasContainerRef.current;
                if (container) {
                  const rect = container.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  addTable(x, y);
                }
              }}
            />

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <Badge variant="secondary" className="bg-black/60 text-white">
                Double-click to add table • Drag to move • Click to select
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Selected Table Properties */}
      <Card className="glass border-border lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Table Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTable ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Input 
                  value={selectedTable.meta?.tableNumber || ''} 
                  onChange={(e) => updateTable(selectedTable.id, { tableNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input 
                  type="number"
                  value={selectedTable.meta?.capacity || 4} 
                  onChange={(e) => updateTable(selectedTable.id, { capacity: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Shape</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedTable.meta?.shape === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTable(selectedTable.id, { shape: 'circle' })}
                  >
                    <CircleIcon className="w-4 h-4 mr-1" /> Circle
                  </Button>
                  <Button 
                    variant={selectedTable.meta?.shape === 'square' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTable(selectedTable.id, { shape: 'square' })}
                  >
                    <Square className="w-4 h-4 mr-1" /> Square
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {(['available', 'occupied', 'reserved'] as const).map((status) => (
                    <Button 
                      key={status}
                      variant={selectedTable.meta?.status === status ? 'default' : 'outline'}
                      size="sm"
                      className={selectedTable.meta?.status === status ? getStatusColor(status) : ''}
                      onClick={() => updateTable(selectedTable.id, { status })}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => deleteTable(selectedTable.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Table
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Select a table to edit its properties
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render preview mode
  const renderPreviewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{floorplanName} - Customer Preview</h2>
          <p className="text-muted-foreground">This is how customers will see your floorplan</p>
        </div>
        <Button onClick={() => setFloorplanMode('editor')}>
          <Edit className="w-4 h-4 mr-2" /> Back to Editor
        </Button>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-4">
          <div 
            className="relative w-full aspect-video rounded-lg overflow-hidden"
            style={{ minHeight: '600px' }}
          >
            {/* Background Media */}
            {uploadedMedia && (
              mediaType.includes('photo') ? (
                <img 
                  src={uploadedMedia} 
                  alt="Venue Floorplan" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={uploadedMedia} 
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                />
              )
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Table Hotspots with animation */}
            {tables.map((table) => (
              <div
                key={table.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-all"
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                }}
              >
                <div 
                  className={`relative w-20 h-20 ${table.meta?.shape === 'square' ? 'rounded-lg' : 'rounded-full'} 
                    ${getStatusColor(table.meta?.status)} border-4 border-white shadow-2xl
                    flex items-center justify-center animate-pulse
                  `}
                >
                  <div className="text-center text-white">
                    <div className="font-bold">{table.meta?.tableNumber}</div>
                    <div className="text-xs flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      {table.meta?.capacity}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Badge className="bg-black/80 text-white px-4 py-2">
                Click on any table to view details or make a reservation
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-sm">Reserved</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-1">Floorplan Editor</h1>
          <p className="text-muted-foreground">
            {floorplanMode === 'upload' && 'Upload your venue media to get started'}
            {floorplanMode === 'editor' && 'Place and configure your tables'}
            {floorplanMode === 'preview' && 'Preview how customers will see your layout'}
          </p>
        </div>
        
        {/* Mode Indicator */}
        <div className="flex items-center gap-2">
          {(['upload', 'editor', 'preview'] as FloorplanMode[]).map((mode, i) => (
            <div key={mode} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                floorplanMode === mode ? 'bg-primary text-primary-foreground' : 
                (['upload', 'editor', 'preview'].indexOf(floorplanMode) > i ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground')
              }`}>
                {i + 1}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      {floorplanMode === 'upload' && renderUploadMode()}
      {floorplanMode === 'editor' && renderEditorMode()}
      {floorplanMode === 'preview' && renderPreviewMode()}
    </div>
  );
}
