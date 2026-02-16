import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    TrendingUp,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    X,
    CreditCard,
    GraduationCap,
    Clock,
    Loader2
} from 'lucide-react';
import api from '../api/axios';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>
                {children}
            </motion.div>
        </div>
    );
};

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'teacher' });

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/admin/analytics');
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/admin/users', staffForm);
            if (data.success) {
                setIsStaffModalOpen(false);
                setStaffForm({ name: '', email: '', password: '', role: 'teacher' });
                alert('Staff member created successfully!');
                fetchAnalytics();
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create staff');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
    );

    const stats = [
        { label: 'Total Students', value: analytics?.studentCount || 0, icon: GraduationCap, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Total Teachers', value: analytics?.teacherCount || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Classes', value: analytics?.classCount || 0, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Collected Fees', value: `$${analytics?.fees?.totalPaid?.toLocaleString() || 0}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">School Insights Dashboard 📈</h1>
                    <p className="text-slate-500 font-medium">Overview of your school's performance and operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                        Generate Report
                    </button>
                    <button
                        onClick={() => setIsStaffModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                    >
                        <Plus size={20} />
                        Create Staff
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h4>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Financial Summary</h3>
                        <TrendingUp className="text-emerald-500" />
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Expected Revenue</p>
                                <h4 className="text-2xl font-bold text-slate-900">${analytics?.fees?.totalExpected?.toLocaleString() || 0}</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-rose-500 font-bold mb-1">Due: ${analytics?.fees?.totalRemaining?.toLocaleString() || 0}</p>
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${(analytics?.fees?.totalPaid / analytics?.fees?.totalExpected) * 100 || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Paid Status</p>
                                <p className="text-lg font-bold text-emerald-600">
                                    {Math.round((analytics?.fees?.totalPaid / analytics?.fees?.totalExpected) * 100) || 0}%
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pending Status</p>
                                <p className="text-lg font-bold text-rose-600">
                                    {Math.round((analytics?.fees?.totalRemaining / analytics?.fees?.totalExpected) * 100) || 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">New teacher added to Science Department</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
                            View Full Audit Log
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title="Create New Staff">
                <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                        <input
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary-500 outline-none transition-all"
                            placeholder="John Doe"
                            required
                            value={staffForm.name}
                            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <input
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary-500 outline-none transition-all"
                            type="email"
                            placeholder="john@school.com"
                            required
                            value={staffForm.email}
                            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Temporary Password</label>
                        <input
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary-500 outline-none transition-all"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={staffForm.password}
                            onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                        <select
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary-500 outline-none transition-all appearance-none"
                            value={staffForm.role}
                            onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                        >
                            <option value="teacher">Teacher</option>
                            <option value="administration">Administrative Staff</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold mt-6 hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all">
                        Create Account
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
