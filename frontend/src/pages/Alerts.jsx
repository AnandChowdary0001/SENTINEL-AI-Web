import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Eye, 
  Check, 
  FileText,
  UserCheck,
  Camera,
  RefreshCw
} from 'lucide-react';

export default function Alerts() {
  const { API, isOperator } = useAuth();
  const { latestDetection } = useWebSocket();
  const [alerts, setAlerts] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [cameraFilter, setCameraFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlerts = async () => {
    try {
      const [alertsRes, camsRes] = await Promise.all([
        axios.get(`${API}/alerts?limit=100`, { withCredentials: true }),
        axios.get(`${API}/cameras`, { withCredentials: true })
      ]);
      setAlerts(alertsRes.data);
      setCameras(camsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load alert center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [API]);

  useEffect(() => {
    if (latestDetection) {
      fetchAlerts();
    }
  }, [latestDetection]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    setSubmitting(true);
    try {
      await axios.put(
        `${API}/alerts/${alertId}/status`,
        { status: newStatus, notes: reviewNotes || undefined },
        { withCredentials: true }
      );
      toast.success(`Alert marked as ${newStatus}`);
      setSelectedAlert(null);
      setReviewNotes('');
      fetchAlerts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update alert status');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredAlerts = alerts.filter(a => {
    if (cameraFilter !== 'ALL' && a.camera_id !== cameraFilter && a.camera_name !== cameraFilter) {
      return false;
    }
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && a.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = a.subject_name?.toLowerCase().includes(q);
      const matchType = a.alert_type?.toLowerCase().includes(q);
      const matchCam = a.camera_name?.toLowerCase().includes(q);
      const matchId = a.alert_id?.toLowerCase().includes(q);
      if (!matchSub && !matchType && !matchCam && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              Security Alert Center
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Real-time critical security events, watchlist matches, and protocol acknowledgments
          </p>
        </div>

        <button
          data-testid="refresh-alerts-btn"
          onClick={fetchAlerts}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121620] hover:bg-[#1a2130] text-slate-300 text-xs font-mono-hud border border-[#1e2638] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#10141f] p-3 rounded-xl border border-[#1e2638] flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            data-testid="alert-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Subject Name, Alert ID, Camera..."
            className="w-full bg-[#161c28] border border-[#222c40] focus:border-blue-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono-hud"
          />
        </div>

        {/* Camera Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Camera:</span>
          <select
            data-testid="alert-camera-filter-select"
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

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Severity:</span>
          <select
            data-testid="alert-severity-filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#161c28] border border-[#222c40] rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono-hud"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono-hud text-slate-400">Status:</span>
          <select
            data-testid="alert-status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161c28] border border-[#222c40] rounded px-3 py-1.5 text-xs text-white focus:outline-none font-mono-hud"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNREVIEWED">Unreviewed</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
        </div>
      </div>

      {/* Alerts List Table / Cards */}
      {loading ? (
        <div className="h-64 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center justify-center font-mono-hud text-slate-500">
          Loading Security Alerts...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#10141f] border border-[#1e2638] space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="font-display font-bold text-base text-slate-200">No Alerts Found</p>
          <p className="text-xs font-mono-hud text-slate-500">No security alerts matching the current filter criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((a) => (
            <div
              key={a.id || a.alert_id}
              data-testid={`alert-card-${a.alert_id}`}
              className={`p-4 rounded-xl bg-[#10141f] border ${
                a.severity === 'CRITICAL' && a.status === 'UNREVIEWED'
                  ? 'border-red-500/80 bg-red-950/10 glow-crimson'
                  : 'border-[#1e2638]'
              } hover:border-[#2e3b55] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              {/* Left Details */}
              <div className="flex items-start space-x-4 min-w-0">
                <img
                  src={a.thumbnail_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                  alt={a.subject_name}
                  className="w-14 h-14 rounded-lg object-cover border border-[#252f44] flex-shrink-0"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-hud font-bold text-xs text-blue-400">
                      {a.alert_id}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono-hud font-bold uppercase rounded ${
                      a.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
                      a.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-300'
                    }`}>
                      {a.severity}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono-hud font-semibold rounded bg-[#182030] text-slate-200 border border-[#252f44]">
                      {a.alert_type}
                    </span>
                    <span className="text-[10px] font-mono-hud text-emerald-400 font-bold">
                      Confidence: {Math.round((a.confidence || 0.94) * 100)}%
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-100 truncate">
                    {a.subject_name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-hud text-slate-400">
                    <span>Camera: <strong className="text-slate-300">{a.camera_name} ({a.camera_id})</strong></span>
                    <span>•</span>
                    <span>Zone: <strong className="text-slate-300">{a.location}</strong></span>
                    <span>•</span>
                    <span>Time: <strong className="text-slate-300">{a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Recent'}</strong></span>
                  </div>

                  {a.notes && (
                    <p className="text-xs text-slate-300 italic pt-1">
                      Note: {a.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 flex-shrink-0">
                <span className={`px-2.5 py-1 text-xs font-mono-hud font-bold uppercase rounded ${
                  a.status === 'UNREVIEWED' ? 'bg-red-950 text-red-400 border border-red-800' :
                  a.status === 'ACKNOWLEDGED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  a.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {a.status}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    data-testid={`inspect-alert-btn-${a.alert_id}`}
                    onClick={() => {
                      setSelectedAlert(a);
                      setReviewNotes(a.notes || '');
                    }}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Alert</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Acknowledgment Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div 
            data-testid="alert-review-modal"
            className="w-full max-w-lg bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                  Alert Inspection: {selectedAlert.alert_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono-hud text-slate-200">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedAlert.thumbnail_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'} 
                  alt="Snapshot" 
                  className="w-20 h-20 rounded-lg object-cover border border-[#252f44]"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{selectedAlert.subject_name}</p>
                  <p className="text-slate-400">{selectedAlert.alert_type} • Severity: {selectedAlert.severity}</p>
                  <p className="text-slate-400">{selectedAlert.camera_name} ({selectedAlert.location})</p>
                  <p className="text-emerald-400 font-bold">Confidence: {Math.round((selectedAlert.confidence || 0.94) * 100)}%</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operator Notes / Investigation Findings</label>
                <textarea
                  data-testid="alert-review-notes-input"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter notes on security action taken or confirmation details..."
                  className="w-full bg-[#161c28] border border-[#252f44] rounded p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 border-t border-[#1e2638] flex flex-wrap items-center justify-between gap-2">
                <button
                  data-testid="mark-false-positive-btn"
                  onClick={() => handleUpdateStatus(selectedAlert.id || selectedAlert.alert_id, 'FALSE_POSITIVE')}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Mark False Positive
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    data-testid="mark-acknowledge-btn"
                    onClick={() => handleUpdateStatus(selectedAlert.id || selectedAlert.alert_id, 'ACKNOWLEDGED')}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    data-testid="mark-resolved-btn"
                    onClick={() => handleUpdateStatus(selectedAlert.id || selectedAlert.alert_id, 'RESOLVED')}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    Resolve Incident
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
