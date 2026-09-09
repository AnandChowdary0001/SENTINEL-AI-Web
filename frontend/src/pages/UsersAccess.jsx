import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  CheckSquare, 
  Square, 
  FileText, 
  UserPlus, 
  Trash2, 
  Lock,
  Camera,
  Activity,
  Clock
} from 'lucide-react';

export default function UsersAccess() {
  const { API, user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'audit'
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState(null);

  // Add User Form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('Operator@123456');
  const [newRole, setNewRole] = useState('operator');
  const [selectedCameras, setSelectedCameras] = useState(['CAM-01', 'CAM-02']);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, camsRes, auditRes] = await Promise.all([
        axios.get(`${API}/auth/users`, { withCredentials: true }),
        axios.get(`${API}/cameras`, { withCredentials: true }),
        axios.get(`${API}/audit-logs?limit=100`, { withCredentials: true })
      ]);
      setUsers(usersRes.data);
      setCameras(camsRes.data);
      setAuditLogs(auditRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user access matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/auth/register`,
        {
          email: newEmail,
          password: newPassword,
          name: newName,
          role: newRole,
          allowed_camera_ids: selectedCameras
        },
        { withCredentials: true }
      );
      toast.success(`User ${newEmail} created with ${newRole} privileges`);
      setShowAddUserModal(false);
      setNewEmail('');
      setNewName('');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create user: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUserForPerms) return;
    setSubmitting(true);
    try {
      await axios.put(
        `${API}/auth/users/${selectedUserForPerms.id}/permissions`,
        {
          role: selectedUserForPerms.role,
          allowed_camera_ids: selectedUserForPerms.allowed_camera_ids
        },
        { withCredentials: true }
      );
      toast.success(`Permissions updated for ${selectedUserForPerms.email}`);
      setSelectedUserForPerms(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Delete operator account ${userEmail}?`)) return;
    try {
      await axios.delete(`${API}/auth/users/${userId}`, { withCredentials: true });
      toast.success('User account removed');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const toggleCameraForSelectedUser = (camId) => {
    if (!selectedUserForPerms) return;
    const current = selectedUserForPerms.allowed_camera_ids || [];
    const updated = current.includes(camId)
      ? current.filter(id => id !== camId)
      : [...current, camId];
    setSelectedUserForPerms({ ...selectedUserForPerms, allowed_camera_ids: updated });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-100 uppercase">
              Role-Based Access Control (RBAC)
            </h1>
          </div>
          <p className="text-xs font-mono-hud text-slate-400 mt-0.5">
            Manage operator accounts, camera authorization matrices, and comprehensive audit trails
          </p>
        </div>

        {isAdmin && (
          <button
            data-testid="add-user-btn"
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 font-display uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Operator Account</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#1e2638]">
        <button
          data-testid="tab-users-matrix"
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 text-xs font-mono-hud font-bold uppercase transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'users'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Permissions ({users.length})</span>
        </button>

        <button
          data-testid="tab-audit-logs"
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 text-xs font-mono-hud font-bold uppercase transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'audit'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[#10141f] rounded-xl border border-[#1e2638] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-hud">
                <thead className="bg-[#141a26] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                  <tr>
                    <th className="p-3.5">Operator</th>
                    <th className="p-3.5">Security Role</th>
                    <th className="p-3.5">Authorized Cameras</th>
                    <th className="p-3.5">Created At</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] text-slate-200">
                  {users.map((u) => (
                    <tr 
                      key={u.id} 
                      data-testid={`user-row-${u.email}`}
                      className="hover:bg-[#151b2a] transition-colors"
                    >
                      <td className="p-3.5">
                        <p className="font-bold text-white text-xs font-sans">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono-hud">{u.email}</p>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          u.role === 'admin' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                          u.role === 'operator' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {u.role === 'admin' ? (
                          <span className="text-emerald-400 font-bold">ALL FEEDS (Full Authority)</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(u.allowed_camera_ids || []).map(cid => (
                              <span key={cid} className="px-1.5 py-0.2 rounded bg-[#182030] text-blue-300 text-[10px] border border-[#252f44]">
                                {cid}
                              </span>
                            ))}
                            {(!u.allowed_camera_ids || u.allowed_camera_ids.length === 0) && (
                              <span className="text-slate-500">No cameras assigned</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {isAdmin && (
                          <>
                            <button
                              data-testid={`edit-perm-btn-${u.email}`}
                              onClick={() => setSelectedUserForPerms(u)}
                              className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30 text-[11px] font-bold"
                            >
                              Edit Matrix
                            </button>
                            {u.id !== currentUser?.id && (
                              <button
                                data-testid={`delete-user-btn-${u.email}`}
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 rounded text-red-400 hover:bg-red-950/40 transition-colors"
                                title="Delete Operator"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab Content */}
      {activeTab === 'audit' && (
        <div className="bg-[#10141f] rounded-xl border border-[#1e2638] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-hud">
              <thead className="bg-[#141a26] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action Code</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Audit Log Details</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030] text-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#151b2a] transition-colors">
                    <td className="p-3.5 text-slate-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-blue-400">{log.action}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#182030] text-slate-300 text-[10px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans font-medium text-slate-200">
                      {log.user_email}
                    </td>
                    <td className="p-3.5 font-sans text-slate-300 max-w-sm">
                      {log.details}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono-hud">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div 
            data-testid="edit-permissions-modal"
            className="w-full max-w-lg bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                Permissions: {selectedUserForPerms.name}
              </h3>
              <button onClick={() => setSelectedUserForPerms(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono-hud text-slate-200">
              <div>
                <label className="block text-slate-300 mb-1">Assigned Security Role</label>
                <select
                  data-testid="edit-user-role-select"
                  value={selectedUserForPerms.role}
                  onChange={(e) => setSelectedUserForPerms({ ...selectedUserForPerms, role: e.target.value })}
                  className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="operator">Security Operator (Monitoring & Alerts)</option>
                  <option value="viewer">Viewer (Authorized Feeds Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">
                  Camera Authorization Matrix (Select accessible feeds):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#141923] border border-[#252f44] rounded">
                  {cameras.map((c) => {
                    const isChecked = selectedUserForPerms.allowed_camera_ids?.includes(c.camera_id) || selectedUserForPerms.role === 'admin';
                    return (
                      <button
                        key={c.camera_id}
                        type="button"
                        data-testid={`perm-cam-${c.camera_id}`}
                        onClick={() => toggleCameraForSelectedUser(c.camera_id)}
                        disabled={selectedUserForPerms.role === 'admin'}
                        className={`flex items-center space-x-2 p-2 rounded text-left transition-colors ${
                          isChecked ? 'bg-blue-950/70 border border-blue-800 text-white' : 'bg-[#182030] text-slate-400'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> : <Square className="w-3.5 h-3.5" />}
                        <span className="truncate">{c.camera_id}: {c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1e2638] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPerms(null)}
                  className="px-4 py-2 rounded bg-[#161c28] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="save-permissions-btn"
                  disabled={submitting}
                  onClick={handleUpdatePermissions}
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Save Access Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div 
            data-testid="create-user-modal"
            className="w-full max-w-lg bg-[#0f141d] border border-[#252f44] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#141a26] px-5 py-3.5 border-b border-[#252f44] flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                Create New Operator Account
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs font-mono-hud text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Operator Name *</label>
                  <input
                    data-testid="new-user-name-input"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Officer John Davis"
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Email Address *</label>
                  <input
                    data-testid="new-user-email-input"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="officer@sentinel.security"
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Initial Password *</label>
                  <input
                    data-testid="new-user-pwd-input"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Role Assignment</label>
                  <select
                    data-testid="new-user-role-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-[#161c28] border border-[#252f44] rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="operator">Security Operator</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1e2638] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded bg-[#161c28] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-new-user-btn"
                  disabled={submitting}
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-display uppercase tracking-wider"
                >
                  {submitting ? 'Registering...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
