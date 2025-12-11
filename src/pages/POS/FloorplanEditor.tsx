import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Square, Circle as CircleIcon, Save, Download, Trash2, 
  Upload, Eye, Edit, RotateCcw, Image as ImageIcon, Video, Camera,
  Plus, Users, ChevronRight, MapPin, Coffee, DoorOpen, Pointer,
  Utensils, Music, Navigation, X, Settings, Layers
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Declare Pannellum global
declare global {
  interface Window {
    pannellum: any;
  }
}

// Hotspot types for venue floorplan
type HotspotType = 'table' | 'bar' | 'toilet' | 'entry' | 'exit' | 'goto' | 'dj' | 'stage' | 'vip';

interface VenueHotspot {
  id: string;
  type: HotspotType;
  pitch: number;
  yaw: number;
  text: string;
  targetScene?: string; // For 'goto' type - links to another scene
  capacity?: number; // For tables
  tableNumber?: string;
  status?: 'available' | 'occupied' | 'reserved';
}

interface VenueScene {
  id: string;
  name: string;
  panoramaUrl: string;
  hotspots: VenueHotspot[];
  isDefault?: boolean;
}

type FloorplanMode = 'upload' | 'editor' | 'preview';
type MediaType = '360photo' | '360video';

const HOTSPOT_CONFIG: Record<HotspotType, { icon: string; label: string; color: string; description: string }> = {
  table: { icon: '🪑', label: 'Table', color: 'bg-green-500', description: 'Seating area with ordering' },
  bar: { icon: '🍸', label: 'Bar', color: 'bg-purple-500', description: 'Bar/drinks area' },
  toilet: { icon: '🚻', label: 'Restroom', color: 'bg-blue-500', description: 'Toilet facilities' },
  entry: { icon: '🚪', label: 'Entry', color: 'bg-cyan-500', description: 'Entrance point' },
  exit: { icon: '🚪', label: 'Exit', color: 'bg-orange-500', description: 'Exit point' },
  goto: { icon: '👆', label: 'Go To', color: 'bg-pink-500', description: 'Navigate to another area' },
  dj: { icon: '🎧', label: 'DJ Booth', color: 'bg-violet-500', description: 'DJ/music area' },
  stage: { icon: '🎤', label: 'Stage', color: 'bg-yellow-500', description: 'Performance stage' },
  vip: { icon: '⭐', label: 'VIP', color: 'bg-amber-500', description: 'VIP section' },
};

export default function FloorplanEditor() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumViewer = useRef<any>(null);
  
  const [floorplanMode, setFloorplanMode] = useState<FloorplanMode>('upload');
  const [mediaType, setMediaType] = useState<MediaType>('360photo');
  const [tourName, setTourName] = useState("My Venue Tour");
  
  // Scenes for multi-room tours
  const [scenes, setScenes] = useState<VenueScene[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  
  // Selected hotspot for editing
  const [selectedHotspot, setSelectedHotspot] = useState<VenueHotspot | null>(null);
  const [hotspotTypeToAdd, setHotspotTypeToAdd] = useState<HotspotType>('table');
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  
  // Table counter for auto-numbering
  const [tableCounter, setTableCounter] = useState(1);

  // Get current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);

  // Initialize Pannellum viewer
  const initViewer = useCallback((scene: VenueScene) => {
    if (!viewerRef.current || !window.pannellum) return;
    
    // Destroy existing viewer
    if (pannellumViewer.current) {
      pannellumViewer.current.destroy();
    }

    // Build hotspots for Pannellum
    const pannellumHotspots = scene.hotspots.map(hs => {
      const config = HOTSPOT_CONFIG[hs.type];
      return {
        id: hs.id,
        pitch: hs.pitch,
        yaw: hs.yaw,
        type: "custom",
        cssClass: `venue-hotspot venue-hotspot-${hs.type}`,
        createTooltipFunc: (hotSpotDiv: HTMLDivElement) => {
          hotSpotDiv.innerHTML = `
            <div class="hotspot-marker ${config.color} rounded-full w-12 h-12 flex items-center justify-center text-2xl cursor-pointer shadow-lg border-2 border-white animate-pulse">
              ${config.icon}
            </div>
            <div class="hotspot-tooltip hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap">
              <div class="font-bold">${hs.text || config.label}</div>
              ${hs.type === 'table' ? `<div class="text-xs">Seats: ${hs.capacity || 4}</div>` : ''}
              ${hs.type === 'goto' && hs.targetScene ? `<div class="text-xs">→ ${scenes.find(s => s.id === hs.targetScene)?.name || 'Next Area'}</div>` : ''}
            </div>
          `;
          
          hotSpotDiv.addEventListener('mouseenter', () => {
            const tooltip = hotSpotDiv.querySelector('.hotspot-tooltip');
            if (tooltip) tooltip.classList.remove('hidden');
          });
          hotSpotDiv.addEventListener('mouseleave', () => {
            const tooltip = hotSpotDiv.querySelector('.hotspot-tooltip');
            if (tooltip) tooltip.classList.add('hidden');
          });
        },
        clickHandlerFunc: () => {
          if (hs.type === 'goto' && hs.targetScene) {
            // Navigate to target scene
            setCurrentSceneId(hs.targetScene);
          } else {
            setSelectedHotspot(hs);
          }
        }
      };
    });

    // Create viewer
    pannellumViewer.current = window.pannellum.viewer(viewerRef.current, {
      type: "equirectangular",
      panorama: scene.panoramaUrl,
      autoLoad: true,
      showControls: true,
      compass: true,
      hotSpots: pannellumHotspots,
      hotSpotDebug: isAddingHotspot, // Show coordinates when adding
      mouseZoom: true,
      draggable: true,
      friction: 0.15,
      yaw: 0,
      pitch: 0,
      hfov: 100,
      minHfov: 50,
      maxHfov: 120,
    });

    // Click handler for adding hotspots
    if (isAddingHotspot) {
      pannellumViewer.current.on('mousedown', function(event: MouseEvent) {
        if (event.button === 0) { // Left click
          const coords = pannellumViewer.current.mouseEventToCoords(event);
          if (coords) {
            addHotspot(coords[0], coords[1]);
          }
        }
      });
    }
  }, [isAddingHotspot, scenes]);

  // Re-init viewer when scene changes
  useEffect(() => {
    if (currentScene && floorplanMode !== 'upload') {
      initViewer(currentScene);
    }
  }, [currentSceneId, currentScene, floorplanMode, initViewer]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const newScene: VenueScene = {
        id: uuidv4(),
        name: scenes.length === 0 ? "Main Area" : `Area ${scenes.length + 1}`,
        panoramaUrl: fileURL,
        hotspots: [],
        isDefault: scenes.length === 0,
      };
      setScenes(prev => [...prev, newScene]);
      setCurrentSceneId(newScene.id);
      setFloorplanMode('editor');
      toast.success("360° media uploaded! Click anywhere to add hotspots.");
    }
  };

  // Add a new scene
  const addNewScene = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const newScene: VenueScene = {
        id: uuidv4(),
        name: `Area ${scenes.length + 1}`,
        panoramaUrl: fileURL,
        hotspots: [],
      };
      setScenes(prev => [...prev, newScene]);
      setCurrentSceneId(newScene.id);
      toast.success(`Scene "${newScene.name}" added!`);
    }
  };

  // Add hotspot at coordinates
  const addHotspot = (pitch: number, yaw: number) => {
    if (!currentSceneId) return;

    const config = HOTSPOT_CONFIG[hotspotTypeToAdd];
    const newHotspot: VenueHotspot = {
      id: uuidv4(),
      type: hotspotTypeToAdd,
      pitch,
      yaw,
      text: hotspotTypeToAdd === 'table' ? `Table ${tableCounter}` : config.label,
      capacity: hotspotTypeToAdd === 'table' ? 4 : undefined,
      tableNumber: hotspotTypeToAdd === 'table' ? `T${tableCounter}` : undefined,
      status: hotspotTypeToAdd === 'table' ? 'available' : undefined,
    };

    if (hotspotTypeToAdd === 'table') {
      setTableCounter(prev => prev + 1);
    }

    setScenes(prev => prev.map(scene => 
      scene.id === currentSceneId 
        ? { ...scene, hotspots: [...scene.hotspots, newHotspot] }
        : scene
    ));

    setSelectedHotspot(newHotspot);
    setIsAddingHotspot(false);
    toast.success(`${config.label} added!`);
  };

  // Update hotspot
  const updateHotspot = (hotspotId: string, updates: Partial<VenueHotspot>) => {
    setScenes(prev => prev.map(scene => ({
      ...scene,
      hotspots: scene.hotspots.map(hs => 
        hs.id === hotspotId ? { ...hs, ...updates } : hs
      )
    })));
    
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot({ ...selectedHotspot, ...updates });
    }
  };

  // Delete hotspot
  const deleteHotspot = (hotspotId: string) => {
    setScenes(prev => prev.map(scene => ({
      ...scene,
      hotspots: scene.hotspots.filter(hs => hs.id !== hotspotId)
    })));
    setSelectedHotspot(null);
    toast.success("Hotspot deleted");
  };

  // Update scene name
  const updateSceneName = (sceneId: string, name: string) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, name } : scene
    ));
  };

  // Delete scene
  const deleteScene = (sceneId: string) => {
    if (scenes.length <= 1) {
      toast.error("Cannot delete the only scene");
      return;
    }
    setScenes(prev => prev.filter(s => s.id !== sceneId));
    if (currentSceneId === sceneId) {
      setCurrentSceneId(scenes.find(s => s.id !== sceneId)?.id || null);
    }
    toast.success("Scene deleted");
  };

  // Save floorplan
  const saveFloorplan = async () => {
    const floorplanData = {
      name: tourName,
      mediaType,
      scenes,
      tableCounter,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('venue_floorplan_360', JSON.stringify(floorplanData));
    
    // Also save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("floorplans").upsert({
        name: tourName,
        venue_id: "default",
        canvas_width: 0,
        canvas_height: 0,
        items: JSON.parse(JSON.stringify({ scenes, tableCounter })),
        created_by: user.id,
      });
      if (error) {
        console.error(error);
        toast.error("Failed to save to cloud");
      }
    }
    
    toast.success("360° Tour saved successfully!");
  };

  // Load floorplan
  const loadFloorplan = () => {
    const saved = localStorage.getItem('venue_floorplan_360');
    if (saved) {
      const data = JSON.parse(saved);
      setTourName(data.name || "My Venue Tour");
      setMediaType(data.mediaType || '360photo');
      setScenes(data.scenes || []);
      setTableCounter(data.tableCounter || 1);
      if (data.scenes?.length > 0) {
        setCurrentSceneId(data.scenes.find((s: VenueScene) => s.isDefault)?.id || data.scenes[0].id);
        setFloorplanMode('editor');
      }
      toast.success("360° Tour loaded");
    } else {
      toast("No saved 360° tour found");
    }
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tour Name */}
      <Card className="border-border">
        <CardContent className="p-6">
          <Label className="text-lg font-semibold mb-3 block">Tour Name</Label>
          <Input 
            value={tourName} 
            onChange={(e) => setTourName(e.target.value)}
            placeholder="Type your tour name here..."
            className="text-lg h-12"
          />
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-primary/50 bg-primary/5">
        <CardContent className="p-12">
          <div 
            className="text-center cursor-pointer"
            onClick={() => document.getElementById('media-upload-360')?.click()}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag a 360° image here or browse</h3>
            <p className="text-muted-foreground mb-6">
              for an image to upload.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports: Equirectangular 360° JPG, PNG, WebP (recommended: 4096x2048 or higher)
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Upload className="w-5 h-5 mr-2" />
              Choose 360° File
            </Button>
          </div>
          <input 
            id="media-upload-360" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3 text-cyan-400 flex items-center gap-2">
            <Camera className="w-5 h-5" /> How to create a 360° Tour
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">1.</span>
              Take 360° photos from different areas of your venue (main floor, bar, VIP, etc.)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">2.</span>
              Upload each area as a separate scene and connect them with "Go To" hotspots
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">3.</span>
              Add tables (with seat counts), bar areas, restrooms, entry/exit points
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">4.</span>
              Customers experience this immersive view when they check-in at your venue!
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Load Existing */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={loadFloorplan} size="lg">
          Load Existing 360° Tour
        </Button>
      </div>
    </div>
  );

  // Render editor mode
  const renderEditorMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)]">
      {/* Left Toolbar - Hotspot Types */}
      <Card className="glass border-border lg:col-span-1 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Hotspot Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <Label className="text-xs text-muted-foreground">Click to select, then click on 360° view</Label>
          
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(HOTSPOT_CONFIG) as [HotspotType, typeof HOTSPOT_CONFIG[HotspotType]][]).map(([type, config]) => (
              <Button
                key={type}
                variant={hotspotTypeToAdd === type ? "default" : "outline"}
                size="sm"
                className={`h-auto py-2 px-2 flex flex-col items-center gap-1 ${hotspotTypeToAdd === type ? 'ring-2 ring-primary' : ''}`}
                onClick={() => {
                  setHotspotTypeToAdd(type);
                  setIsAddingHotspot(true);
                }}
              >
                <span className="text-lg">{config.icon}</span>
                <span className="text-xs">{config.label}</span>
              </Button>
            ))}
          </div>

          {isAddingHotspot && (
            <div className="p-3 bg-primary/20 rounded-lg border border-primary/50">
              <p className="text-xs text-center">
                <strong>Click anywhere on the 360° view</strong> to place a {HOTSPOT_CONFIG[hotspotTypeToAdd].label}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setIsAddingHotspot(false)}
              >
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
            </div>
          )}

          <div className="border-t pt-3 space-y-2">
            <Button onClick={saveFloorplan} className="w-full" size="sm">
              <Save className="h-4 w-4 mr-2" /> Save Tour
            </Button>
            <Button onClick={() => setFloorplanMode('preview')} variant="outline" className="w-full" size="sm">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main 360 Viewer */}
      <Card className="glass border-border lg:col-span-3 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {currentScene?.name || "360° Viewer"}
            </CardTitle>
            <Input 
              value={currentScene?.name || ''} 
              onChange={(e) => currentSceneId && updateSceneName(currentSceneId, e.target.value)}
              className="w-48 h-8 text-sm"
              placeholder="Scene name..."
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 min-h-0">
          <div 
            ref={viewerRef}
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
          />
          
          {/* Instructions Overlay */}
          {isAddingHotspot && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm">
                {HOTSPOT_CONFIG[hotspotTypeToAdd].icon} Click to place {HOTSPOT_CONFIG[hotspotTypeToAdd].label}
              </Badge>
            </div>
          )}
        </CardContent>

        {/* Scenes Bar */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Scenes:</Label>
            {scenes.map((scene) => (
              <div 
                key={scene.id}
                className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  currentSceneId === scene.id ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setCurrentSceneId(scene.id)}
              >
                <img 
                  src={scene.panoramaUrl} 
                  alt={scene.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                  <span className="text-xs text-white truncate w-full">{scene.name}</span>
                </div>
                {scenes.length > 1 && (
                  <button
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScene(scene.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {/* Add Scene Button */}
            <div 
              className="flex-shrink-0 w-24 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center"
              onClick={() => document.getElementById('add-scene-upload')?.click()}
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <input 
              id="add-scene-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={addNewScene}
            />
          </div>
        </div>
      </Card>

      {/* Right Panel - Hotspot Properties */}
      <Card className="glass border-border lg:col-span-1 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedHotspot ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                <span className="text-2xl">{HOTSPOT_CONFIG[selectedHotspot.type].icon}</span>
                <div>
                  <div className="font-medium">{HOTSPOT_CONFIG[selectedHotspot.type].label}</div>
                  <div className="text-xs text-muted-foreground">{HOTSPOT_CONFIG[selectedHotspot.type].description}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Label</Label>
                <Input 
                  value={selectedHotspot.text || ''} 
                  onChange={(e) => updateHotspot(selectedHotspot.id, { text: e.target.value })}
                  placeholder="Display name..."
                />
              </div>

              {selectedHotspot.type === 'table' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Table Number</Label>
                    <Input 
                      value={selectedHotspot.tableNumber || ''} 
                      onChange={(e) => updateHotspot(selectedHotspot.id, { tableNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Seats / Capacity</Label>
                    <Input 
                      type="number"
                      min={1}
                      max={20}
                      value={selectedHotspot.capacity || 4} 
                      onChange={(e) => updateHotspot(selectedHotspot.id, { capacity: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <div className="flex flex-wrap gap-1">
                      {(['available', 'occupied', 'reserved'] as const).map((status) => (
                        <Button 
                          key={status}
                          variant={selectedHotspot.status === status ? 'default' : 'outline'}
                          size="sm"
                          className={`text-xs ${selectedHotspot.status === status ? getStatusColor(status) : ''}`}
                          onClick={() => updateHotspot(selectedHotspot.id, { status })}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedHotspot.type === 'goto' && (
                <div className="space-y-2">
                  <Label className="text-xs">Navigate To Scene</Label>
                  <Select
                    value={selectedHotspot.targetScene || ''}
                    onValueChange={(value) => updateHotspot(selectedHotspot.id, { targetScene: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scenes.filter(s => s.id !== currentSceneId).map((scene) => (
                        <SelectItem key={scene.id} value={scene.id}>
                          {scene.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    When clicked, user will be taken to this area
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Position: {selectedHotspot.pitch.toFixed(1)}°, {selectedHotspot.yaw.toFixed(1)}°
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  size="sm"
                  onClick={() => deleteHotspot(selectedHotspot.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Select a hotspot to edit its properties
              </p>
            </div>
          )}

          {/* Hotspots List */}
          {currentScene && currentScene.hotspots.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">
                All Hotspots ({currentScene.hotspots.length})
              </Label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {currentScene.hotspots.map((hs) => (
                  <div 
                    key={hs.id}
                    className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm transition-all ${
                      selectedHotspot?.id === hs.id ? 'bg-primary/20 border border-primary' : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                    onClick={() => setSelectedHotspot(hs)}
                  >
                    <span>{HOTSPOT_CONFIG[hs.type].icon}</span>
                    <span className="truncate flex-1">{hs.text}</span>
                    {hs.type === 'table' && (
                      <Badge variant="secondary" className="text-xs">
                        {hs.capacity}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render preview mode (customer view)
  const renderPreviewMode = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{tourName} - Customer Preview</h2>
          <p className="text-muted-foreground">This is how customers will experience your venue when checked-in</p>
        </div>
        <Button onClick={() => setFloorplanMode('editor')}>
          <Edit className="w-4 h-4 mr-2" /> Back to Editor
        </Button>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-2">
          <div 
            ref={viewerRef}
            className="w-full rounded-lg overflow-hidden"
            style={{ height: '70vh' }}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {Object.entries(HOTSPOT_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <span className="text-sm">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Scenes Navigation */}
      {scenes.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          {scenes.map((scene) => (
            <Button
              key={scene.id}
              variant={currentSceneId === scene.id ? "default" : "outline"}
              onClick={() => setCurrentSceneId(scene.id)}
            >
              {scene.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Add custom styles for hotspots */}
      <style>{`
        .venue-hotspot {
          cursor: pointer !important;
        }
        .venue-hotspot .hotspot-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .venue-hotspot:hover .hotspot-marker {
          transform: scale(1.2);
        }
        .pnlm-container {
          background: #1a1a2e !important;
        }
      `}</style>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">360° Immersive Floorplan Editor</h1>
          <p className="text-muted-foreground">
            {floorplanMode === 'upload' && 'Upload your 360° venue media to create an immersive tour'}
            {floorplanMode === 'editor' && 'Add tables, bars, entry/exit points, and navigation hotspots'}
            {floorplanMode === 'preview' && 'Experience your venue as customers will see it'}
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
