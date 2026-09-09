import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  UserCheck, 
  Camera, 
  History, 
  Users, 
  FileBarChart, 
  Settings,
  Radio,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, testId: 'nav-dashboard' },
  { name: 'Live Cameras', path: '/live', icon: Video, testId: 'nav-live-cameras' },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle, testId: 'nav-alerts', hasBadge: true },
  { name: 'Watchlist', path: '/watchlist', icon: UserCheck, testId: 'nav-watchlist' },
  { name: 'Camera Management', path: '/cameras', icon: Camera, testId: 'nav-cameras' },
  { name: 'Detection History', path: '/history', icon: History, testId: 'nav-history' },
  { name: 'Users & Access', path: '/users', icon: Users, testId: 'nav-users', adminOnly: true },
  { name: 'Reports', path: '/reports', icon: FileBarChart, testId: 'nav-reports' },
  { name: 'Settings', path: '/settings', icon: Settings, testId: 'nav-settings' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { unreadAlertsCount } = useWebSocket();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0c1017] border-r border-[#1e2638] flex flex-col justify-between hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono-hud font-bold uppercase tracking-wider text-slate-400">
          SURVEILLANCE CONTROL
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') {
              return null;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={item.testId}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#141923] border border-transparent'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>

                {item.hasBadge && unreadAlertsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono-hud font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/50">
                    {unreadAlertsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Engine Status Footer */}
      <div className="p-3 border-t border-[#1e2638] bg-[#090b10]">
        <div className="rounded bg-[#121620] p-2.5 border border-[#1e2638]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono-hud font-semibold text-slate-400">AI DETECTOR</span>
            <span className="inline-flex items-center text-[10px] font-mono-hud font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono-hud">YOLOv8 + FaceNet Engine</p>
          <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
            <span>Latency: ~24ms</span>
            <span>Streams: N/N</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
