import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Users,
    Building2,
    TrendingUp,
    Clock,
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <TrendingUp size={14} />
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
);

const SuperAdminDashboard = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSchools: 0,
        activeSchools: 0,
        totalRevenue: '$0',
        impendingExpirations: 0
    });

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const { data } = await api.get('/superadmin/schools');
                if (data.success) {
                    setSchools(data.data);

                    const active = data.data.filter(s => s.isActive).length;
                    const expiring = data.data.filter(s => {
                        const end = new Date(s.subscriptionEnd);
                        const today = new Date();
                        const diff = (end - today) / (1000 * 60 * 60 * 24);
                        return diff > 0 && diff < 7;
                    }).length;

                    setStats({
                        totalSchools: data.data.length,
                        activeSchools: active,
                        totalRevenue: `$${data.data.length * 499}`, // Mock pricing
                        impendingExpirations: expiring
                    });
                }
            } catch (error) {
                console.error('Error fetching schools:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, []);

    const toggleStatus = async (id) => {
        try {
            const { data } = await api.patch(`/superadmin/schools/${id}/toggle`);
            if (data.success) {
                setSchools(schools.map(s => s._id === id ? data.data : s));
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
                    <p className="text-slate-500">Manage global schools and subscriptions</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-200">
                    <Plus size={20} />
                    Create New School
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Schools"
                    value={stats.totalSchools}
                    icon={Building2}
                    color="bg-primary-600"
                    trend="+12%"
                />
                <StatCard
                    title="Active Schools"
                    value={stats.activeSchools}
                    icon={CheckCircle2}
                    color="bg-emerald-600"
                    trend="+2"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={stats.totalRevenue}
                    icon={TrendingUp}
                    color="bg-indigo-600"
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.impendingExpirations}
                    icon={AlertTriangle}
                    color="bg-amber-500"
                />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-900">Registered Schools</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search schools..."
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-100 outline-none w-64 transition-all"
                            />
                        </div>
                        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">School Name</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact Email</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Plan Ends</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {schools.map((school) => (
                                <tr key={school._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
                                                {school.name[0]}
                                            </div>
                                            <span className="font-semibold text-slate-900">{school.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-600 font-medium">{school.email}</td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${school.isActive
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                            }`}>
                                            {school.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {school.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-600 font-medium whitespace-nowrap">
                                        {new Date(school.subscriptionEnd).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleStatus(school._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${school.isActive
                                                        ? 'text-rose-600 hover:bg-rose-50'
                                                        : 'text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                            >
                                                {school.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {schools.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-4">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No schools found</h3>
                        <p className="text-slate-500">Start by creating your first school client.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
