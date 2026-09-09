import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  Camera, 
  X, 
  Activity, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Clock,
  Layers,
  Settings2
} from 'lucide-react';

export default function CameraDetailModal({ camera, onClose }) {
  const { API, isOperator } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleRunDiagnostic = async () => {
    setTesting(true);
    try {
      const response = await axios.post(
        `${API}/cameras/${camera.id || camera.camera_id}/test-connection`,
        {},
        { withCredentials: true }
      );
      setTestResult(response.data);
      toast.success(`Diagnostic Complete: Latency ${response.data.latency_ms}ms`);
    } catch (err) {
      console.error(err);
      toast.error('Diagnostic check failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        data-testid="camera-detail-modal"
        className="w-full max-w-xl bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/40">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-100 uppercase tracking-wide">
                Camera Telemetry & Diagnostics
              </h3>
              <p className="text-[11px] font-mono-hud text-slate-400">
                {camera.camera_id} • {camera.name}
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

        {/* Content */}
        <div className="p-5 space-y-4 text-slate-200 text-xs font-mono-hud">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-[#141923] border border-[#1e2638]">
              <span className="text-[10px] text-slate-400 block mb-1">LOCATION & ZONE</span>
              <p className="font-semibold text-slate-200 text-xs">{camera.location}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px]">
                Zone: {camera.zone}
              </span>
            </div>

            <div className="p-3 rounded bg-[#141923] border border-[#1e2638]">
              <span className="text-[10px] text-slate-400 block mb-1">STREAM SPECIFICATIONS</span>
              <p className="font-semibold text-slate-200 text-xs">{camera.resolution} @ {camera.fps} FPS</p>
              <p className="text-[10px] text-emerald-400 mt-1">Codec: H.264 / H.265 RTSP</p>
            </div>

            <div className="p-3 rounded bg-[#141923] border border-[#1e2638]">
              <span className="text-[10px] text-slate-400 block mb-1">CURRENT STATUS</span>
              <p className={`font-bold uppercase text-xs ${camera.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                ● {camera.status}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Detections: {camera.detection_count || 0}</p>
            </div>

            <div className="p-3 rounded bg-[#141923] border border-[#1e2638]">
              <span className="text-[10px] text-slate-400 block mb-1">STREAM URL (PROTECTED)</span>
              <p className="font-semibold text-slate-300 text-[11px] truncate">{camera.stream_url}</p>
              <p className="text-[10px] text-slate-400 mt-1">Credentials Hidden</p>
            </div>
          </div>

          {/* Diagnostic Result */}
          {testResult && (
            <div className="p-3 rounded bg-[#121926] border border-blue-900/60 text-slate-300 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  RTSP Connection Diagnostic
                </span>
                <span className="text-[10px] text-slate-400">Protocol: {testResult.protocol}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e283d] text-center">
                <div className="bg-[#172030] p-1.5 rounded">
                  <span className="text-[9px] text-slate-400 block">LATENCY</span>
                  <span className="text-emerald-400 font-bold text-xs">{testResult.latency_ms} ms</span>
                </div>
                <div className="bg-[#172030] p-1.5 rounded">
                  <span className="text-[9px] text-slate-400 block">BITRATE</span>
                  <span className="text-blue-400 font-bold text-xs">{testResult.bitrate_kbps} kbps</span>
                </div>
                <div className="bg-[#172030] p-1.5 rounded">
                  <span className="text-[9px] text-slate-400 block">PACKET LOSS</span>
                  <span className="text-slate-200 font-bold text-xs">{testResult.packet_loss_pct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {camera.notes && (
            <div className="p-2.5 rounded bg-[#141923] border border-[#1e2638]">
              <span className="text-[10px] text-slate-400 block">SECURITY OPERATOR NOTES:</span>
              <p className="text-slate-300 text-xs mt-0.5">{camera.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#141a26] px-5 py-3 border-t border-[#252f44] flex items-center justify-between">
          <button
            data-testid="run-cam-diagnostic-btn"
            onClick={handleRunDiagnostic}
            disabled={testing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Probing RTSP Feed...' : 'Test Connection & Ping'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1a2130] hover:bg-[#232c40] text-slate-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
