import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon, 
  Key, 
  Lock, 
  Volume2, 
  Sliders, 
  Cpu, 
  Copy, 
  Check, 
  Save,
  ShieldAlert,
  Code
} from 'lucide-react';

export default function Settings() {
  const { API, user, isAdmin } = useAuth();
  const { audioEnabled, setAudioEnabled } = useWebSocket();
  const [copied, setCopied] = useState(false);

  // Settings State
  const [siteName, setSiteName] = useState('SENTINEL COMMAND CENTER');
  const [faceThreshold, setFaceThreshold] = useState(0.85);
  const [personThreshold, setPersonThreshold] = useState(0.80);
  const [autoAckMinutes, setAutoAckMinutes] = useState(60);
  const [aiKey, setAiKey] = useState('sentinel_ai_engine_key_live_2026');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`, { withCredentials: true });
        if (response.data) {
          setSiteName(response.data.site_name || 'SENTINEL COMMAND CENTER');
          setFaceThreshold(response.data.face_confidence_threshold || 0.85);
          setPersonThreshold(response.data.person_confidence_threshold || 0.80);
          setAutoAckMinutes(response.data.auto_acknowledge_minutes || 60);
          if (response.data.ai_engine_api_key) {
            setAiKey(response.data.ai_engine_api_key);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, [API]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(aiKey);
    setCopied(true);
    toast.success('AI Engine API Key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Administrator privileges required to change system settings');
      return;
    }
    setSavingSettings(true);
    try {
      await axios.put(
        `${API}/settings`,
        {
          site_name: siteName,
          face_confidence_threshold: parseFloat(faceThreshold),
          person_confidence_threshold: parseFloat(personThreshold),
          auto_acknowledge_minutes: parseInt(autoAckMinutes),
          alert_sound_enabled: audioEnabled
        },
        { withCredentials: true }
      );
      toast.success('System settings saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPwdLoading(true);
    try {
      await axios.post(
        `${API}/auth/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        { withCredentials: true }
      );
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPwdLoading(false);
    }
  };

  const pythonIntegrationSnippet = `
# ==========================================================
# External Python AI CCTV Detection Engine Client Example
# ==========================================================
import requests
import json
import time

SENTINEL_API_URL = "${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/ai/ingest/detection"
AI_ENGINE_KEY = "${aiKey}"

def send_detection_event(camera_id, person_name, confidence, watchlist_match=False):
    payload = {
        "camera_id": camera_id,
        "detection_type": "face" if person_name else "person",
        "person_name": person_name,
        "confidence": confidence,
        "watchlist_match": watchlist_match,
        "bounding_boxes": [
            {"x": 30, "y": 20, "width": 40, "height": 55, "label": person_name, "confidence": confidence}
        ]
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-AI-Engine-Key": AI_ENGINE_KEY
    }
    
    response = requests.post(SENTINEL_API_URL, json=payload, headers=headers)
    print(f"Ingest status: {response.status_code}, data: {response.json()}")

# Example trigger:
# send_detection_event("CAM-01", "Dmitri Volkov", 0.94, watchlist_match=True)
`;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-3 border-b border-[#1e2638]">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-blue-400" />
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
            System Settings & AI Integration
          </h1>
        </div>
        <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
          Configure security control room parameters and external Python AI engine connectivity
        </p>
      </div>

      {/* AI Engine API Integration Blueprint Card */}
      <div className="p-5 rounded-xl bg-[#10141f] border border-blue-900/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base text-slate-100 uppercase">
              External Python AI Engine Ingestion API
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono-hud font-bold uppercase">
            REST & WEBSOCKET READY
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Your external Python AI pipeline (YOLO / OpenCV / DeepFace / InsightFace) pushes live metadata directly via authenticated REST requests.
        </p>

        {/* API Key Box */}
        <div className="bg-[#161c28] p-3 rounded-lg border border-[#252f44] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono-hud text-slate-400 uppercase block">
              X-AI-Engine-Key (API Secret)
            </span>
            <span className="text-xs font-mono-hud font-bold text-blue-400">{aiKey}</span>
          </div>

          <button
            data-testid="copy-ai-key-btn"
            onClick={handleCopyKey}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono-hud font-bold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>

        {/* Python Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-hud text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span>Python AI Engine Ingestion Script Template</span>
            </span>
          </div>
          <pre className="p-3.5 rounded-lg bg-[#090c12] border border-[#1e2638] font-mono-hud text-[11px] text-slate-300 overflow-x-auto">
            {pythonIntegrationSnippet}
          </pre>
        </div>
      </div>

      {/* Global Detection & Alarm Thresholds */}
      <form onSubmit={handleSaveSettings} className="p-5 rounded-xl bg-[#10141f] border border-[#1e2638] space-y-4">
        <h3 className="font-display font-bold text-base text-slate-100 uppercase flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>AI Detection Confidence Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-hud text-slate-200">
          <div>
            <label className="block text-slate-300 mb-1">
              Face Recognition Match Threshold: {Math.round(faceThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={faceThreshold}
              onChange={(e) => setFaceThreshold(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Detections below this confidence will not trigger alerts.</p>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">
              Person Detection Threshold: {Math.round(personThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={personThreshold}
              onChange={(e) => setPersonThreshold(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">YOLO person bounding box confidence floor.</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#1e2638] flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-mono-hud text-slate-300">
            <input
              type="checkbox"
              checked={audioEnabled}
              onChange={(e) => setAudioEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-[#161c28]"
            />
            <span>Enable Synthesized Audio Siren on Critical Watchlist Matches</span>
          </label>

          {isAdmin && (
            <button
              type="submit"
              data-testid="save-global-settings-btn"
              disabled={savingSettings}
              className="flex items-center space-x-1.5 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-display uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
            </button>
          )}
        </div>
      </form>

      {/* Password Change Card */}
      <form onSubmit={handleChangePassword} className="p-5 rounded-xl bg-[#10141f] border border-[#1e2638] space-y-4">
        <h3 className="font-display font-bold text-base text-slate-100 uppercase flex items-center space-x-2">
          <Lock className="w-4 h-4 text-blue-400" />
          <span>Operator Password Security</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-hud text-slate-200">
          <div>
            <label className="block text-slate-300 mb-1">Current Password *</label>
            <input
              data-testid="old-pwd-input"
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">New Password *</label>
            <input
              data-testid="new-pwd-input"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Confirm New Password *</label>
            <input
              data-testid="confirm-pwd-input"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            data-testid="change-pwd-btn"
            disabled={pwdLoading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-display uppercase tracking-wider"
          >
            {pwdLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
