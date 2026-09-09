import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import CameraCard from '../components/cctv/CameraCard';
import { 
  Video, 
  Grid2X2, 
  Grid3X3, 
  Square, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Layers,
  Radio,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function LiveCameras() {
  const { API } = useAuth();
  const { latestDetection } = useWebSocket();
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridLayout, setGridLayout] = useState('grid-4'); // grid-1, grid-2, grid-4, grid-8
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCameras = async () => {
    try {
      const response = await axios.get(`${API}/cameras`, { withCredentials: true });
      setCameras(response.data);
      setFilteredCameras(response.data);
    } catch (err) {
      console.error('Failed to load cameras', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [API]);

  // Filter logic
  useEffect(() => {
    let result = [...cameras];

    if (selectedZone !== 'ALL') {
      result = result.filter(c => c.zone === selectedZone);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.camera_id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }

    setFilteredCameras(result);
  }, [cameras, selectedZone, statusFilter, searchQuery]);

  const uniqueZones = ['ALL', ...new Set(cameras.map(c => c.zone).filter(Boolean))];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Grid Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              Live Camera Matrix ({filteredCameras.length} Feeds)
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Real-time multi-channel surveillance matrix with AI bounding box overlays
          </p>
        </div>

        {/* Layout Switcher Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400 mr-1 hidden sm:inline">LAYOUT:</span>
          <button
            data-testid="layout-single-btn"
            onClick={() => setGridLayout('grid-1')}
            className={`p-2 rounded border transition-colors ${
              gridLayout === 'grid-1' 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-[#121620] text-slate-400 border-[#1e2638] hover:text-white'
            }`}
            title="Single Spotlight View"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            data-testid="layout-2x2-btn"
            onClick={() => setGridLayout('grid-2')}
            className={`p-2 rounded border transition-colors ${
              gridLayout === 'grid-2' 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-[#121620] text-slate-400 border-[#1e2638] hover:text-white'
            }`}
            title="2x2 Medium Grid"
          >
            <Grid2X2 className="w-4 h-4" />
          </button>
          <button
            data-testid="layout-4x4-btn"
            onClick={() => setGridLayout('grid-4')}
            className={`p-2 rounded border transition-colors ${
              gridLayout === 'grid-4' 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-[#121620] text-slate-400 border-[#1e2638] hover:text-white'
            }`}
            title="4 Column Matrix"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <button
            data-testid="refresh-cameras-btn"
            onClick={fetchCameras}
            className="p-2 rounded bg-[#121620] hover:bg-[#1a2130] text-slate-400 hover:text-white border border-[#1e2638] transition-colors"
            title="Refresh Camera Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#10141f] p-3 rounded-xl border border-[#1e2638] flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            data-testid="camera-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Camera Name, ID, or Location..."
            className="w-full bg-[#161c28] border border-[#222c40] focus:border-blue-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono-hud"
          />
        </div>

        {/* Zone Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Zone:</span>
          <select
            data-testid="zone-filter-select"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-[#161c28] border border-[#222c40] rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono-hud"
          >
            {uniqueZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Status:</span>
          <select
            data-testid="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161c28] border border-[#222c40] rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono-hud"
          >
            <option value="ALL">All Statuses</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
          </select>
        </div>
      </div>

      {/* Dynamic N-Camera Grid Layout */}
      {loading ? (
        <div className="h-96 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center justify-center font-mono-hud text-slate-500">
          Loading Security Feeds...
        </div>
      ) : filteredCameras.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#10141f] border border-[#1e2638] space-y-2">
          <Video className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="font-display font-bold text-base text-slate-300">No Cameras Match Current Filters</p>
          <p className="text-xs font-mono-hud text-slate-500">Try adjusting your zone, status, or search query</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          gridLayout === 'grid-1' ? 'grid-cols-1 max-w-4xl mx-auto' :
          gridLayout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {filteredCameras.map((cam) => (
            <CameraCard 
              key={cam.id || cam.camera_id} 
              camera={cam} 
              activeDetection={latestDetection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
