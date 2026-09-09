import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Activity, 
  Eye, 
  EyeOff, 
  Radio, 
  Info, 
  Zap,
  ShieldCheck,
  AlertOctagon,
  Scan
} from 'lucide-react';
import CameraDetailModal from './CameraDetailModal';

// High-fidelity surveillance snapshots tailored for specific security zones
const SURVEILLANCE_BACKGROUNDS = {
  'Perimeter': 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
  'Lobby & Reception': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  'High Security Zone': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Logistics & Freight': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
  'Executive Suite': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
  'Emergency Routes': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  'Parking Facility': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
  'General': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80'
};

export default function CameraCard({ camera, onTestConnection, activeDetection = null }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [timecode, setTimecode] = useState('');
  const containerRef = useRef(null);

  const isOnline = camera.status === 'online';

  // Live timecode updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const isoTime = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
      setTimecode(isoTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 200);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const bgImage = SURVEILLANCE_BACKGROUNDS[camera.zone] || SURVEILLANCE_BACKGROUNDS['General'];

  // Check if there is an active live detection on this camera
  const hasLiveDetection = activeDetection && (
    activeDetection.camera_id === camera.camera_id || 
    activeDetection.camera_id === camera.id
  );

  const boundingBoxes = hasLiveDetection 
    ? (activeDetection.bounding_boxes || []) 
    : [
        { x: 35, y: 25, width: 30, height: 50, label: isOnline ? "Person Track [01]" : "No Signal", confidence: 0.94 }
      ];

  return (
    <>
      <div 
        ref={containerRef}
        data-testid={`camera-card-${camera.camera_id}`}
        className={`group relative rounded-lg bg-[#10141d] border ${
          hasLiveDetection && activeDetection.watchlist_match
            ? 'border-red-500 shadow-lg shadow-red-500/20 glow-crimson'
            : 'border-[#1e2638] hover:border-[#2e3e60]'
        } overflow-hidden transition-all duration-300 flex flex-col`}
      >
        {/* Top Camera Header Bar */}
        <div className="bg-[#0b0e14]/90 px-3 py-2 border-b border-[#1e2638] flex items-center justify-between z-20">
          <div className="flex items-center space-x-2 truncate">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="font-mono-hud font-bold text-xs text-slate-200 uppercase tracking-wide">
              {camera.camera_id}
            </span>
            <span className="text-slate-400 text-xs truncate max-w-[140px] sm:max-w-[200px]" title={camera.name}>
              {camera.name}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="px-1.5 py-0.5 text-[9px] font-mono-hud font-semibold rounded bg-[#182030] text-blue-300 border border-blue-900/60 uppercase">
              {camera.zone}
            </span>
            <button
              data-testid={`cam-details-btn-${camera.camera_id}`}
              onClick={() => setShowDetailModal(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a2335] transition-colors"
              title="Camera Technical Diagnostics"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              data-testid={`cam-fullscreen-btn-${camera.camera_id}`}
              onClick={toggleFullscreen}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a2335] transition-colors"
              title="Fullscreen Spotlight"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Surveillance View Area */}
        <div className="relative w-full aspect-video bg-black overflow-hidden select-none">
          {isOnline ? (
            <>
              <img 
                src={bgImage} 
                alt={camera.name}
                className="w-full h-full object-cover filter contrast-125 brightness-90 saturate-75 opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              {/* Surveillance scanline overlay */}
              <div className="absolute inset-0 surveillance-overlay" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0f14] text-slate-600">
              <AlertOctagon className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
              <p className="font-mono-hud text-xs text-red-400 tracking-wider">FEED OFFLINE / NO SIGNAL</p>
              <p className="text-[10px] text-slate-400 mt-1">Check network connection or RTSP stream</p>
            </div>
          )}

          {/* AI Bounding Box Overlays */}
          {isOnline && showOverlays && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {boundingBoxes.map((box, idx) => {
                const isTargetMatch = hasLiveDetection && activeDetection.watchlist_match;
                return (
                  <div
                    key={idx}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`
                    }}
                    className={`absolute border-2 transition-all duration-300 ${
                      isTargetMatch
                        ? 'border-red-500 bg-red-500/15 glow-crimson animate-pulse'
                        : 'border-emerald-400/90 bg-emerald-500/10'
                    }`}
                  >
                    {/* Bounding Box Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                    {/* AI Label & Confidence */}
                    <div className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[9px] font-mono-hud font-bold uppercase rounded shadow ${
                      isTargetMatch ? 'bg-red-600 text-white' : 'bg-emerald-600/95 text-slate-950'
                    }`}>
                      {box.label} • {Math.round((box.confidence || 0.94) * 100)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CCTV HUD Telemetry Overlay */}
          <div className="absolute inset-0 p-2.5 flex flex-col justify-between pointer-events-none z-10 text-white font-mono-hud text-[10px]">
            {/* Top HUD */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-bold tracking-wider">REC</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-200">{timecode}</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                <span className="text-emerald-400 font-semibold">{camera.fps || 30} FPS</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{camera.resolution || '1080p'}</span>
              </div>
            </div>

            {/* Bottom HUD */}
            <div className="flex items-center justify-between">
              <div className="bg-black/70 px-2 py-1 rounded backdrop-blur-sm border border-slate-800">
                <p className="text-slate-300 font-semibold">{camera.location}</p>
                <p className="text-[9px] text-blue-400">AI: FACE + PERSON DETECT</p>
              </div>

              {hasLiveDetection && activeDetection.watchlist_match && (
                <div className="bg-red-600/90 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-bounce flex items-center space-x-1">
                  <AlertOctagon className="w-3 h-3" />
                  <span>WATCHLIST MATCH: {activeDetection.watchlist_target_name || activeDetection.person_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Card Controls & Statistics */}
        <div className="bg-[#0e121a] px-3 py-2 border-t border-[#1e2638] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="font-mono-hud text-[11px] text-slate-300">
              Detections: <strong className="text-blue-400">{camera.detection_count || 0}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              data-testid={`toggle-ai-overlay-${camera.camera_id}`}
              onClick={() => setShowOverlays(!showOverlays)}
              className={`flex items-center space-x-1 text-[10px] font-mono-hud px-2 py-1 rounded border transition-colors ${
                showOverlays 
                  ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                  : 'bg-[#151a24] text-slate-500 border-[#1e2638]'
              }`}
              title="Toggle AI Bounding Box HUD"
            >
              {showOverlays ? <Eye className="w-3 h-3 text-blue-400" /> : <EyeOff className="w-3 h-3" />}
              <span>AI HUD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Diagnostic & Configuration Modal */}
      {showDetailModal && (
        <CameraDetailModal 
          camera={camera} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
    </>
  );
}
