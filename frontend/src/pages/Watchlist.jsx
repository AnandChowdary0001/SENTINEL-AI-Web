import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ShieldAlert, 
  Layers, 
  Info,
  Power,
  Users,
  Image as ImageIcon
} from 'lucide-react';

export default function Watchlist() {
  const { API, isOperator } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [referenceFaces, setReferenceFaces] = useState([]);
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist' or 'reference_db'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFaceModal, setShowAddFaceModal] = useState(false);

  // Add Watchlist Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Suspect');
  const [riskLevel, setRiskLevel] = useState('HIGH');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Add Reference Face Form
  const [refName, setRefName] = useState('');
  const [refPersonId, setRefPersonId] = useState('');
  const [refDept, setRefDept] = useState('Staff');
  const [refImage, setRefImage] = useState('');

  const fetchData = async () => {
    try {
      const [wlRes, refRes] = await Promise.all([
        axios.get(`${API}/watchlist`, { withCredentials: true }),
        axios.get(`${API}/reference-faces`, { withCredentials: true })
      ]);
      setWatchlist(wlRes.data);
      setReferenceFaces(refRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load watchlist data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API]);

  const handleToggleActive = async (targetId) => {
    try {
      const response = await axios.patch(
        `${API}/watchlist/${targetId}/toggle`,
        {},
        { withCredentials: true }
      );
      toast.success(`Target status updated to ${response.data.is_active ? 'ACTIVE' : 'DISABLED'}`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle target');
    }
  };

  const handleDeleteWatchlist = async (targetId) => {
    if (!window.confirm('Are you sure you want to remove this target from the watchlist?')) return;
    try {
      await axios.delete(`${API}/watchlist/${targetId}`, { withCredentials: true });
      toast.success('Target removed from watchlist');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete target');
    }
  };

  const handleAddWatchlist = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/watchlist`,
        {
          name,
          category,
          risk_level: riskLevel,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          description,
          is_active: true
        },
        { withCredentials: true }
      );
      toast.success(`Added ${name} to watchlist`);
      setShowAddModal(false);
      setName('');
      setDescription('');
      setImageUrl('');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add watchlist target');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReferenceFace = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/reference-faces`,
        {
          name: refName,
          person_id: refPersonId || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
          department: refDept,
          image_url: refImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
        },
        { withCredentials: true }
      );
      toast.success(`Enrolled reference face for ${refName}`);
      setShowAddFaceModal(false);
      setRefName('');
      setRefPersonId('');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to enroll reference face');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWatchlist = watchlist.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q) || w.target_id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              Target Watchlist Management
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Configure dynamic watchlist targets and reference biometric enrollments
          </p>
        </div>

        {isOperator && (
          <div className="flex items-center space-x-2">
            {activeTab === 'watchlist' ? (
              <button
                data-testid="add-watchlist-target-btn"
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-600/20 font-display uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add Watchlist Target</span>
              </button>
            ) : (
              <button
                data-testid="enroll-face-btn"
                onClick={() => setShowAddFaceModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all font-display uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll Reference Face</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Distinction Banner: Explains separation between reference DB and Watchlist */}
      <div className="p-3.5 rounded-xl bg-[#121722] border border-[#222e44] flex items-start space-x-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-mono-hud">ARCHITECTURE SEPARATION:</strong>
          The Reference Face Database contains all enrolled identities (employees, contractors, authorized staff). An identity existing in the database does <strong className="text-amber-400">NOT</strong> automatically trigger an alert. Only targets explicitly enabled in the <strong>Active Watchlist</strong> generate real-time security alerts upon CCTV optical recognition.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#1e2638]">
        <button
          data-testid="tab-watchlist"
          onClick={() => setActiveTab('watchlist')}
          className={`pb-2.5 px-3 text-xs font-mono-hud font-bold uppercase transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'watchlist'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Active Watchlist Targets ({watchlist.length})</span>
        </button>

        <button
          data-testid="tab-reference-db"
          onClick={() => setActiveTab('reference_db')}
          className={`pb-2.5 px-3 text-xs font-mono-hud font-bold uppercase transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'reference_db'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Reference Face Database ({referenceFaces.length})</span>
        </button>
      </div>

      {/* Watchlist Tab Content */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-[#10141f] p-3 rounded-xl border border-[#1e2638] flex items-center">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input
              data-testid="watchlist-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter watchlist targets by name, category, or ID..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono-hud"
            />
          </div>

          {/* Watchlist Grid */}
          {loading ? (
            <div className="h-48 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center justify-center font-mono-hud text-slate-500">
              Loading Watchlist Targets...
            </div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#10141f] border border-[#1e2638] space-y-2">
              <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-display font-bold text-base text-slate-300">No Watchlist Targets Configured</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWatchlist.map((target) => (
                <div
                  key={target.id || target.target_id}
                  data-testid={`watchlist-card-${target.target_id}`}
                  className={`p-4 rounded-xl bg-[#10141f] border ${
                    target.is_active ? 'border-[#222e44]' : 'border-[#1a202c] opacity-60'
                  } hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3`}
                >
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={target.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={target.name}
                      className="w-16 h-16 rounded-lg object-cover border border-[#252f44] flex-shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono-hud font-bold text-slate-400">
                          {target.target_id}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-mono-hud font-bold uppercase rounded ${
                          target.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                          target.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-blue-950 text-blue-300'
                        }`}>
                          {target.risk_level}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base text-slate-100 truncate">
                        {target.name}
                      </h3>

                      <span className="inline-block text-[10px] font-mono-hud px-1.5 py-0.5 rounded bg-[#182030] text-blue-300">
                        Category: {target.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {target.description || 'No additional security briefing notes.'}
                  </p>

                  <div className="pt-3 border-t border-[#1e2638] flex items-center justify-between text-xs font-mono-hud">
                    <div className="flex items-center space-x-1.5">
                      <button
                        data-testid={`toggle-target-btn-${target.target_id}`}
                        onClick={() => handleToggleActive(target.id || target.target_id)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
                          target.is_active
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                        title="Toggle whether detection triggers active security alert"
                      >
                        <Power className="w-3 h-3" />
                        <span>{target.is_active ? 'ACTIVE TARGET' : 'DISABLED'}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-[10px]">Matches: <strong className="text-amber-400">{target.match_count || 0}</strong></span>
                      {isOperator && (
                        <button
                          data-testid={`delete-target-btn-${target.target_id}`}
                          onClick={() => handleDeleteWatchlist(target.id || target.target_id)}
                          className="p-1 rounded text-red-400 hover:bg-red-950/50 transition-colors"
                          title="Remove target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reference Faces Tab Content */}
      {activeTab === 'reference_db' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {referenceFaces.map((face) => (
            <div
              key={face.id || face.person_id}
              data-testid={`reference-face-card-${face.person_id}`}
              className="p-3.5 rounded-xl bg-[#10141f] border border-[#1e2638] flex items-center space-x-3"
            >
              <img
                src={face.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                alt={face.name}
                className="w-12 h-12 rounded-lg object-cover border border-[#252f44]"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono-hud text-blue-400 block">{face.person_id}</span>
                <p className="font-semibold text-xs text-white truncate">{face.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{face.department}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Watchlist Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div 
            data-testid="add-watchlist-modal"
            className="w-full max-w-lg bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                  Add Dynamic Watchlist Target
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddWatchlist} className="p-5 space-y-4 text-xs font-mono-hud text-slate-200">
              <div>
                <label className="block text-slate-300 mb-1">Subject Full Name *</label>
                <input
                  data-testid="new-target-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dmitri Volkov"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    data-testid="new-target-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Suspect">Suspect</option>
                    <option value="Banned">Banned Contractor</option>
                    <option value="VIP">VIP Escort</option>
                    <option value="Missing">Missing Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Risk Severity Level</label>
                  <select
                    data-testid="new-target-risk-select"
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Reference Face Image URL</label>
                <input
                  data-testid="new-target-image-input"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or sample face photo URL"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Security Intelligence Description</label>
                <textarea
                  data-testid="new-target-desc-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Case notes, reason for flagging, or required response protocol..."
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white focus:outline-none font-sans"
                />
              </div>

              <div className="pt-2 border-t border-[#1e2638] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-[#161c28] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-new-target-btn"
                  disabled={submitting}
                  className="px-5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  {submitting ? 'Saving...' : 'Save Watchlist Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reference Face Modal */}
      {showAddFaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                Enroll Biometric Reference Face
              </h3>
              <button onClick={() => setShowAddFaceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddReferenceFace} className="p-5 space-y-4 text-xs font-mono-hud text-slate-200">
              <div>
                <label className="block text-slate-300 mb-1">Person Name *</label>
                <input
                  type="text"
                  required
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white font-sans"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Department / Organization</label>
                <input
                  type="text"
                  value={refDept}
                  onChange={(e) => setRefDept(e.target.value)}
                  placeholder="e.g. Engineering / Security / Operations"
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white font-sans"
                />
              </div>
              <div className="pt-2 border-t border-[#1e2638] flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddFaceModal(false)} className="px-4 py-2 rounded bg-[#161c28]">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 font-bold text-white">Enroll Identity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
