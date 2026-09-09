import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Play, 
  User, 
  LogOut,
  Bell,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AiSimulatorModal from '../cctv/AiSimulatorModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isConnected, audioEnabled, setAudioEnabled, unreadAlertsCount } = useWebSocket();
  const [utcTime, setUtcTime] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e2638] bg-[#0c1017]/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
      {/* Brand & HUD Status */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 group-hover:border-blue-400 transition-all shadow-lg shadow-blue-500/10">
            <ShieldAlert className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg tracking-wider text-slate-100 uppercase">
                Sentinel<span className="text-blue-500">.AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono-hud font-semibold uppercase rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                PRO OPS
              </span>
            </div>
            <p className="text-[10px] font-mono-hud text-slate-400 tracking-wider">
              SURVEILLANCE & AI DETECTION ENGINE
            </p>
          </div>
        </Link>

        {/* Global Telemetry HUD */}
        <div className="hidden lg:flex items-center space-x-4 pl-4 border-l border-[#1e2638]">
          <div className="flex items-center space-x-2 bg-[#141923] px-2.5 py-1 rounded border border-[#252f44]">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono-hud text-slate-300">AI ENGINE:</span>
            <span className="flex items-center text-[11px] font-mono-hud font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
              ONLINE
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-[#141923] px-2.5 py-1 rounded border border-[#252f44]">
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[11px] font-mono-hud text-slate-300">STREAM:</span>
            <span className={`text-[11px] font-mono-hud font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isConnected ? 'LIVE WS' : 'RECONNECTING'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions & Clock */}
      <div className="flex items-center space-x-3">
        {/* UTC Clock */}
        <div className="hidden md:flex items-center space-x-2 bg-[#141923]/90 px-3 py-1 rounded border border-[#1e2638] text-slate-300 font-mono-hud text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{utcTime || 'UTC 00:00:00'}</span>
        </div>

        {/* AI Ingest Simulator Trigger Button */}
        <button
          data-testid="trigger-ai-sim-button"
          onClick={() => setShowSimModal(true)}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded border border-blue-400/40 shadow-sm transition-all shadow-blue-500/20"
          title="Inject realistic AI detection event from simulated Python detection engine"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span className="font-display tracking-wide uppercase">Simulate AI Event</span>
        </button>

        {/* Audio Alert Toggle */}
        <button
          data-testid="audio-toggle-button"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-2 rounded border transition-colors ${
            audioEnabled
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50'
              : 'bg-[#141923] text-slate-500 border-[#1e2638] hover:text-slate-300'
          }`}
          title={audioEnabled ? 'Alert Audio: ENABLED' : 'Alert Audio: MUTED'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Alerts Center Quick Link */}
        <Link
          to="/alerts"
          data-testid="quick-alerts-nav-link"
          className="relative p-2 rounded bg-[#141923] border border-[#1e2638] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#0c1017] animate-pulse font-mono-hud">
              {unreadAlertsCount}
            </span>
          )}
        </Link>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            data-testid="user-profile-menu-button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 bg-[#141923] hover:bg-[#1a2130] border border-[#1e2638] px-2.5 py-1.5 rounded transition-colors"
          >
            <div className="w-6 h-6 rounded bg-blue-900/60 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-bold uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-slate-200 leading-none">{user?.name || 'Operator'}</p>
              <span className="text-[10px] font-mono-hud font-semibold uppercase text-blue-400">
                {user?.role || 'viewer'}
              </span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md bg-[#141923] border border-[#252f44] shadow-xl py-1 z-50">
              <div className="px-4 py-2 border-b border-[#1e2638]">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-mono-hud font-bold uppercase rounded bg-blue-950 text-blue-300 border border-blue-800">
                  ROLE: {user?.role}
                </span>
              </div>
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2 text-xs text-slate-300 hover:bg-[#1c2436] hover:text-white"
              >
                <User className="w-3.5 h-3.5 mr-2" />
                Settings & Integration
              </Link>
              <button
                data-testid="logout-button"
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-xs text-red-400 hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Simulator Modal */}
      {showSimModal && <AiSimulatorModal onClose={() => setShowSimModal(false)} />}
    </header>
  );
}
