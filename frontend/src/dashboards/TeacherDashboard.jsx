import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    ClipboardList,
    Plus,
    CheckCircle2,
    Clock,
    MoreVertical,
    BookOpen,
    PieChart,
    ArrowRight,
    Loader2,
    X,
    Calendar,
    ChevronRight,
    TrendingUp,
    FileText
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

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [tasks, setTasks] = useState([]);
    const [homework, setHomework] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
    const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', dueDate: '', classId: '' });

    useEffect(() => {
        const path = location.pathname;
        if (path === '/classes') setActiveTab('classes');
        else if (path === '/assignments') setActiveTab('assignments');
        else if (path === '/attendance') setActiveTab('attendance');
        else setActiveTab('overview');
    }, [location]);

    const fetchData = async () => {
        try {
            const [tasksRes, classesRes, hwRes] = await Promise.all([
                api.get('/teacher/tasks'),
                api.get('/teacher/classes'),
                api.get('/teacher/homework')
            ]);
            setTasks(tasksRes.data.data);
            setClasses(classesRes.data.data);
            setHomework(hwRes.data.data);
        } catch (error) {
            console.error('Error fetching teacher data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleTask = async (id) => {
        try {
            await api.put(`/teacher/tasks/${id}/complete`);
            fetchData();
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const handleCreateHomework = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/homework', homeworkForm);
            setIsHomeworkModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create homework');
        }
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
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight uppercase italic">{user?.name}'s Command Center</h1>
                                    <p className="text-slate-500 font-medium tracking-tight">Manage your lectures, students, and administrative responsibilities.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsHomeworkModalOpen(true)} className="btn-primary py-4 px-8 shadow-2xl shadow-primary-900/20 translate-y-[-2px] active:translate-y-0 transition-all">
                                        <Plus size={20} />
                                        <span>Create New Homework</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Assigned Classes', value: classes.length, icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50' },
                                    { label: 'Pending Tasks', value: tasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { label: 'Assignments Given', value: homework.length, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                    { label: 'Avg. Attendance', value: '92%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                ].map((stat, i) => (
                                    <div key={i} className="card-premium p-6 border-slate-100 hover:border-primary-200 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                                <stat.icon size={22} />
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                        <Users className="text-primary-600" size={24} />
                                        Your Classes
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {classes.map((c) => (
                                            <div key={c._id} className="card-premium p-6 group cursor-pointer hover:shadow-xl hover:shadow-primary-100/20 transition-all border-slate-100">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{c.name}</h3>
                                                <p className="text-slate-500 font-medium text-sm">Section: {c.section}</p>
                                                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{c.students?.length || 0} Students</span>
                                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                        {classes.length === 0 && (
                                            <div className="col-span-full p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center text-slate-400 font-medium italic">
                                                No classes assigned yet. Wait for the admin to assign you some.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                        <Clock className="text-amber-500" size={24} />
                                        Task Timeline
                                    </h2>
                                    <div className="card-premium p-8 bg-slate-50 border-none">
                                        <div className="space-y-6">
                                            {tasks.map((task) => (
                                                <div key={task._id} className={`flex items-start gap-4 ${task.status === 'completed' ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                                                    <button
                                                        onClick={() => toggleTask(task._id)}
                                                        disabled={task.status === 'completed'}
                                                        className={`mt-1 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-primary-400'}`}
                                                    >
                                                        {task.status === 'completed' && <CheckCircle2 size={14} />}
                                                    </button>
                                                    <div>
                                                        <p className={`text-sm font-bold tracking-tight ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</p>
                                                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-[0.1em]">Origin: Admin</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {tasks.length === 0 && (
                                                <p className="text-center py-10 text-slate-400 text-sm font-medium italic">Your task list is currently empty.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/teacher')} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                    <ChevronRight size={20} className="rotate-180" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 uppercase italic">Class Roster</h1>
                                    <p className="text-slate-500 font-medium">Detailed view of your current teaching assignments.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {classes.map((c) => (
                                    <div key={c._id} className="card-premium p-10 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform"></div>
                                        <div className="relative z-10 space-y-8">
                                            <div className="badge bg-indigo-50 text-indigo-600 border-none font-black uppercase tracking-widest text-[10px]">Active Session</div>
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 italic">{c.name}</h3>
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Section {c.section}</p>
                                            </div>
                                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users size={18} className="text-primary-600" />
                                                    <span className="font-bold text-slate-700">{c.students?.length || 0} Students</span>
                                                </div>
                                                <button className="text-primary-600 font-black text-xs uppercase hover:underline">Manage Class</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => navigate('/teacher')} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                        <ChevronRight size={20} className="rotate-180" />
                                    </button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 uppercase italic">Assigned Homework</h1>
                                        <p className="text-slate-500 font-medium">Monitor student progress and submission status.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsHomeworkModalOpen(true)} className="btn-primary py-4 px-8 shadow-2xl shadow-primary-900/10">
                                    <Plus size={20} /> Assign New
                                </button>
                            </div>

                            <div className="overflow-x-auto bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Assignment Title</th>
                                            <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Class Target</th>
                                            <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Deadline</th>
                                            <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {homework.map((hw) => (
                                            <tr key={hw._id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="font-bold text-slate-900">{hw.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 italic uppercase">
                                                        {hw.classId?.name}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="text-sm font-bold text-slate-500">{new Date(hw.dueDate).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] tracking-widest uppercase">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        Active
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {homework.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-10 py-20 text-center text-slate-400 italic">No homework records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <Modal isOpen={isHomeworkModalOpen} onClose={() => setIsHomeworkModalOpen(false)} title="Assign New Homework">
                <form onSubmit={handleCreateHomework} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Homework Title</label>
                        <input className="input-field" placeholder="e.g., Algebra Worksheet 4" required onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Description</label>
                        <textarea className="input-field min-h-[120px] pt-4" placeholder="Explain the assignment thoroughly..." required onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Target Class</label>
                            <select className="input-field" required onChange={(e) => setHomeworkForm({ ...homeworkForm, classId: e.target.value })}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Due Date</label>
                            <input className="input-field" type="date" required onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-5 mt-6 shadow-2xl shadow-primary-900/20 font-black uppercase tracking-[0.2em] text-xs h-auto">Register Assignment</button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherDashboard;
