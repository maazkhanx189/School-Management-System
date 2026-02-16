import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Loader2,
    TrendingUp,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="card-premium p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 transition-transform group-hover:scale-110 ${color}`}>
            <Icon size={96} />
        </div>
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{value}</span>
        </div>
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 block">{subtitle}</span>
    </div>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const [homework, setHomework] = useState([]);
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const [hwRes, feeRes] = await Promise.all([
                    api.get('/student/homework'),
                    api.get('/student/fees')
                ]);
                setHomework(hwRes.data.data);
                setFeeData(feeRes.data.data);
            } catch (error) {
                console.error('Error fetching student data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Hello, {user?.name}! 👋</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Stay updated with your academic progress and school notices.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200">
                    <Calendar className="text-primary-600" size={20} />
                    <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                    title="Overall Mark"
                    value="B+"
                    subtitle="Based on latest exams"
                    icon={TrendingUp}
                    color="bg-primary-500"
                />
                <DashboardCard
                    title="Pending Homework"
                    value={homework.length}
                    subtitle="Assignments yet to submit"
                    icon={BookOpen}
                    color="bg-amber-500"
                />
                <DashboardCard
                    title="Fees Remaining"
                    value={`$${feeData?.fee?.remainingAmount || 0}`}
                    subtitle={`Due: ${feeData?.fee?.month || 'No Record'}`}
                    icon={CreditCard}
                    color="bg-rose-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Homework Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <BookOpen className="text-primary-600" size={24} />
                            Recent Assignments
                        </h2>
                        <button className="text-primary-600 font-bold hover:underline text-sm uppercase tracking-wider">Expand List</button>
                    </div>

                    <div className="space-y-4">
                        {homework.map((item) => (
                            <div key={item._id} className="card-premium p-6 flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.teacherId?.name}</p>
                                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 mb-2">DUE: {new Date(item.dueDate).toLocaleDateString()}</p>
                                    <div className="badge-warning">Not Submitted</div>
                                </div>
                            </div>
                        ))}
                        {homework.length === 0 && (
                            <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 italic text-slate-400">
                                No homework assigned yet. Enjoy your free time! 🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Fee Summary */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <CreditCard className="text-indigo-600" size={24} />
                        Financial Overview
                    </h2>
                    <div className="card-premium p-8 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Outstanding Fees</p>
                                <h3 className="text-4xl font-bold tracking-tight">${feeData?.fee?.remainingAmount || 0}</h3>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-800">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-[0.1em]">
                                    <span className="text-slate-500">Total Charged</span>
                                    <span>${feeData?.fee?.totalAmount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-[0.1em]">
                                    <span className="text-slate-500">Paid to date</span>
                                    <span className="text-emerald-400">${feeData?.fee?.paidAmount || 0}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl shadow-black/20">
                                Request Receipt
                            </button>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] border border-amber-100 bg-amber-50/50 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-amber-500" size={20} />
                            <p className="font-bold text-amber-900 text-sm">Action Required</p>
                        </div>
                        <p className="text-xs text-amber-800/80 leading-relaxed font-medium">Please ensure all library books from the previous term are returned by Friday to avoid account suspension.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
