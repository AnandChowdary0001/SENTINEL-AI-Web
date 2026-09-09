import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Eye,
  KeyRound
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@sentinel.security');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Authentication Successful. Welcome to Sentinel Ops.');
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Invalid credentials or connection error.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error('Login Failed: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPwd) => {
    setEmail(quickEmail);
    setPassword(quickPwd);
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Surveillance Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 mb-2 shadow-xl shadow-blue-500/10">
            <ShieldAlert className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <h1 className="font-display font-black text-3xl tracking-wider text-slate-100 uppercase">
            Sentinel<span className="text-blue-500">.AI</span>
          </h1>
          <p className="text-xs font-mono-hud text-slate-400 tracking-widest uppercase">
            AI CCTV SURVEILLANCE & MONITORING SYSTEM
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0f141f]/90 border border-[#20293d] rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1c2438]">
            <span className="text-xs font-mono-hud font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Secure Operator Login
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono-hud font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              GATEWAY ONLINE
            </span>
          </div>

          {error && (
            <div 
              data-testid="login-error-alert"
              className="mb-4 p-3 rounded bg-red-950/70 border border-red-800 text-red-200 text-xs font-mono-hud"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-hud text-slate-300 uppercase tracking-wide mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  data-testid="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@sentinel.security"
                  className="w-full bg-[#151b29] border border-[#232d42] focus:border-blue-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all font-mono-hud"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-hud text-slate-300 uppercase tracking-wide mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  data-testid="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#151b29] border border-[#232d42] focus:border-blue-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all font-mono-hud"
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 mt-2 font-display"
            >
              <span>{loading ? 'Authenticating...' : 'Authorize Access'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credential Selectors */}
          <div className="mt-6 pt-5 border-t border-[#1c2438] space-y-2">
            <span className="block text-[10px] font-mono-hud uppercase text-slate-400 text-center tracking-wider">
              One-Click Role Selection (Pre-configured Demo Accounts)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                data-testid="quick-admin-btn"
                onClick={() => handleQuickLogin('admin@sentinel.security', 'Admin@123456')}
                className="p-2 rounded bg-[#161d2d] hover:bg-[#1f283d] border border-[#242f47] text-left transition-all group"
              >
                <div className="flex items-center space-x-1 text-blue-400 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">All Cameras</p>
              </button>

              <button
                type="button"
                data-testid="quick-operator-btn"
                onClick={() => handleQuickLogin('operator@sentinel.security', 'Operator@123456')}
                className="p-2 rounded bg-[#161d2d] hover:bg-[#1f283d] border border-[#242f47] text-left transition-all group"
              >
                <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Operator</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">6 Cameras</p>
              </button>

              <button
                type="button"
                data-testid="quick-viewer-btn"
                onClick={() => handleQuickLogin('viewer@sentinel.security', 'Viewer@123456')}
                className="p-2 rounded bg-[#161d2d] hover:bg-[#1f283d] border border-[#242f47] text-left transition-all group"
              >
                <div className="flex items-center space-x-1 text-amber-400 text-[11px] font-bold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Viewer</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">2 Cameras</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice Footer */}
        <p className="text-[11px] text-center text-slate-400 font-mono-hud">
          RESTRICTED GOVERNMENT & ENTERPRISE SURVEILLANCE GATEWAY
        </p>
      </div>
    </div>
  );
}
