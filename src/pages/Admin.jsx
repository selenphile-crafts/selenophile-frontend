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
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [newComplaint, setNewComplaint] = useState({ userId: '', text: '' });
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [paymentUserId, setPaymentUserId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [assignFeeAmounts, setAssignFeeAmounts] = useState({});

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
      const [usersRes, complaintsRes] = await Promise.all([
        api.get('/users'),
        api.get('/complaints')
      ]);
      setUsers(usersRes.data);
      setComplaints(complaintsRes.data);
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

  const recordPayment = async (userId, amount) => {
    if (!amount || amount <= 0) return;
    try {
      await api.patch(`/users/${userId}/fee`, { amount: parseFloat(amount) });
      await fetchData();
      setToast({ message: 'Payment recorded', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error recording payment', type: 'error' });
    }
  };

  const addComplaint = async () => {
    if (!newComplaint.userId || !newComplaint.text) return;
    try {
      await api.post('/complaints', newComplaint);
      await fetchData();
      setShowComplaintForm(false);
      setNewComplaint({ userId: '', text: '' });
      setToast({ message: 'Complaint added', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error adding complaint', type: 'error' });
    }
  };

  const resolveComplaint = async (id) => {
    try {
      await api.patch(`/complaints/${id}/resolve`);
      await fetchData();
      setToast({ message: 'Complaint resolved', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error resolving complaint', type: 'error' });
    }
  };

  const removeComplaint = async (id) => {
    try {
      await api.delete(`/complaints/${id}`);
      await fetchData();
      setToast({ message: 'Complaint removed', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error removing complaint', type: 'error' });
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentUserId || !paymentAmount || paymentAmount <= 0) {
      setToast({ message: 'Please select a valid member and amount', type: 'error' });
      return;
    }
    try {
      await api.patch(`/users/${paymentUserId}/fee`, { amount: parseFloat(paymentAmount) });
      await fetchData();
      setToast({ message: 'Payment recorded', type: 'success' });
      setPaymentAmount('');
      setPaymentUserId('');
    } catch (err) {
      setToast({ message: 'Error recording payment', type: 'error' });
    }
  };

  const handleAssignFee = async (userId) => {
    const amount = assignFeeAmounts[userId];
    if (!amount || amount <= 0) {
      setToast({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }
    try {
      await api.patch(`/users/${userId}/add-fee`, { amount: parseFloat(amount) });
      await fetchData();
      setToast({ message: 'Pending fee assigned', type: 'success' });
      setAssignFeeAmounts({ ...assignFeeAmounts, [userId]: '' });
    } catch (err) {
      setToast({ message: 'Error assigning fee', type: 'error' });
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
  const totalFeesDue = users.reduce((sum, u) => sum + (u.feeDue || 0), 0);
  const openComplaints = complaints.filter(c => !c.resolved).length;
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
    const debtors = users.filter(u => u.feeDue > 0);
    const unresolvedComplaints = complaints.filter(c => !c.resolved);

    return (
      <div className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-section-gap">
        {/* Admin Header */}
        <div className="mb-section-gap border-b border-surface-variant pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
                <h1 className="font-headline-xl text-headline-xl text-primary flex items-center gap-2"><span className="material-symbols-outlined text-4xl">inventory</span> Admin Control Hub</h1>
                <p className="font-body-md text-on-surface-variant mt-2">Manage members, fees, account status & library complaints</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl px-5 py-2 text-sm shadow-sm flex items-center gap-2 w-max">
                <span className="material-symbols-outlined text-primary text-base">admin_panel_settings</span>
                <span className="font-medium text-primary">Head Librarian Access</span>
            </div>
        </div>

        {/* Stats Cards (Overview) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-section-gap">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-4xl text-primary">groups</span>
                    <span className="text-3xl font-bold text-primary">{activeMembers}</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2">Active Members</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-4xl text-primary">payments</span>
                    <span className="text-3xl font-bold text-primary">₹{totalFeesDue}</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2">Pending Dues</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-4xl text-primary">report_problem</span>
                    <span className="text-3xl font-bold text-primary">{openComplaints}</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2">Open Complaints</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-4xl text-primary">library_books</span>
                    <span className="text-3xl font-bold text-primary">{totalMembers}</span>
                </div>
                <p className="text-on-surface-variant font-medium mt-2">Total Members</p>
            </div>
        </div>

        {/* Assign Pending Fee Container */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm mb-section-gap p-gutter">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-variant pb-3">
                <span className="material-symbols-outlined text-primary">add_card</span>
                <h2 className="font-headline-md text-headline-md text-primary">Members directory</h2>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                {users.map(u => (
                    <div key={u._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-surface-bright p-3 rounded-lg border border-surface-variant">
                        <div>
                            <p className="font-semibold text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-variant">Joined</p>
                            <input
                                type="date"
                                value={new Date(u.createdAt).toISOString().split('T')[0]}
                                onChange={(e) => updateJoinDate(u._id, e.target.value)}
                                className="text-sm font-medium bg-transparent border-b border-surface-variant focus:outline-none focus:border-primary w-full pb-0.5 mt-0.5 cursor-pointer"
                            />
                        </div>
                        <div>
                            <input 
                                type="number" 
                                value={assignFeeAmounts[u._id] || ''}
                                onChange={(e) => setAssignFeeAmounts({ ...assignFeeAmounts, [u._id]: e.target.value })}
                                placeholder="Fee Amount (₹)" 
                                className="w-full bg-white border border-surface-variant rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <button 
                                onClick={() => handleAssignFee(u._id)}
                                className="w-full bg-primary text-on-primary py-2 rounded-lg font-label-md hover:bg-secondary transition-all active:scale-95 flex justify-center items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Assign
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Grid: Members + Fee Management | Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Left & Middle combined: Members table & Fee recorder/reminder */}
            <div className="lg:col-span-2 flex flex-col gap-gutter">
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
                                    <th className="px-5 py-3 font-semibold">Fee Due (₹)</th>
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
                                        <td className={`px-5 py-3 font-semibold ${u.feeDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>₹{u.feeDue || 0}</td>
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

                {/* Fee Reminder + Fee Recorder combined card */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-surface-container-high px-gutter py-4 border-b border-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">receipt_long</span>
                        <h2 className="font-headline-md text-headline-md text-primary">Fee Remainder & Recorder</h2>
                    </div>
                    <div className="p-gutter grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fee Reminder list */}
                        <div>
                            <h3 className="font-label-md text-label-md text-primary mb-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-lg">reminder</span> Pending Fee Alerts
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {debtors.length === 0 ? (
                                    <div className="bg-surface-bright p-3 rounded-xl text-center text-sm text-on-surface-variant"> No pending fees! All clear.</div>
                                ) : (
                                    debtors.map(m => (
                                        <div key={m._id} className="bg-surface-bright rounded-xl p-3 flex justify-between items-center border-l-4 border-primary">
                                            <div>
                                                <p className="font-semibold text-sm">{m.firstName} {m.lastName}</p>
                                                <p className="text-xs text-on-surface-variant">Due: ₹{m.feeDue}</p>
                                            </div>
                                            <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm text-primary">Reminder</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {/* Fee Recorder */}
                        <div className="md:border-l md:border-surface-variant md:pl-6">
                            <h3 className="font-label-md text-label-md text-primary mb-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-lg">edit_note</span> Record Payment
                            </h3>
                            <div className="bg-surface-bright rounded-xl p-4">
                                <label className="text-sm font-medium text-on-surface-variant">Select Member</label>
                                <select 
                                    value={paymentUserId}
                                    onChange={(e) => setPaymentUserId(e.target.value)}
                                    className="w-full mt-1 mb-3 bg-white border border-surface-variant rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">-- Choose member --</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>
                                            {u.firstName} {u.lastName} ({u.status}) - Due: ₹{u.feeDue || 0}
                                        </option>
                                    ))}
                                </select>
                                <label className="text-sm font-medium text-on-surface-variant">Amount Received (₹)</label>
                                <input 
                                    type="number" 
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="e.g., 500" 
                                    className="w-full mt-1 mb-4 bg-white border border-surface-variant rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button 
                                    onClick={handleRecordPayment}
                                    className="w-full bg-primary text-on-primary py-2 rounded-lg font-label-md hover:bg-secondary transition-all active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">check_circle</span> Record Payment
                                </button>
                                <p className="text-caption text-on-surface-variant mt-2">* Payment reduces outstanding fee</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Complaint Management */}
            <div className="space-y-gutter">
                <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm sticky top-20">
                    <div className="bg-surface-container-high px-gutter py-4 border-b border-surface-variant flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">feedback</span>
                            <h2 className="font-headline-md text-headline-md text-primary">Complaints Desk</h2>
                        </div>
                        <button 
                            onClick={() => setShowComplaintForm(!showComplaintForm)}
                            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium hover:bg-primary/20 transition flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">{showComplaintForm ? 'close' : 'add'}</span> {showComplaintForm ? 'Cancel' : 'New'}
                        </button>
                    </div>
                    <div className="p-gutter">
                        {/* New complaint form */}
                        <AnimatePresence>
                            {showComplaintForm && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-5 overflow-hidden"
                                >
                                    <div className="p-3 bg-surface-bright rounded-xl border border-surface-variant">
                                        <select 
                                            value={newComplaint.userId}
                                            onChange={e => setNewComplaint({ ...newComplaint, userId: e.target.value })}
                                            className="w-full border border-surface-variant rounded-lg p-2 text-sm mb-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">-- Select member --</option>
                                            {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} | {u.email}</option>)}
                                        </select>
                                        <textarea 
                                            rows={2} 
                                            placeholder="Describe the issue..." 
                                            value={newComplaint.text}
                                            onChange={e => setNewComplaint({ ...newComplaint, text: e.target.value })}
                                            className="w-full border border-surface-variant rounded-lg p-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={addComplaint} className="bg-primary text-on-primary text-sm px-4 py-1.5 rounded-lg active:scale-95 transition-transform">Submit</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Complaint list container */}
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {complaints.length === 0 ? (
                                <div className="text-center text-on-surface-variant py-6 bg-surface-bright rounded-xl"> No complaints. Library is peaceful.</div>
                            ) : (
                                complaints.map(c => (
                                    <div key={c._id} className={`p-3 rounded-xl border ${c.resolved ? 'bg-green-50 border-green-200' : 'bg-surface-bright border-surface-variant'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <p className={`font-semibold flex items-center gap-1 text-sm ${c.resolved ? 'text-green-800' : ''}`}>
                                                    <span className={`material-symbols-outlined text-sm ${c.resolved ? 'text-green-600' : 'text-primary'}`}>account_circle</span> {c.userName}
                                                    {c.resolved && <span className="ml-2 text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Resolved</span>}
                                                </p>
                                                <p className={`text-sm mt-1 ${c.resolved ? 'text-green-700' : 'text-on-surface-variant'}`}>“{c.text}”</p>
                                                <p className={`text-xs mt-2 ${c.resolved ? 'text-green-600/70' : 'text-gray-500'}`}>{new Date(c.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {!c.resolved && (
                                                    <button 
                                                        onClick={() => resolveComplaint(c._id)} 
                                                        className="text-xs bg-white border border-surface-variant px-3 py-1 rounded-full hover:bg-primary hover:text-white transition active:scale-95 shadow-sm"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => removeComplaint(c._id)} 
                                                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full hover:bg-red-600 hover:text-white transition active:scale-95 shadow-sm w-full"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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