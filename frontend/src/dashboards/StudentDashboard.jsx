import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    BookOpen,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Loader2,
    TrendingUp,
    FileText,
    ChevronRight,
    User,
    Mail,
    School,
    Trophy,
    X,
    Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [homework, setHomework] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState(null);
    const [submissionText, setSubmissionText] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/homework') setActiveTab('homework');
        else if (path === '/fees') setActiveTab('fees');
        else if (path === '/profile') setActiveTab('profile');
        else setActiveTab('overview');
    }, [location]);

    const fetchStudentData = async () => {
        try {
            const [hwRes, feeRes, subRes] = await Promise.all([
                api.get('/student/homework'),
                api.get('/student/fees'),
                api.get('/student/submissions')
            ]);
            setHomework(hwRes.data.data);
            setFeeData(feeRes.data.data);
            setSubmissions(subRes.data.data);
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    const handleSubmitHomework = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/student/homework/${selectedHomework._id}/submit`, { submissionText });
            setIsSubmitModalOpen(false);
            setSubmissionText('');
            setSelectedHomework(null);
            alert('Homework submitted successfully!');
            fetchStudentData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit homework');
        }
    };

    const openSubmitModal = (hw) => {
        setSelectedHomework(hw);
        setIsSubmitModalOpen(true);
    };

    const isSubmitted = (homeworkId) => {
        return submissions.some(sub => sub.homeworkId._id === homeworkId || sub.homeworkId === homeworkId);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Hello, {user?.name}! 👋</h1>
                                    <p className="text-slate-500 font-medium tracking-tight">Stay updated with your academic progress and school notices.</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
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
                                        <button onClick={() => navigate('/homework')} className="text-primary-600 font-bold hover:underline text-sm uppercase tracking-wider">Expand List</button>
                                    </div>

                                    <div className="space-y-4">
                                        {homework.slice(0, 3).map((item) => (
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

                                            <button onClick={() => navigate('/fees')} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl shadow-black/20">
                                                Detailed Billing
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'homework' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/student')} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                    <ChevronRight size={20} className="rotate-180" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 italic">Academic Assignments</h1>
                                    <p className="text-slate-500 font-medium">Keep track of your homework and submissions.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {homework.map((item) => (
                                    <div key={item._id} className="card-premium p-8 space-y-6 group">
                                        <div className="flex items-start justify-between">
                                            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                                                <BookOpen size={28} />
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Due Date</span>
                                                <span className="font-bold text-slate-900">{new Date(item.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-500 text-sm italic">{item.description}</p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{item.teacherId?.name}</span>
                                            </div>
                                            {isSubmitted(item._id) ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-xs font-black uppercase">Submitted</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openSubmitModal(item)}
                                                    className="btn-primary py-2 px-6 text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                                >
                                                    <Send size={14} />
                                                    Submit Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {homework.length === 0 && (
                                    <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 italic text-slate-400">
                                        No homework assigned at the moment.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'fees' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/student')} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                    <ChevronRight size={20} className="rotate-180" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">Fee Statement</h1>
                                    <p className="text-slate-500 font-medium">Manage your school fee payments and history.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="card-premium p-10 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                                    <div className="relative z-10 space-y-8">
                                        <div>
                                            <div className="badge bg-indigo-500/20 text-indigo-300 border-none mb-4">CURRENT BALANCE</div>
                                            <h2 className="text-6xl font-black italic tracking-tighter">${feeData?.fee?.remainingAmount || 0}</h2>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                                            <div>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Billed</p>
                                                <p className="text-2xl font-bold">${feeData?.fee?.totalAmount || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Paid</p>
                                                <p className="text-2xl font-bold text-emerald-400">${feeData?.fee?.paidAmount || 0}</p>
                                            </div>
                                        </div>

                                        <button className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-bold tracking-widest transition-all shadow-2xl shadow-primary-900/40">
                                            PAY OUTSTANDING BALANCE
                                        </button>
                                    </div>
                                </div>

                                <div className="card-premium p-8 space-y-6">
                                    <h3 className="font-bold text-slate-900 text-lg">Payment History</h3>
                                    <div className="space-y-4">
                                        {feeData?.payments?.map((payment) => (
                                            <div key={payment._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{payment.paymentMethod || 'Cash'}</p>
                                                        <p className="text-xs text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-indigo-600">+${payment.amount}</span>
                                            </div>
                                        ))}
                                        {(!feeData?.payments || feeData.payments.length === 0) && (
                                            <div className="py-10 text-center text-slate-400 text-sm italic">No payment records found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/student')} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                    <ChevronRight size={20} className="rotate-180" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 italic">Student Profile</h1>
                                    <p className="text-slate-500 font-medium">Your personal and academic identity.</p>
                                </div>
                            </div>

                            <div className="max-w-4xl">
                                <div className="card-premium p-10 relative">
                                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                                        <div className="w-40 h-40 rounded-[3rem] bg-slate-100 flex items-center justify-center text-slate-300 border-4 border-white shadow-xl">
                                            <User size={80} />
                                        </div>
                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <h2 className="text-4xl font-black text-slate-900 mb-2">{user?.name}</h2>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                    <span className="badge bg-primary-50 text-primary-600 border-none px-4 font-bold">STUDENT</span>
                                                    <span className="badge bg-indigo-50 text-indigo-600 border-none px-4 font-bold">CLASS: {user?.classId?.name || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                                        <p className="font-bold text-slate-900">{user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <School size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</p>
                                                        <p className="font-bold text-slate-900">{user?.classId?.section || 'Not Assigned'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                                                    <Trophy size={28} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-amber-900 uppercase text-xs tracking-widest mb-1">Academic Standing</p>
                                                    <p className="text-sm font-medium text-amber-800/80 italic">You are in the top 15% of your class this term. Keep it up!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Homework">
                <form onSubmit={handleSubmitHomework} className="space-y-5 mt-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-1">{selectedHomework?.title}</h4>
                        <p className="text-xs text-slate-500">Due: {selectedHomework && new Date(selectedHomework.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Your Submission</label>
                        <textarea
                            className="input-field min-h-[200px] pt-4"
                            placeholder="Enter your homework answer or solution here..."
                            required
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-5 mt-6 shadow-2xl shadow-primary-900/20 font-black uppercase tracking-[0.2em] text-xs h-auto flex items-center justify-center gap-2">
                        <Send size={16} />
                        Submit to Teacher
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default StudentDashboard;
