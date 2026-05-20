import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = need first login, 2 = need second verification, 3 = full access
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Check token role on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'admin') {
        setStep(3);
        fetchData();
      } else if (payload.role === 'admin-pending') {
        setStep(2);
      } else {
        // regular member – no access
        navigate('/');
      }
    } catch (e) {
      navigate('/');
    }
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/users');
      setUsers(usersRes.data);
    } catch (err) {
      setToast({ message: 'Failed to load data', type: 'error' });
    }
  };

  const handleSecondLogin = async (e) => {
    e.preventDefault();
    
    // Quick sanitization for spaces
    const cleanId = adminId.replace(/\s+/g, '');
    const cleanPassword = adminPassword.replace(/\s+/g, '');

    setLoading(true);
    try {
      const res = await api.post('/auth/admin-second', { adminId: cleanId, adminPassword: cleanPassword });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setStep(3);
        setToast({ message: 'Admin access granted', type: 'success' });
        fetchData();
      } else {
        setToast({ message: 'Invalid admin ID or password', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Invalid admin ID or password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      await fetchData();
      setToast({ message: 'User status updated', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error updating status', type: 'error' });
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await api.delete(`/users/${id}`);
        await fetchData();
        setToast({ message: 'Member deleted', type: 'success' });
      } catch (err) {
        setToast({ message: 'Error deleting member', type: 'error' });
      }
    }
  };

  const updateJoinDate = async (id, date) => {
    try {
      await api.patch(`/users/${id}/join-date`, { date });
      await fetchData();
      setToast({ message: 'Join date updated', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error updating date', type: 'error' });
    }
  };

  // Computed Stats for Step 3 Dashboard
  const activeMembers = users.filter(u => u.status === 'active').length;
  const totalMembers = users.length;

  // Step 2: second verification modal
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full border border-surface-variant">
          <h3 className="font-headline-md text-headline-md text-primary mb-4">Admin Verification</h3>
          <form onSubmit={handleSecondLogin} className="space-y-4">
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant">Admin ID</label>
              <input
                type="text"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                required
                className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
                className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md hover:bg-secondary transition-all"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Step 3: full admin dashboard
  if (step === 3) {
    return (
      <div className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-section-gap">
        {/* Admin Header */}
        <div className="mb-section-gap border-b border-surface-variant pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
                <h1 className="font-headline-xl text-headline-xl text-primary flex items-center gap-2"><span className="material-symbols-outlined text-4xl">inventory</span> Admin Control Hub</h1>
                <p className="font-body-md text-on-surface-variant mt-2">Manage members and account status</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl px-5 py-2 text-sm shadow-sm flex items-center gap-2 w-max">
                <span className="material-symbols-outlined text-primary text-base">admin_panel_settings</span>
                <span className="font-medium text-primary">Admin Access</span>
            </div>
        </div>

        {/* Stats Cards (Overview) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter mb-section-gap">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-4xl text-primary">groups</span>
                    <span className="text-3xl font-bold text-primary">{activeMembers}</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2">Active Members</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-4xl text-primary">badge</span>
                    <span className="text-3xl font-bold text-primary">{totalMembers}</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2">Total Members</p>
            </div>
        </div>

        {/* Members Directory */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm mb-section-gap p-gutter">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-variant pb-3">
                <span className="material-symbols-outlined text-primary">group</span>
                <h2 className="font-headline-md text-headline-md text-primary">Members directory</h2>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                {users.map(u => (
                    <div key={u._id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-surface-bright p-3 rounded-lg border border-surface-variant">
                        <div>
                            <p className="font-semibold text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-variant">Joined</p>
                            <input
                                type="date"
                                value={(() => { try { return u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : ''; } catch(e) { return ''; } })()}
                                onChange={(e) => updateJoinDate(u._id, e.target.value)}
                                className="text-sm font-medium bg-transparent border-b border-surface-variant focus:outline-none focus:border-primary w-full pb-0.5 mt-0.5 cursor-pointer"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-variant">Contact</p>
                            <p className="text-sm font-medium">{u.contact}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Grid: Members Management */}
        <div className="grid grid-cols-1 gap-gutter">
            <div className="flex flex-col gap-gutter">
                {/* Active Members Table + Activate/Deactivate */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-surface-container-high px-gutter py-4 border-b border-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">badge</span>
                        <h2 className="font-headline-md text-headline-md text-primary">Account Control</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-surface-bright text-on-surface-variant border-b border-surface-variant">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Member</th>
                                    <th className="px-5 py-3 font-semibold">Contact Number</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b border-surface-variant hover:bg-surface-bright/50 transition">
                                        <td className="px-5 py-3 font-medium">{u.firstName} {u.lastName}</td>
                                        <td className="px-5 py-3 text-on-surface-variant">{u.contact}</td>
                                        <td className="px-5 py-3">
                                            {u.status === 'active' 
                                                ? <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">● Active</span>
                                                : <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">● Inactive</span>
                                            }
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => toggleUserStatus(u._id, u.status)}
                                                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                                                        u.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                >
                                                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => deleteMember(u._id)}
                                                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full font-medium hover:bg-red-600 hover:text-white transition active:scale-95 shadow-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Fallback (should not happen)
  return null;
};

export default Admin;