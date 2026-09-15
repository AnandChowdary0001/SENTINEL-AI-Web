import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Ambient Glassmorphic Glow Orbs in Background */}
      <div className="fixed top-[-150px] left-[15%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="fixed bottom-[-150px] right-[10%] w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
