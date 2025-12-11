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
  Utensils, Music, Navigation, X, Settings, Layers, Maximize2, Minimize2,
  MessageSquare, Bot
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AIChat from "@/components/Customer/AIChat";

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
  targetScene?: string;
  capacity?: number;
  tableNumber?: string;
  status?: 'available' | 'occupied' | 'reserved';
}

interface VenueScene {
  id: string;
  name: string;
  panoramaUrl: string;
  hotspots: VenueHotspot[];
  isDefault?: boolean;
  is360?: boolean; // Track if this is a 360° or regular image
}

type FloorplanMode = 'upload' | 'editor' | 'preview';
type MediaType = '360photo' | '360video' | 'regular';

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
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen
  const [showAIChat, setShowAIChat] = useState(false);
  
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

  // Initialize Pannellum viewer for 360° content
  const initViewer = useCallback((scene: VenueScene) => {
    if (!viewerRef.current || !window.pannellum || !scene.is360) return;
    
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
      hotSpotDebug: isAddingHotspot,
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
        if (event.button === 0) {
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
    if (currentScene && floorplanMode !== 'upload' && currentScene.is360) {
      initViewer(currentScene);
    }
  }, [currentSceneId, currentScene, floorplanMode, initViewer]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, is360: boolean = true) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const newScene: VenueScene = {
        id: uuidv4(),
        name: scenes.length === 0 ? "Main Area" : `Area ${scenes.length + 1}`,
        panoramaUrl: fileURL,
        hotspots: [],
        isDefault: scenes.length === 0,
        is360: is360,
      };
      setScenes(prev => [...prev, newScene]);
      setCurrentSceneId(newScene.id);
      setFloorplanMode('editor');
      toast.success(`${is360 ? '360°' : 'Regular'} media uploaded! Click anywhere to add hotspots.`);
    }
  };

  // Add a new scene
  const addNewScene = (event: React.ChangeEvent<HTMLInputElement>, is360: boolean = true) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const newScene: VenueScene = {
        id: uuidv4(),
        name: `Area ${scenes.length + 1}`,
        panoramaUrl: fileURL,
        hotspots: [],
        is360: is360,
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

  // Add hotspot for regular images (click position based)
  const handleRegularImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHotspot || !currentScene || currentScene.is360) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    addHotspot(y, x); // Using pitch/yaw as y/x percentages for regular images
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

  // Save floorplan - syncs to Tables, VenueHome, and EndUser views
  const saveFloorplan = async () => {
    // Extract all tables from all scenes
    const allTables = scenes.flatMap(scene => 
      scene.hotspots
        .filter(hs => hs.type === 'table')
        .map(hs => ({
          id: hs.id,
          tableNumber: hs.tableNumber || hs.text,
          capacity: hs.capacity || 4,
          status: hs.status || 'available',
          sceneId: scene.id,
          sceneName: scene.name,
          pitch: hs.pitch,
          yaw: hs.yaw,
        }))
    );

    const floorplanData = {
      name: tourName,
      mediaType,
      scenes,
      tableCounter,
      tables: allTables, // Include extracted tables for sync
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to localStorage for all views to access
    localStorage.setItem('venue_floorplan_360', JSON.stringify(floorplanData));
    
    // Also save tables in format expected by Tables page
    const tablesForPOS = allTables.map((t, i) => ({
      id: t.id,
      number: t.tableNumber?.replace('T', '') || String(i + 1),
      capacity: t.capacity,
      status: t.status,
      section: t.sceneName,
      x: t.yaw,
      y: t.pitch,
    }));
    localStorage.setItem('venue_tables_sync', JSON.stringify(tablesForPOS));
    
    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("floorplans").upsert({
        name: tourName,
        venue_id: "default",
        canvas_width: 0,
        canvas_height: 0,
        items: JSON.parse(JSON.stringify({ scenes, tableCounter, tables: allTables })),
        created_by: user.id,
      });
      if (error) {
        console.error(error);
        toast.error("Failed to save to cloud");
      }
    }
    
    toast.success(`360° Tour saved! ${allTables.length} tables synced to all views.`);
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
    <div className="space-y-6 max-w-4xl mx-auto p-8">
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

      {/* Upload Options - 360° or Regular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 360° Upload */}
        <Card className="border-dashed border-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-8">
            <div 
              className="text-center cursor-pointer"
              onClick={() => document.getElementById('media-upload-360')?.click()}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">360° Photo/Video</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload equirectangular 360° media for immersive experience
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Upload className="w-5 h-5 mr-2" />
                Upload 360°
              </Button>
            </div>
            <input 
              id="media-upload-360" 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, true)}
            />
          </CardContent>
        </Card>

        {/* Regular Upload */}
        <Card className="border-dashed border-2 border-secondary/50 bg-secondary/5 hover:bg-secondary/10 transition-colors">
          <CardContent className="p-8">
            <div 
              className="text-center cursor-pointer"
              onClick={() => document.getElementById('media-upload-regular')?.click()}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Regular Photo/Video</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload standard photos or videos of your venue
              </p>
              <Button size="lg" variant="secondary">
                <Upload className="w-5 h-5 mr-2" />
                Upload Regular
              </Button>
            </div>
            <input 
              id="media-upload-regular" 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, false)}
            />
          </CardContent>
        </Card>
      </div>

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
          Load Existing Tour
        </Button>
      </div>
    </div>
  );

  // Render editor mode
  const renderEditorMode = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 ${isFullscreen ? 'h-screen p-4' : 'h-[calc(100vh-200px)]'}`}>
      {/* Left Toolbar - Hotspot Types */}
      <Card className="glass border-border lg:col-span-1 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Hotspot Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <Label className="text-xs text-muted-foreground">Click to select, then click on view</Label>
          
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
                <strong>Click anywhere on the view</strong> to place a {HOTSPOT_CONFIG[hotspotTypeToAdd].label}
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

      {/* Main Viewer */}
      <Card className="glass border-border lg:col-span-3 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {currentScene?.name || "Viewer"}
              {currentScene?.is360 ? (
                <Badge variant="secondary" className="text-xs">360°</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Regular</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input 
                value={currentScene?.name || ''} 
                onChange={(e) => currentSceneId && updateSceneName(currentSceneId, e.target.value)}
                className="w-36 h-8 text-sm"
                placeholder="Scene name..."
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 min-h-0 relative">
          {currentScene?.is360 ? (
            // 360° Viewer
            <div 
              ref={viewerRef}
              className="w-full h-full rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
            />
          ) : (
            // Regular Image Viewer with hotspot overlay
            <div 
              className="w-full h-full rounded-lg overflow-hidden relative cursor-crosshair"
              style={{ minHeight: '400px' }}
              onClick={handleRegularImageClick}
            >
              <img 
                src={currentScene?.panoramaUrl} 
                alt={currentScene?.name}
                className="w-full h-full object-cover"
              />
              {/* Render hotspots on regular image */}
              {currentScene?.hotspots.map((hs) => (
                <div
                  key={hs.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                    selectedHotspot?.id === hs.id ? 'scale-125 z-10' : ''
                  }`}
                  style={{ left: `${hs.yaw}%`, top: `${hs.pitch}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspot(hs);
                  }}
                >
                  <div className={`${HOTSPOT_CONFIG[hs.type].color} rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border-2 border-white animate-pulse`}>
                    {HOTSPOT_CONFIG[hs.type].icon}
                  </div>
                </div>
              ))}
            </div>
          )}
          
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
                {scene.is360 && (
                  <Badge className="absolute top-1 left-1 text-[8px] px-1 py-0">360°</Badge>
                )}
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
            
            {/* Add Scene Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <div 
                className="w-20 h-16 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary cursor-pointer flex flex-col items-center justify-center text-xs text-primary"
                onClick={() => document.getElementById('add-scene-360')?.click()}
              >
                <Camera className="w-4 h-4 mb-1" />
                +360°
              </div>
              <div 
                className="w-20 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center text-xs"
                onClick={() => document.getElementById('add-scene-regular')?.click()}
              >
                <ImageIcon className="w-4 h-4 mb-1" />
                +Regular
              </div>
            </div>
            <input 
              id="add-scene-360" 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={(e) => addNewScene(e, true)}
            />
            <input 
              id="add-scene-regular" 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={(e) => addNewScene(e, false)}
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
    <div className={`space-y-4 ${isFullscreen ? 'h-screen p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{tourName} - Customer Preview</h2>
          <p className="text-muted-foreground">This is how customers will experience your venue when checked-in</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIChat(true)}>
            <Bot className="w-4 h-4 mr-2" /> AI Waiter
          </Button>
          <Button onClick={() => setFloorplanMode('editor')}>
            <Edit className="w-4 h-4 mr-2" /> Back to Editor
          </Button>
        </div>
      </div>

      <Card className="glass border-border relative">
        <CardContent className="p-2">
          {currentScene?.is360 ? (
            <div 
              ref={viewerRef}
              className="w-full rounded-lg overflow-hidden"
              style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '70vh' }}
            />
          ) : (
            <div 
              className="w-full rounded-lg overflow-hidden relative"
              style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '70vh' }}
            >
              <img 
                src={currentScene?.panoramaUrl} 
                alt={currentScene?.name}
                className="w-full h-full object-cover"
              />
              {/* Render hotspots */}
              {currentScene?.hotspots.map((hs) => (
                <div
                  key={hs.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${hs.yaw}%`, top: `${hs.pitch}%` }}
                  onClick={() => {
                    if (hs.type === 'goto' && hs.targetScene) {
                      setCurrentSceneId(hs.targetScene);
                    } else {
                      toast.info(`${HOTSPOT_CONFIG[hs.type].label}: ${hs.text}`);
                    }
                  }}
                >
                  <div className={`${HOTSPOT_CONFIG[hs.type].color} rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border-2 border-white animate-pulse`}>
                    {HOTSPOT_CONFIG[hs.type].icon}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* AI Chat Floating Button */}
        <Button
          className="absolute bottom-4 right-4 rounded-full w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg"
          onClick={() => setShowAIChat(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
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
              {scene.is360 && <Badge variant="secondary" className="ml-2 text-xs">360°</Badge>}
            </Button>
          ))}
        </div>
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIChat
          context="ai_waiter"
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );

  // Fullscreen wrapper
  if (isFullscreen && floorplanMode !== 'upload') {
    return (
      <div className="fixed inset-0 z-50 bg-background">
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

        {/* Minimal header for fullscreen */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
          <h1 className="text-xl font-bold">{tourName}</h1>
          <Badge>{floorplanMode === 'editor' ? 'Editor' : 'Preview'}</Badge>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(false)}
          >
            <Minimize2 className="w-4 h-4 mr-2" /> Exit Fullscreen
          </Button>
          {floorplanMode === 'editor' && (
            <Button size="sm" onClick={() => setFloorplanMode('upload')}>
              <Upload className="w-4 h-4 mr-2" /> New Upload
            </Button>
          )}
        </div>

        {floorplanMode === 'editor' && renderEditorMode()}
        {floorplanMode === 'preview' && renderPreviewMode()}
      </div>
    );
  }

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
