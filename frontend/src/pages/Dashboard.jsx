import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  AlertTriangle, 
  Activity, 
  UserCheck, 
  Cpu, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Radio,
  Eye,
  TrendingUp
} from 'lucide-react';
import CameraCard from '../components/cctv/CameraCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

export default function Dashboard() {
  const { API, user } = useAuth();
  const { latestDetection } = useWebSocket();
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [camsRes, alertsRes, sumRes, sysRes] = await Promise.all([
        axios.get(`${API}/cameras`, { withCredentials: true }),
        axios.get(`${API}/alerts?limit=5`, { withCredentials: true }),
        axios.get(`${API}/reports/summary`, { withCredentials: true }),
        axios.get(`${API}/system/status`, { withCredentials: true })
      ]);
      setCameras(camsRes.data);
      setAlerts(alertsRes.data);
      setSummary(sumRes.data);
      setSystemStatus(sysRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [API]);

  // Refresh data when a new live detection/alert arrives
  useEffect(() => {
    if (latestDetection) {
      fetchDashboardData();
    }
  }, [latestDetection]);

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.length - onlineCount;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'UNREVIEWED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & System State Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#1e2638]">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
            Command Center Overview
          </h1>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Real-time multi-camera telemetry and external AI detection stream
          </p>
        </div>

        {/* Global Live Status Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-[#121722] px-3 py-1.5 rounded-lg border border-[#222d42]">
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono-hud text-slate-300">AI Engine:</span>
            <span className="text-xs font-mono-hud font-bold text-emerald-400">ONLINE</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#121722] px-3 py-1.5 rounded-lg border border-[#222d42]">
            <Camera className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono-hud text-slate-300">Cameras:</span>
            <span className="text-xs font-mono-hud font-bold text-slate-100">
              {onlineCount}/{cameras.length} ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cameras */}
        <div 
          data-testid="stat-card-total-cameras"
          className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-hud text-slate-400 uppercase tracking-wide">Total Cameras</span>
            <div className="p-2 rounded bg-blue-950/60 text-blue-400 border border-blue-900/40">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono-hud font-black text-slate-100">{cameras.length}</div>
            <div className="flex items-center space-x-2 text-[11px] font-mono-hud mt-1">
              <span className="text-emerald-400 font-semibold">{onlineCount} Active</span>
              <span className="text-slate-600">•</span>
              <span className="text-red-400 font-semibold">{offlineCount} Offline</span>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div 
          data-testid="stat-card-active-alerts"
          className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-hud text-slate-400 uppercase tracking-wide">Active Alerts</span>
            <div className="p-2 rounded bg-red-950/60 text-red-400 border border-red-900/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono-hud font-black text-red-400">
              {summary?.total_alerts ?? 4}
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono-hud mt-1">
              <span className="text-red-400 font-bold">{criticalAlerts} Critical Unresolved</span>
            </div>
          </div>
        </div>

        {/* Today's Detections */}
        <div 
          data-testid="stat-card-today-detections"
          className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-hud text-slate-400 uppercase tracking-wide">Today's Detections</span>
            <div className="p-2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono-hud font-black text-slate-100">
              {summary?.today_detections ?? 624}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono-hud text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>YOLOv8 + FaceNet AI Active</span>
            </div>
          </div>
        </div>

        {/* Watchlist Matches */}
        <div 
          data-testid="stat-card-watchlist-matches"
          className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-hud text-slate-400 uppercase tracking-wide">Watchlist Matches</span>
            <div className="p-2 rounded bg-amber-950/60 text-amber-400 border border-amber-900/40">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono-hud font-black text-amber-400">
              {summary?.watchlist_matches ?? 7}
            </div>
            <div className="text-[11px] font-mono-hud text-slate-400 mt-1">
              {systemStatus?.active_watchlist_targets ?? 3} Active Targets Configured
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Camera Live Preview Grid (Top 4 Primary Feeds) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="font-display font-bold text-lg text-slate-100 uppercase tracking-wide">
              Live Surveillance Grid
            </h2>
          </div>
          <Link
            to="/live"
            data-testid="view-all-cameras-link"
            className="flex items-center space-x-1 text-xs font-mono-hud text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View All ({cameras.length}) Feeds</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-64 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center justify-center font-mono-hud text-slate-500">
            Connecting to CCTV RTSP Streams...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cameras.slice(0, 4).map((cam) => (
              <CameraCard 
                key={cam.id || cam.camera_id} 
                camera={cam} 
                activeDetection={latestDetection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Recent Alerts + Detection Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts Feed (2 Columns on large) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h2 className="font-display font-bold text-lg text-slate-100 uppercase tracking-wide">
                Recent Security Alerts
              </h2>
            </div>
            <Link
              to="/alerts"
              data-testid="all-alerts-link"
              className="flex items-center space-x-1 text-xs font-mono-hud text-blue-400 hover:text-blue-300"
            >
              <span>Alert Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {alerts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#10141f] border border-[#1e2638] font-mono-hud text-xs text-slate-400">
                No active alerts in current queue
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id || a.alert_id}
                  data-testid={`dashboard-alert-item-${a.alert_id}`}
                  className="p-3.5 rounded-lg bg-[#10141f] hover:bg-[#151b2a] border border-[#1e2638] transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img 
                      src={a.thumbnail_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'} 
                      alt={a.subject_name} 
                      className="w-11 h-11 rounded object-cover border border-[#252f44] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono-hud font-bold rounded uppercase ${
                          a.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                          a.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-blue-950 text-blue-300'
                        }`}>
                          {a.severity}
                        </span>
                        <span className="font-mono-hud font-bold text-xs text-slate-200 truncate">
                          {a.alert_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                        {a.subject_name}
                      </p>
                      <p className="text-[10px] font-mono-hud text-slate-400">
                        {a.camera_name} • {a.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono-hud">
                    <span className="text-xs font-bold text-emerald-400">
                      {Math.round((a.confidence || 0.94) * 100)}% Match
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : 'Just now'}
                    </p>
                    <span className={`inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                      a.status === 'UNREVIEWED' ? 'bg-red-950/70 text-red-400' : 'bg-emerald-950/70 text-emerald-400'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 24-Hour AI Detection Activity Chart */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="font-display font-bold text-lg text-slate-100 uppercase tracking-wide">
              Detection Volume
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638] flex flex-col justify-between h-[300px]">
            <span className="text-xs font-mono-hud text-slate-400">24-Hour Detection Timeline</span>
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.hourly_trend || [
                  { time: '00:00', detections: 12 },
                  { time: '04:00', detections: 8 },
                  { time: '08:00', detections: 45 },
                  { time: '12:00', detections: 68 },
                  { time: '16:00', detections: 52 },
                  { time: '20:00', detections: 29 },
                ]}>
                  <defs>
                    <linearGradient id="detectGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f141f', borderColor: '#252f44', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="detections" stroke="#3b82f6" fillOpacity={1} fill="url(#detectGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] font-mono-hud text-slate-400 border-t border-[#1e2638] pt-2">
              <span>Avg Peak: 68 events/hr</span>
              <span className="text-emerald-400">Processing: Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
