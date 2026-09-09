import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  Sparkles, 
  X, 
  Send, 
  Camera, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const PRESET_EVENTS = [
  {
    title: 'Watchlist Target Match: Dmitri Volkov',
    camera_id: 'CAM-01',
    detection_type: 'face',
    person_name: 'Dmitri Volkov',
    confidence: 0.95,
    watchlist_match: true,
    risk_level: 'CRITICAL',
    description: 'Triggers critical security alarm & bounding box on Main Entrance'
  },
  {
    title: 'Watchlist Banned Contractor: Elena Rostova',
    camera_id: 'CAM-04',
    detection_type: 'face',
    person_name: 'Elena Rostova',
    confidence: 0.91,
    watchlist_match: true,
    risk_level: 'HIGH',
    description: 'Triggers high alert on Loading Dock logistics bay'
  },
  {
    title: 'Unauthorized Entry: Server Room Alpha',
    camera_id: 'CAM-03',
    detection_type: 'unauthorized_access',
    person_name: 'Unidentified Intruder',
    confidence: 0.89,
    watchlist_match: false,
    risk_level: 'CRITICAL',
    description: 'Triggers security perimeter breach alert in vault'
  },
  {
    title: 'Perimeter Loitering Detected',
    camera_id: 'CAM-06',
    detection_type: 'loitering',
    person_name: 'Subject in Dark Jacket',
    confidence: 0.87,
    watchlist_match: false,
    risk_level: 'MEDIUM',
    description: 'Triggers perimeter motion alert on West Fence'
  },
  {
    title: 'VIP Recognition: Arthur Pendelton',
    camera_id: 'CAM-05',
    detection_type: 'face',
    person_name: 'Arthur Pendelton',
    confidence: 0.98,
    watchlist_match: true,
    risk_level: 'LOW',
    description: 'Triggers VIP escort notification in Executive Suite'
  }
];

export default function AiSimulatorModal({ onClose }) {
  const { API } = useAuth();
  const [cameraId, setCameraId] = useState('CAM-01');
  const [detectionType, setDetectionType] = useState('face');
  const [personName, setPersonName] = useState('Dmitri Volkov');
  const [confidence, setConfidence] = useState(0.95);
  const [watchlistMatch, setWatchlistMatch] = useState(true);
  const [riskLevel, setRiskLevel] = useState('CRITICAL');
  const [isSending, setIsSending] = useState(false);

  const applyPreset = (preset) => {
    setCameraId(preset.camera_id);
    setDetectionType(preset.detection_type);
    setPersonName(preset.person_name);
    setConfidence(preset.confidence);
    setWatchlistMatch(preset.watchlist_match);
    setRiskLevel(preset.risk_level);
  };

  const handleSimulate = async (e) => {
    e?.preventDefault();
    setIsSending(true);
    try {
      const payload = {
        camera_id: cameraId,
        detection_type: detectionType,
        person_name: personName,
        confidence: parseFloat(confidence),
        watchlist_match: watchlistMatch,
        risk_level: riskLevel,
        bounding_boxes: [
          {
            x: Math.floor(Math.random() * 30) + 25,
            y: Math.floor(Math.random() * 20) + 20,
            width: 35,
            height: 55,
            label: `${personName} (${watchlistMatch ? 'WATCHLIST' : detectionType.toUpperCase()})`,
            confidence: parseFloat(confidence)
          }
        ],
        metadata: {
          simulated: true,
          source: 'Sentinel AI Simulator Tool'
        }
      };

      const response = await axios.post(`${API}/ai/ingest/detection`, payload, {
        headers: {
          'X-AI-Engine-Key': 'sentinel_ai_engine_key_live_2026'
        },
        withCredentials: true
      });

      if (response.data.watchlist_match || response.data.alert_triggered) {
        toast.success(`AI Detection Event Dispatched! Alert ${response.data.alert_id || ''} created.`);
      } else {
        toast.info('Standard detection event recorded & broadcast to active CCTV grid.');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch AI event: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        data-testid="ai-simulator-modal"
        className="w-full max-w-2xl bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/40">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-100 uppercase tracking-wide">
                External AI Detection Engine Simulator
              </h3>
              <p className="text-[11px] font-mono-hud text-slate-400">
                Simulate incoming JSON events from external Python AI CCTV engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1f283d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-200 text-sm">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-mono-hud uppercase text-slate-400 mb-2">
              Quick Test Presets (Select one to auto-fill)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_EVENTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-testid={`preset-event-${idx}`}
                  onClick={() => applyPreset(p)}
                  className="text-left p-2.5 rounded bg-[#161c28] hover:bg-[#1e2738] border border-[#222c40] hover:border-blue-500/50 transition-all text-xs"
                >
                  <p className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>{p.title}</span>
                    <span className={`text-[9px] font-mono-hud font-bold px-1 rounded ${
                      p.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      p.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-300'
                    }`}>
                      {p.risk_level}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Configuration */}
          <form onSubmit={handleSimulate} className="space-y-4 pt-2 border-t border-[#1e2638]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-hud text-slate-300 mb-1">Target Camera</label>
                <select
                  data-testid="sim-camera-select"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CAM-01">CAM-01: Main Entrance Gate A</option>
                  <option value="CAM-02">CAM-02: Central Lobby Atrium</option>
                  <option value="CAM-03">CAM-03: Server Room Alpha</option>
                  <option value="CAM-04">CAM-04: Loading Dock Logistics Bay</option>
                  <option value="CAM-05">CAM-05: Executive Floor Corridor</option>
                  <option value="CAM-06">CAM-06: West Perimeter Fence line</option>
                  <option value="CAM-08">CAM-08: Underground Parking Deck</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-hud text-slate-300 mb-1">Detection Type</label>
                <select
                  data-testid="sim-detection-type-select"
                  value={detectionType}
                  onChange={(e) => setDetectionType(e.target.value)}
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="face">Face Recognition (FaceNet/InsightFace)</option>
                  <option value="person">Person Detection (YOLOv8)</option>
                  <option value="unauthorized_access">Unauthorized Zone Breach</option>
                  <option value="loitering">Loitering & Suspicious Dwell</option>
                  <option value="vehicle">Vehicle License Plate (LPR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-hud text-slate-300 mb-1">Subject / Person Name</label>
                <input
                  data-testid="sim-person-name-input"
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Dmitri Volkov or Staff Name"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-hud text-slate-300 mb-1">
                  Confidence Score: {Math.round(confidence * 100)}%
                </label>
                <input
                  data-testid="sim-confidence-slider"
                  type="range"
                  min="0.50"
                  max="0.99"
                  step="0.01"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#141923] border border-[#252f44]">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wlMatchCheck"
                  data-testid="sim-watchlist-checkbox"
                  checked={watchlistMatch}
                  onChange={(e) => setWatchlistMatch(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-[#161c28] border-[#252f44]"
                />
                <label htmlFor="wlMatchCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  Flag as Active Watchlist Target Match
                </label>
              </div>

              {watchlistMatch && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono-hud text-slate-400">Risk:</span>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="bg-[#161c28] border border-[#252f44] rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              )}
            </div>

            {/* Ingestion API Preview Code */}
            <div className="bg-[#090c12] p-3 rounded border border-[#1b2230] font-mono-hud text-[11px] text-slate-400">
              <span className="text-blue-400 font-bold">API POST</span> /api/ai/ingest/detection
              <pre className="mt-1 text-slate-400 overflow-x-auto">
{`{
  "camera_id": "${cameraId}",
  "detection_type": "${detectionType}",
  "person_name": "${personName}",
  "confidence": ${confidence},
  "watchlist_match": ${watchlistMatch}
}`}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#161c28] hover:bg-[#1e2638] text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="submit-ai-sim-event"
                disabled={isSending}
                className="flex items-center space-x-1.5 px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Transmitting to Engine...' : 'Transmit Ingest Event'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
