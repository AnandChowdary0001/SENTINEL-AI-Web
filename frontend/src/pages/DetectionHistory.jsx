import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  Eye, 
  UserCheck, 
  Camera, 
  Clock, 
  Scan,
  RefreshCw
} from 'lucide-react';

export default function DetectionHistory() {
  const { API } = useAuth();
  const [detections, setDetections] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filters
  const [cameraFilter, setCameraFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDetections = async () => {
    try {
      const [detRes, camRes] = await Promise.all([
        axios.get(`${API}/detections?limit=150`, { withCredentials: true }),
        axios.get(`${API}/cameras`, { withCredentials: true })
      ]);
      setDetections(detRes.data);
      setCameras(camRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load detection logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, [API]);

  const handleExportCSV = () => {
    if (filteredDetections.length === 0) {
      toast.error('No detections to export');
      return;
    }
    const headers = ['Event ID', 'Timestamp', 'Camera ID', 'Camera Name', 'Location', 'Type', 'Subject Name', 'Confidence', 'Watchlist Match'];
    const rows = filteredDetections.map(d => [
      d.event_id,
      d.timestamp,
      d.camera_id,
      `"${d.camera_name}"`,
      `"${d.location}"`,
      d.detection_type,
      `"${d.person_name || 'N/A'}"`,
      `${Math.round((d.confidence || 0) * 100)}%`,
      d.watchlist_match ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinel_detections_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Detection logs exported to CSV');
  };

  const filteredDetections = detections.filter(d => {
    if (cameraFilter !== 'ALL' && d.camera_id !== cameraFilter && d.camera_name !== cameraFilter) return false;
    if (typeFilter !== 'ALL' && d.detection_type !== typeFilter) return false;
    if (watchlistOnly && !d.watchlist_match) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = d.person_name?.toLowerCase().includes(q);
      const matchCam = d.camera_name?.toLowerCase().includes(q);
      const matchId = d.event_id?.toLowerCase().includes(q);
      if (!matchSub && !matchCam && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              AI Detection Event History
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Historical log of facial recognitions, person detections, and perimeter events
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            data-testid="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-hud font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchDetections}
            className="p-1.5 rounded-lg bg-[#121620] hover:bg-[#1a2130] text-slate-300 border border-[#1e2638]"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#10141f] p-3 rounded-xl border border-[#1e2638] flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            data-testid="detection-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by Subject Name, Event ID, Camera..."
            className="w-full bg-[#161c28] border border-[#222c40] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono-hud"
          />
        </div>

        {/* Camera Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Camera:</span>
          <select
            data-testid="det-camera-filter-select"
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="bg-[#161c28] border border-[#222c40] rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono-hud"
          >
            <option value="ALL">All Cameras</option>
            {cameras.map(c => (
              <option key={c.camera_id} value={c.camera_id}>{c.camera_id} - {c.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Type:</span>
          <select
            data-testid="det-type-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#161c28] border border-[#222c40] rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono-hud"
          >
            <option value="ALL">All Detection Types</option>
            <option value="face">Face Recognition</option>
            <option value="person">Person Tracking</option>
            <option value="unauthorized_access">Unauthorized Breach</option>
            <option value="loitering">Loitering</option>
            <option value="vehicle">Vehicle LPR</option>
          </select>
        </div>

        {/* Watchlist toggle */}
        <label className="flex items-center space-x-2 cursor-pointer text-xs font-mono-hud text-slate-300">
          <input
            data-testid="det-watchlist-only-checkbox"
            type="checkbox"
            checked={watchlistOnly}
            onChange={(e) => setWatchlistOnly(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 bg-[#161c28] border-[#222c40]"
          />
          <span>Watchlist Only</span>
        </label>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="h-64 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center justify-center font-mono-hud text-slate-500">
          Loading Event Logs...
        </div>
      ) : filteredDetections.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#10141f] border border-[#1e2638] space-y-2">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="font-display font-bold text-base text-slate-300">No Historical Detections Recorded</p>
        </div>
      ) : (
        <div className="bg-[#10141f] rounded-xl border border-[#1e2638] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-hud">
              <thead className="bg-[#141a26] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                <tr>
                  <th className="p-3.5">Snapshot / ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Camera / Location</th>
                  <th className="p-3.5">Detection Type</th>
                  <th className="p-3.5">Recognized Subject</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Watchlist Flag</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030] text-slate-200">
                {filteredDetections.map((event) => (
                  <tr 
                    key={event.id || event.event_id} 
                    data-testid={`detection-row-${event.event_id}`}
                    className="hover:bg-[#151b2a] transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={event.snapshot_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'}
                          alt="Snapshot"
                          className="w-9 h-9 rounded object-cover border border-[#252f44] flex-shrink-0"
                        />
                        <span className="font-bold text-blue-400 text-xs">{event.event_id}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-200 font-sans">{event.camera_name}</p>
                      <span className="text-[10px] text-slate-400 font-mono-hud">{event.location}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#182030] text-slate-300 text-[10px] uppercase border border-[#252f44]">
                        {event.detection_type}
                      </span>
                    </td>

                    <td className="p-3.5 font-sans font-medium text-slate-200">
                      {event.person_name || 'Anonymous Person'}
                    </td>

                    <td className="p-3.5 text-emerald-400 font-bold">
                      {Math.round((event.confidence || 0.94) * 100)}%
                    </td>

                    <td className="p-3.5">
                      {event.watchlist_match ? (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold text-[10px] uppercase border border-red-800 animate-pulse">
                          WATCHLIST MATCH
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">—</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        data-testid={`inspect-evt-btn-${event.event_id}`}
                        onClick={() => setSelectedEvent(event)}
                        className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                        title="View Snapshot & Bounding Reticle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Snapshot Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div 
            data-testid="detection-detail-modal"
            className="w-full max-w-lg bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                Detection Telemetry: {selectedEvent.event_id}
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[#252f44]">
                <img 
                  src={selectedEvent.snapshot_url} 
                  alt="Full Capture" 
                  className="w-full h-full object-cover filter contrast-125 brightness-90"
                />
                <div className="absolute inset-0 surveillance-overlay" />
                {/* Bounding box simulation */}
                <div 
                  style={{ left: '30%', top: '20%', width: '40%', height: '60%' }} 
                  className={`absolute border-2 ${selectedEvent.watchlist_match ? 'border-red-500 bg-red-500/20' : 'border-emerald-400 bg-emerald-500/10'}`}
                >
                  <span className="absolute -top-5 left-0 px-1.5 py-0.2 text-[9px] font-mono-hud font-bold bg-black text-white">
                    {selectedEvent.person_name || selectedEvent.detection_type} ({Math.round(selectedEvent.confidence * 100)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono-hud text-slate-300">
                <p><strong>Camera:</strong> {selectedEvent.camera_name}</p>
                <p><strong>Zone:</strong> {selectedEvent.location}</p>
                <p><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
                <p><strong>Confidence:</strong> {Math.round(selectedEvent.confidence * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
