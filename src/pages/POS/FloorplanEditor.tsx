import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useBlocker } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { 
  Save, Trash2, 
  Upload, Eye, Edit, Image as ImageIcon, Camera, Video,
  MapPin, X, Settings, Layers, Maximize2, Minimize2,
  MessageSquare, Bot, ChevronRight, Menu, PanelLeftClose, PanelLeft, AlertTriangle
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
  is360?: boolean;
  isVideo?: boolean;
}

type FloorplanMode = 'upload' | 'editor' | 'preview';
type Orientation = 'portrait' | 'landscape';

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

// Helper to check image orientation
const getImageOrientation = (file: File): Promise<Orientation> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img.width >= img.height ? 'landscape' : 'portrait');
    };
    img.onerror = () => resolve('landscape');
    img.src = URL.createObjectURL(file);
  });
};

// Helper to check video orientation  
const getVideoOrientation = (file: File): Promise<Orientation> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.videoWidth >= video.videoHeight ? 'landscape' : 'portrait');
    };
    video.onerror = () => resolve('landscape');
    video.src = URL.createObjectURL(file);
  });
};

export default function FloorplanEditor() {
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pannellumViewer = useRef<any>(null);
  
  const [floorplanMode, setFloorplanMode] = useState<FloorplanMode>('upload');
  const [tourName, setTourName] = useState("My Venue Tour");
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [showSidebar, setShowSidebar] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
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

  // Navigation blocker for unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle blocker state
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowExitDialog(true);
      setPendingNavigation(blocker.location.pathname);
    }
  }, [blocker.state]);

  // Browser beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Track changes to scenes
  useEffect(() => {
    if (scenes.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [scenes]);

  // Initialize Pannellum viewer for 360° content (images only - video handled separately)
  const initViewer = useCallback((scene: VenueScene, preserveView: boolean = false) => {
    if (!viewerRef.current || !window.pannellum || !scene.is360 || scene.isVideo) return;
    
    // Store current view position if preserving
    let currentYaw = 0;
    let currentPitch = 0;
    let currentHfov = 100;
    if (preserveView && pannellumViewer.current) {
      try {
        currentYaw = pannellumViewer.current.getYaw();
        currentPitch = pannellumViewer.current.getPitch();
        currentHfov = pannellumViewer.current.getHfov();
      } catch (e) {
        // Viewer may not be ready
      }
    }
    
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

    // Create viewer with preserved or default view
    pannellumViewer.current = window.pannellum.viewer(viewerRef.current, {
      type: "equirectangular",
      panorama: scene.panoramaUrl,
      autoLoad: true,
      showControls: true,
      compass: true,
      hotSpots: pannellumHotspots,
      hotSpotDebug: false,
      mouseZoom: true,
      draggable: true,
      friction: 0.15,
      yaw: preserveView ? currentYaw : 0,
      pitch: preserveView ? currentPitch : 0,
      hfov: preserveView ? currentHfov : 100,
      minHfov: 50,
      maxHfov: 120,
    });

    // Click handler for adding hotspots - use 'click' event instead of 'mousedown'
    pannellumViewer.current.on('mouseup', function(event: MouseEvent) {
      if (isAddingHotspot && event.button === 0) {
        const coords = pannellumViewer.current.mouseEventToCoords(event);
        if (coords) {
          addHotspotAt360(coords[0], coords[1]);
        }
      }
    });
  }, [scenes]);

  // Separate function for adding hotspot at 360 coords without causing re-render loop
  const addHotspotAt360 = useCallback((pitch: number, yaw: number) => {
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
  }, [currentSceneId, hotspotTypeToAdd, tableCounter]);

  // Re-init viewer when scene changes (full re-init)
  useEffect(() => {
    if (currentScene && floorplanMode !== 'upload' && currentScene.is360 && !currentScene.isVideo) {
      initViewer(currentScene, false);
    }
  }, [currentSceneId, floorplanMode]);

  // Refresh viewer with preserved view when hotspots change
  useEffect(() => {
    if (currentScene && floorplanMode !== 'upload' && currentScene.is360 && !currentScene.isVideo) {
      initViewer(currentScene, true);
    }
  }, [currentScene?.hotspots.length, isAddingHotspot]);

  // Handle file upload with validation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, is360: boolean = true) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    // Validate file type
    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    // Check orientation
    let fileOrientation: Orientation;
    if (isImage) {
      fileOrientation = await getImageOrientation(file);
    } else {
      fileOrientation = await getVideoOrientation(file);
    }

    // If this is not the first scene, validate orientation matches
    if (scenes.length > 0 && fileOrientation !== orientation) {
      toast.error(`This ${isVideo ? 'video' : 'image'} is ${fileOrientation}. Your tour is set to ${orientation}. Please upload ${orientation} media only.`);
      return;
    }

    // If first scene, set orientation based on file
    if (scenes.length === 0) {
      setOrientation(fileOrientation);
    }

    const fileURL = URL.createObjectURL(file);
    const newScene: VenueScene = {
      id: uuidv4(),
      name: scenes.length === 0 ? "Main Area" : `Area ${scenes.length + 1}`,
      panoramaUrl: fileURL,
      hotspots: [],
      isDefault: scenes.length === 0,
      is360: is360,
      isVideo: isVideo,
    };
    setScenes(prev => [...prev, newScene]);
    setCurrentSceneId(newScene.id);
    setFloorplanMode('editor');
    toast.success(`${is360 ? '360°' : 'Regular'} ${isVideo ? 'video' : 'image'} uploaded!`);
  };

  // Add a new scene with validation
  const addNewScene = async (event: React.ChangeEvent<HTMLInputElement>, is360: boolean = true) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    // Check orientation matches tour orientation
    let fileOrientation: Orientation;
    if (isImage) {
      fileOrientation = await getImageOrientation(file);
    } else {
      fileOrientation = await getVideoOrientation(file);
    }

    if (fileOrientation !== orientation) {
      toast.error(`This ${isVideo ? 'video' : 'image'} is ${fileOrientation}. Your tour is set to ${orientation}. Please upload ${orientation} media only.`);
      return;
    }

    const fileURL = URL.createObjectURL(file);
    const newScene: VenueScene = {
      id: uuidv4(),
      name: `Area ${scenes.length + 1}`,
      panoramaUrl: fileURL,
      hotspots: [],
      is360: is360,
      isVideo: isVideo,
    };
    setScenes(prev => [...prev, newScene]);
    setCurrentSceneId(newScene.id);
    toast.success(`Scene "${newScene.name}" added!`);
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
    
    addHotspot(y, x);
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
      orientation,
      scenes,
      tableCounter,
      tables: allTables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('venue_floorplan_360', JSON.stringify(floorplanData));
    
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("floorplans").upsert({
        name: tourName,
        venue_id: "default",
        canvas_width: 0,
        canvas_height: 0,
        items: JSON.parse(JSON.stringify({ scenes, tableCounter, tables: allTables, orientation })),
        created_by: user.id,
      });
      if (error) {
        console.error(error);
        toast.error("Failed to save to cloud");
      }
    }
    
    setHasUnsavedChanges(false);
    toast.success(`Tour saved! ${allTables.length} tables synced.`);
  };

  // Handle navigation after save/discard
  const handleExitConfirm = async (save: boolean) => {
    if (save) {
      await saveFloorplan();
    }
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const handleExitCancel = () => {
    setShowExitDialog(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  // Load floorplan
  const loadFloorplan = () => {
    const saved = localStorage.getItem('venue_floorplan_360');
    if (saved) {
      const data = JSON.parse(saved);
      setTourName(data.name || "My Venue Tour");
      setOrientation(data.orientation || 'landscape');
      setScenes(data.scenes || []);
      setTableCounter(data.tableCounter || 1);
      if (data.scenes?.length > 0) {
        setCurrentSceneId(data.scenes.find((s: VenueScene) => s.isDefault)?.id || data.scenes[0].id);
        setFloorplanMode('editor');
      }
      toast.success("Tour loaded");
    } else {
      toast("No saved tour found");
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

      {/* Orientation Selection */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6">
          <Label className="text-lg font-semibold mb-3 block">Tour Orientation</Label>
          <p className="text-sm text-muted-foreground mb-4">
            All media you upload must match this orientation.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                orientation === 'landscape' 
                  ? 'border-primary bg-primary/20' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setOrientation('landscape')}
            >
              <div className="w-full h-20 bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
                <div className="w-16 h-10 bg-primary/50 rounded border-2 border-primary" />
              </div>
              <h4 className="font-semibold text-center">Landscape (Horizontal)</h4>
              <p className="text-xs text-muted-foreground text-center">Best for tablets & desktops</p>
            </div>
            <div 
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                orientation === 'portrait' 
                  ? 'border-primary bg-primary/20' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setOrientation('portrait')}
            >
              <div className="w-full h-20 bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
                <div className="w-10 h-16 bg-primary/50 rounded border-2 border-primary" />
              </div>
              <h4 className="font-semibold text-center">Portrait (Vertical)</h4>
              <p className="text-xs text-muted-foreground text-center">Best for mobile phones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashed border-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-8">
            <div 
              className="text-center cursor-pointer"
              onClick={() => document.getElementById('media-upload-360')?.click()}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">360° Photo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload equirectangular 360° image for immersive experience
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Upload className="w-5 h-5 mr-2" />
                Upload 360° Image
              </Button>
            </div>
            <input 
              id="media-upload-360" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, true)}
            />
          </CardContent>
        </Card>

        {/* 360 Video Option */}
        <Card className="border-dashed border-2 border-violet-500/50 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
          <CardContent className="p-8">
            <div 
              className="text-center cursor-pointer"
              onClick={() => document.getElementById('media-upload-360-video')?.click()}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Video className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">360° Video</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload equirectangular 360° video for immersive experience
              </p>
              <Button size="lg" className="bg-violet-500 hover:bg-violet-600">
                <Upload className="w-5 h-5 mr-2" />
                Upload 360° Video
              </Button>
            </div>
            <input 
              id="media-upload-360-video" 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, true)}
            />
          </CardContent>
        </Card>

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
                Upload Regular Media
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
              Take 360° photos from different areas of your venue
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">2.</span>
              Upload each area as a separate scene and connect with "Go To" hotspots
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">3.</span>
              Add tables, bar areas, restrooms, entry/exit points
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">4.</span>
              Customers experience this when they check-in at your venue!
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={loadFloorplan} size="lg">
          Load Existing Tour
        </Button>
      </div>
    </div>
  );

  // Render editor mode - FULLSCREEN WITHOUT SIDEBAR
  const renderEditorMode = () => (
    <div className="flex h-full">
      {/* Left Toolbar - Hotspot Types */}
      <div className="w-56 flex-shrink-0 bg-card border-r border-border overflow-y-auto p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4" />
          <span className="font-semibold text-sm">Hotspot Tools</span>
        </div>
        <p className="text-xs text-muted-foreground">Click to select, then click on view</p>
        
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
              <strong>Click anywhere</strong> to place {HOTSPOT_CONFIG[hotspotTypeToAdd].label}
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

        {/* Orientation Indicator */}
        <div className="border-t pt-3">
          <div className="p-2 rounded-lg bg-secondary/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Tour Orientation</p>
            <Badge variant="outline" className="text-xs">
              {orientation === 'landscape' ? '↔️ Landscape' : '↕️ Portrait'}
            </Badge>
            <p className="text-[10px] text-muted-foreground mt-1">
              All scenes must be {orientation}
            </p>
          </div>
        </div>
      </div>

      {/* Main Viewer */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Bar */}
        <div className="flex-shrink-0 h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <Camera className="w-4 h-4" />
            <span className="font-medium">{currentScene?.name || "Viewer"}</span>
            {currentScene?.is360 ? (
              <Badge variant="secondary" className="text-xs">360°</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Regular</Badge>
            )}
          </div>
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

        {/* Viewer Area - Fits content properly */}
        <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-background/50 relative">
          {currentScene?.is360 && currentScene?.isVideo ? (
            // 360 Video Player
            <div className="relative rounded-lg overflow-hidden bg-black"
              style={{ 
                maxHeight: 'calc(100vh - 220px)',
                width: '100%',
                maxWidth: orientation === 'landscape' ? '1200px' : '400px',
                aspectRatio: orientation === 'landscape' ? '16/9' : '9/16'
              }}
            >
              <video 
                ref={videoRef}
                src={currentScene.panoramaUrl}
                className="w-full h-full object-cover"
                controls
                loop
                playsInline
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-violet-500">360° Video</Badge>
              </div>
              <p className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
                Note: Full 360° video playback requires VR headset or mobile device
              </p>
              {/* Hotspots overlay for video */}
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
          ) : currentScene?.is360 ? (
            // 360 Image via Pannellum
            <div 
              ref={viewerRef}
              className="w-full h-full rounded-lg overflow-hidden"
              style={{ 
                maxHeight: 'calc(100vh - 220px)',
                aspectRatio: orientation === 'landscape' ? '16/9' : '9/16'
              }}
            />
          ) : currentScene?.isVideo ? (
            // Regular Video
            <div 
              className="relative rounded-lg overflow-hidden bg-black"
              style={{ 
                maxHeight: 'calc(100vh - 220px)',
                maxWidth: '100%'
              }}
              onClick={handleRegularImageClick}
            >
              <video 
                src={currentScene?.panoramaUrl}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
                controls
                loop
                playsInline
              />
              {/* Hotspots overlay */}
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
          ) : (
            // Regular Image
            <div 
              className="relative rounded-lg overflow-hidden cursor-crosshair bg-black"
              style={{ 
                maxHeight: 'calc(100vh - 220px)',
                maxWidth: '100%'
              }}
              onClick={handleRegularImageClick}
            >
              <img 
                src={currentScene?.panoramaUrl} 
                alt={currentScene?.name}
                className="max-w-full max-h-full object-contain"
                style={{ 
                  maxHeight: 'calc(100vh - 220px)'
                }}
              />
              {/* Hotspots overlay */}
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
          
          {isAddingHotspot && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm">
                {HOTSPOT_CONFIG[hotspotTypeToAdd].icon} Click to place {HOTSPOT_CONFIG[hotspotTypeToAdd].label}
              </Badge>
            </div>
          )}
        </div>

        {/* Scenes Bar */}
        <div className="flex-shrink-0 h-24 border-t border-border bg-card px-4 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Scenes:</span>
          {scenes.map((scene) => (
            <div 
              key={scene.id}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
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
                <span className="text-[10px] text-white truncate w-full">{scene.name}</span>
              </div>
              {scene.is360 && (
                <Badge className="absolute top-0.5 left-0.5 text-[8px] px-1 py-0 h-4">360°</Badge>
              )}
              {scenes.length > 1 && (
                <button
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600"
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
          
          <div className="flex gap-2 flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary cursor-pointer flex flex-col items-center justify-center text-xs text-primary"
              onClick={() => document.getElementById('add-scene-360')?.click()}
            >
              <Camera className="w-4 h-4 mb-1" />
              +360°
            </div>
            <div 
              className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center text-xs"
              onClick={() => document.getElementById('add-scene-regular')?.click()}
            >
              <ImageIcon className="w-4 h-4 mb-1" />
              +Img
            </div>
          </div>
          <input 
            id="add-scene-360" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => addNewScene(e, true)}
          />
          <input 
            id="add-scene-regular" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => addNewScene(e, false)}
          />
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-56 flex-shrink-0 bg-card border-l border-border overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4" />
          <span className="font-semibold text-sm">Properties</span>
        </div>
        
        {selectedHotspot ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <span className="text-2xl">{HOTSPOT_CONFIG[selectedHotspot.type].icon}</span>
              <div>
                <div className="font-medium text-sm">{HOTSPOT_CONFIG[selectedHotspot.type].label}</div>
                <div className="text-[10px] text-muted-foreground">{HOTSPOT_CONFIG[selectedHotspot.type].description}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Label</Label>
              <Input 
                value={selectedHotspot.text || ''} 
                onChange={(e) => updateHotspot(selectedHotspot.id, { text: e.target.value })}
                placeholder="Display name..."
                className="h-8 text-sm"
              />
            </div>

            {selectedHotspot.type === 'table' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Table Number</Label>
                  <Input 
                    value={selectedHotspot.tableNumber || ''} 
                    onChange={(e) => updateHotspot(selectedHotspot.id, { tableNumber: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Seats</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={20}
                    value={selectedHotspot.capacity || 4} 
                    onChange={(e) => updateHotspot(selectedHotspot.id, { capacity: parseInt(e.target.value) })}
                    className="h-8 text-sm"
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
                        className={`text-[10px] h-6 px-2 ${selectedHotspot.status === status ? getStatusColor(status) : ''}`}
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
                  <SelectTrigger className="h-8 text-sm">
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
                <p className="text-[10px] text-muted-foreground">
                  When clicked, user goes to this area
                </p>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <div className="text-[10px] text-muted-foreground">
                Position: {selectedHotspot.pitch.toFixed(1)}°, {selectedHotspot.yaw.toFixed(1)}°
              </div>
              <Button 
                variant="destructive" 
                className="w-full"
                size="sm"
                onClick={() => deleteHotspot(selectedHotspot.id)}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Select a hotspot to edit its properties
            </p>
          </div>
        )}

        {/* Hotspots List */}
        {currentScene && currentScene.hotspots.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Label className="text-xs text-muted-foreground mb-2 block">
              All Hotspots ({currentScene.hotspots.length})
            </Label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {currentScene.hotspots.map((hs) => (
                <div 
                  key={hs.id}
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 text-xs transition-all ${
                    selectedHotspot?.id === hs.id ? 'bg-primary/20 border border-primary' : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                  onClick={() => setSelectedHotspot(hs)}
                >
                  <span>{HOTSPOT_CONFIG[hs.type].icon}</span>
                  <span className="truncate flex-1">{hs.text}</span>
                  {hs.type === 'table' && (
                    <Badge variant="secondary" className="text-[10px]">
                      {hs.capacity}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render preview mode - FULLSCREEN with proper sizing
  const renderPreviewMode = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center justify-between px-6 bg-card">
        <div>
          <h2 className="text-lg font-bold">{tourName} - Customer Preview</h2>
          <p className="text-xs text-muted-foreground">This is how customers experience your venue when checked-in</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAIChat(true)}>
            <Bot className="w-4 h-4 mr-2" /> AI Waiter
          </Button>
          <Button size="sm" onClick={() => setFloorplanMode('editor')}>
            <Edit className="w-4 h-4 mr-2" /> Back to Editor
          </Button>
        </div>
      </div>

      {/* Main Preview Area - Properly sized */}
      <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-background/50">
        {currentScene?.is360 ? (
          <div 
            ref={viewerRef}
            className="rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              width: '100%',
              maxWidth: orientation === 'landscape' ? '1200px' : '400px',
              aspectRatio: orientation === 'landscape' ? '16/9' : '9/16',
              maxHeight: 'calc(100vh - 280px)'
            }}
          />
        ) : (
          <div 
            className="relative rounded-lg overflow-hidden shadow-2xl bg-black"
            style={{ 
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 280px)'
            }}
          >
            <img 
              src={currentScene?.panoramaUrl} 
              alt={currentScene?.name}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 280px)' }}
            />
            {/* Hotspots */}
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
        
        {/* AI Chat Floating Button */}
        <Button
          className="fixed bottom-24 right-8 rounded-full w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg z-20"
          onClick={() => setShowAIChat(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 py-3 border-t border-border bg-card">
        <div className="flex items-center justify-center gap-4 flex-wrap mb-3">
          {Object.entries(HOTSPOT_CONFIG).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="text-lg">{config.icon}</span>
              <span className="text-xs">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Scenes Navigation */}
        {scenes.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {scenes.map((scene) => (
              <Button
                key={scene.id}
                variant={currentSceneId === scene.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSceneId(scene.id)}
              >
                {scene.name}
              </Button>
            ))}
          </div>
        )}

        {/* Orientation Indicator */}
        <div className="flex justify-center mt-2">
          <Badge variant="outline" className="text-xs">
            {orientation === 'landscape' ? '↔️ Landscape Mode' : '↕️ Portrait Mode'}
          </Badge>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIChat
          context="ai_waiter"
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );

  // Custom styles
  const hotspotStyles = `
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
  `;

  // FULLSCREEN MODE - Editor or Preview (no sidebar)
  if (isFullscreen && floorplanMode !== 'upload') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <style>{hotspotStyles}</style>

        {/* Top Header Bar */}
        <div className="flex-shrink-0 h-12 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-8 w-8 p-0"
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
            <h1 className="text-lg font-bold">{tourName}</h1>
            <Badge>{floorplanMode === 'editor' ? 'Editor' : 'Preview'}</Badge>
            <Badge variant="outline" className="text-xs">
              {orientation === 'landscape' ? '↔️' : '↕️'} {orientation}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {floorplanMode === 'editor' && renderEditorMode()}
          {floorplanMode === 'preview' && renderPreviewMode()}
        </div>
      </div>
    );
  }

  // NON-FULLSCREEN MODE (with sidebar) - mostly upload mode
  return (
    <div className="p-6">
      <style>{hotspotStyles}</style>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">360° Immersive Floorplan Editor</h1>
          <p className="text-muted-foreground">
            {floorplanMode === 'upload' && 'Upload your venue media to create an immersive tour'}
            {floorplanMode === 'editor' && 'Add tables, bars, entry/exit points, and navigation hotspots'}
            {floorplanMode === 'preview' && 'Experience your venue as customers will see it'}
          </p>
        </div>
        
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

      {/* Fullscreen button when in editor/preview but not fullscreen */}
      {floorplanMode !== 'upload' && (
        <Button 
          className="fixed bottom-6 right-6 z-40"
          onClick={() => setIsFullscreen(true)}
        >
          <Maximize2 className="w-4 h-4 mr-2" /> Go Fullscreen
        </Button>
      )}

      {floorplanMode === 'upload' && renderUploadMode()}
      {floorplanMode === 'editor' && renderEditorMode()}
      {floorplanMode === 'preview' && renderPreviewMode()}

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to your floorplan. Would you like to save before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleExitCancel}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={() => handleExitConfirm(false)}>
              Discard Changes
            </Button>
            <AlertDialogAction onClick={() => handleExitConfirm(true)}>
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
