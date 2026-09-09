import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  Camera, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  RefreshCw, 
  CheckCircle2, 
  AlertOctagon, 
  Wifi,
  Layers,
  Activity,
  Sliders
} from 'lucide-react';
import CameraDetailModal from '../components/cctv/CameraDetailModal';

export default function CameraManagement() {
  const { API, isAdmin, isOperator } = useAuth();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCamDiagnostic, setSelectedCamDiagnostic] = useState(null);

  // Add Camera Form
  const [cameraId, setCameraId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('Perimeter');
  const [streamUrl, setStreamUrl] = useState('rtsp://camera.internal.local:554/live');
  const [resolution, setResolution] = useState('1080p (1920x1080)');
  const [fps, setFps] = useState(30);
  const [status, setStatus] = useState('online');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCameras = async () => {
    try {
      const response = await axios.get(`${API}/cameras`, { withCredentials: true });
      setCameras(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load cameras list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [API]);

  const handleAddCamera = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/cameras`,
        {
          camera_id: cameraId,
          name,
          location,
          zone,
          stream_url: streamUrl,
          resolution,
          fps: parseInt(fps),
          status,
          notes
        },
        { withCredentials: true }
      );
      toast.success(`Camera ${cameraId} successfully registered`);
      setShowAddModal(false);
      setCameraId('');
      setName('');
      setLocation('');
      setNotes('');
      fetchCameras();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add camera: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCamera = async (camIdStr) => {
    if (!window.confirm('Are you sure you want to delete this camera feed configuration?')) return;
    try {
      await axios.delete(`${API}/cameras/${camIdStr}`, { withCredentials: true });
      toast.success('Camera removed from surveillance network');
      fetchCameras();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete camera');
    }
  };

  const handleToggleStatus = async (cam) => {
    const newStatus = cam.status === 'online' ? 'offline' : 'online';
    try {
      await axios.put(
        `${API}/cameras/${cam.id || cam.camera_id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Camera ${cam.camera_id} set to ${newStatus.toUpperCase()}`);
      fetchCameras();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const filteredCameras = cameras.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.camera_id.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              Camera Network Management
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Configure dynamic N-camera endpoints, RTSP streams, diagnostic health, and zone mapping
          </p>
        </div>

        {isOperator && (
          <button
            data-testid="add-new-camera-btn"
            onClick={() => {
              setCameraId(`CAM-${String(cameras.length + 1).padStart(2, '0')}`);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 font-display uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Camera</span>
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#10141f] p-3 rounded-xl border border-[#1e2638] flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            data-testid="camera-mgmt-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search configured cameras by Name, ID, or Physical Location..."
            className="w-full bg-[#161c28] border border-[#222c40] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono-hud"
          />
        </div>
      </div>

      {/* Camera Inventory Table */}
      {loading ? (
        <div className="h-64 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center justify-center font-mono-hud text-slate-500">
          Loading Camera Configuration...
        </div>
      ) : (
        <div className="bg-[#10141f] rounded-xl border border-[#1e2638] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-hud">
              <thead className="bg-[#141a26] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                <tr>
                  <th className="p-3.5">ID / Name</th>
                  <th className="p-3.5">Location & Zone</th>
                  <th className="p-3.5">Resolution / FPS</th>
                  <th className="p-3.5">RTSP Stream (Protected)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030] text-slate-200">
                {filteredCameras.map((cam) => (
                  <tr 
                    key={cam.id || cam.camera_id} 
                    data-testid={`camera-row-${cam.camera_id}`}
                    className="hover:bg-[#151b2a] transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-white text-xs">{cam.camera_id}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{cam.name}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="text-slate-200 font-sans">{cam.location}</p>
                      <span className="inline-block px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 text-[10px] mt-0.5">
                        {cam.zone}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      {cam.resolution} @ {cam.fps} FPS
                    </td>

                    <td className="p-3.5 text-slate-400 truncate max-w-[200px]" title={cam.stream_url}>
                      {cam.stream_url}
                    </td>

                    <td className="p-3.5">
                      <button
                        data-testid={`toggle-cam-status-btn-${cam.camera_id}`}
                        onClick={() => handleToggleStatus(cam)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                          cam.status === 'online'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                        title="Click to toggle Online/Offline"
                      >
                        {cam.status}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        data-testid={`test-conn-btn-${cam.camera_id}`}
                        onClick={() => setSelectedCamDiagnostic(cam)}
                        className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30 text-[11px] font-bold"
                      >
                        Test Ping
                      </button>

                      {isAdmin && (
                        <button
                          data-testid={`delete-cam-btn-${cam.camera_id}`}
                          onClick={() => handleDeleteCamera(cam.id || cam.camera_id)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete Camera"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div 
            data-testid="add-camera-modal"
            className="w-full max-w-xl bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-blue-400" />
                <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                  Register New CCTV Camera Endpoint
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCamera} className="p-5 space-y-4 text-xs font-mono-hud text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Camera ID Code *</label>
                  <input
                    data-testid="new-cam-id-input"
                    type="text"
                    required
                    value={cameraId}
                    onChange={(e) => setCameraId(e.target.value)}
                    placeholder="e.g. CAM-09"
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Camera Name *</label>
                  <input
                    data-testid="new-cam-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. East Gate Barrier"
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Location *</label>
                  <input
                    data-testid="new-cam-location-input"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Building 2 - Perimeter Fence"
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Security Zone</label>
                  <select
                    data-testid="new-cam-zone-select"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="Perimeter">Perimeter</option>
                    <option value="Lobby & Reception">Lobby & Reception</option>
                    <option value="High Security Zone">High Security Zone</option>
                    <option value="Logistics & Freight">Logistics & Freight</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Parking Facility">Parking Facility</option>
                    <option value="Emergency Routes">Emergency Routes</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">RTSP Stream URL (Credentials protected)</label>
                <input
                  data-testid="new-cam-stream-input"
                  type="text"
                  required
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtsp://cctv.sentinel.internal:554/live/stream"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-2 py-2 text-xs text-white"
                  >
                    <option value="1080p (1920x1080)">1080p</option>
                    <option value="4K (3840x2160)">4K</option>
                    <option value="720p (1280x720)">720p</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Frame Rate (FPS)</label>
                  <input
                    type="number"
                    value={fps}
                    onChange={(e) => setFps(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-2 py-2 text-xs text-white"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Operator Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Optical PTZ 30x optical zoom lens with IR illuminator"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white font-sans"
                />
              </div>

              <div className="pt-2 border-t border-[#1e2638] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-[#161c28] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-new-camera-btn"
                  disabled={submitting}
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-display uppercase tracking-wider"
                >
                  {submitting ? 'Registering...' : 'Register Camera Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Diagnostics Modal */}
      {selectedCamDiagnostic && (
        <CameraDetailModal 
          camera={selectedCamDiagnostic} 
          onClose={() => setSelectedCamDiagnostic(null)} 
        />
      )}
    </div>
  );
}
