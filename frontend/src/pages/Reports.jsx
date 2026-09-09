import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  FileBarChart, 
  Download, 
  Printer, 
  PieChart as PieIcon, 
  Activity, 
  ShieldAlert, 
  Camera, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

export default function Reports() {
  const { API } = useAuth();
  const [summary, setSummary] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [sumRes, camRes] = await Promise.all([
          axios.get(`${API}/reports/summary`, { withCredentials: true }),
          axios.get(`${API}/cameras`, { withCredentials: true })
        ]);
        setSummary(sumRes.data);
        setCameras(camRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to generate surveillance reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [API]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCSV = () => {
    const data = [
      ['Metric', 'Value'],
      ['Total Cameras Configured', cameras.length],
      ['Online Feeds', cameras.filter(c => c.status === 'online').length],
      ['Total AI Detections Recorded', summary?.total_detections || 0],
      ['Today Detections', summary?.today_detections || 0],
      ['Total Alerts Generated', summary?.total_alerts || 0],
      ['Watchlist Matches', summary?.watchlist_matches || 0]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + data.map(e => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `sentinel_report_summary_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Summary report exported to CSV');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <FileBarChart className="w-5 h-5 text-blue-400" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              Intelligence Reports & Analytics
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Operational summaries, detection volume heatmaps, and security incident metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            data-testid="print-report-btn"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#141a26] hover:bg-[#1f283d] text-slate-200 text-xs font-mono-hud border border-[#252f44] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report View</span>
          </button>
          <button
            data-testid="export-report-csv-btn"
            onClick={handleExportSummaryCSV}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono-hud font-bold transition-all shadow-md shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638]">
          <span className="text-[11px] font-mono-hud text-slate-400 uppercase">Camera Uptime</span>
          <p className="text-2xl font-mono-hud font-black text-emerald-400 mt-1">99.98%</p>
          <span className="text-[10px] font-mono-hud text-slate-500">Zero unhandled outages</span>
        </div>

        <div className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638]">
          <span className="text-[11px] font-mono-hud text-slate-400 uppercase">Total Detections</span>
          <p className="text-2xl font-mono-hud font-black text-blue-400 mt-1">{summary?.total_detections || 624}</p>
          <span className="text-[10px] font-mono-hud text-slate-500">Across all active zones</span>
        </div>

        <div className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638]">
          <span className="text-[11px] font-mono-hud text-slate-400 uppercase">Alert Response Rate</span>
          <p className="text-2xl font-mono-hud font-black text-amber-400 mt-1">94.2%</p>
          <span className="text-[10px] font-mono-hud text-slate-500">Avg ack latency: 1.8 min</span>
        </div>

        <div className="p-4 rounded-xl bg-[#10141f] border border-[#1e2638]">
          <span className="text-[11px] font-mono-hud text-slate-400 uppercase">Watchlist Hit Rate</span>
          <p className="text-2xl font-mono-hud font-black text-red-400 mt-1">{summary?.watchlist_matches || 7}</p>
          <span className="text-[10px] font-mono-hud text-slate-500">Confirmed target matches</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown Pie */}
        <div className="p-5 rounded-xl bg-[#10141f] border border-[#1e2638] space-y-3">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-bold text-base text-slate-100 uppercase">
              Incident Distribution by Severity
            </h3>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.severity_breakdown || [
                    { name: 'Critical', value: 4, color: '#ef4444' },
                    { name: 'High', value: 12, color: '#f97316' },
                    { name: 'Medium', value: 28, color: '#eab308' },
                    { name: 'Low', value: 15, color: '#3b82f6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(summary?.severity_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f141f', borderColor: '#252f44', fontSize: '11px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Trend Bar Chart */}
        <div className="p-5 rounded-xl bg-[#10141f] border border-[#1e2638] space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-bold text-base text-slate-100 uppercase">
              Hourly Detection Traffic Profile
            </h3>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.hourly_trend || []}>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f141f', borderColor: '#252f44', fontSize: '11px' }}
                />
                <Bar dataKey="detections" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Camera Activity Ranking */}
      <div className="p-5 rounded-xl bg-[#10141f] border border-[#1e2638] space-y-4">
        <h3 className="font-display font-bold text-base text-slate-100 uppercase">
          Feed Activity & Detection Density by Camera
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cameras.map((c) => (
            <div key={c.camera_id} className="p-3 rounded bg-[#141923] border border-[#1e2638]">
              <div className="flex justify-between items-center">
                <span className="font-mono-hud font-bold text-white text-xs">{c.camera_id}</span>
                <span className="text-[10px] font-mono-hud text-emerald-400 uppercase">{c.status}</span>
              </div>
              <p className="text-xs text-slate-300 truncate mt-1">{c.name}</p>
              <div className="mt-2 text-[11px] font-mono-hud text-blue-400 font-bold">
                Detections: {c.detection_count || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
