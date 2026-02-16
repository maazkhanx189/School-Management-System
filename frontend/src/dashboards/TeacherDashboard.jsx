import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    Calendar
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
    const [tasks, setTasks] = useState([]);
    const [homework, setHomework] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
    const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', dueDate: '', classId: '' });

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
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome, {user?.name} 🍏</h1>
                    <p className="text-slate-500 font-medium">Manage your lectures, students, and administrative tasks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsHomeworkModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        Create Homework
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
                    <div key={i} className="card-premium p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="text-primary-600" size={24} />
                        Current Classes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {classes.map((c) => (
                            <div key={c._id} className="card-premium p-6 group">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase">{c.name}</h3>
                                <p className="text-slate-500 font-medium text-sm">Section: {c.section}</p>
                                <div className="mt-6 flex items-center text-primary-600 font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    View Class Roster <ArrowRight size={16} />
                                </div>
                            </div>
                        ))}
                        {classes.length === 0 && (
                            <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center text-slate-400">
                                No classes assigned to you yet.
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 pt-4">
                        <ClipboardList className="text-indigo-600" size={24} />
                        Recent Homework
                    </h2>
                    <div className="space-y-4">
                        {homework.map((hw) => (
                            <div key={hw._id} className="card-premium p-5 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900">{hw.title}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{hw.classId?.name} • Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="badge-primary">Assigned</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <ClipboardList className="text-amber-600" size={24} />
                        Admin Tasks
                    </h2>
                    <div className="card-premium p-6 bg-slate-50">
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task._id} className={`flex items-start gap-4 ${task.status === 'completed' ? 'opacity-50' : ''}`}>
                                    <button
                                        onClick={() => toggleTask(task._id)}
                                        disabled={task.status === 'completed'}
                                        className={`mt-1 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                                    >
                                        {task.status === 'completed' && <CheckCircle2 size={14} />}
                                    </button>
                                    <div>
                                        <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">By: {task.assignedBy?.name}</p>
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-center py-8 text-slate-400 text-sm italic">No administrative tasks assigned.</p>
                            )}
                        </div>
                    </div>

                    <div className="card-premium p-6 bg-slate-900 text-white relative overflow-hidden">
                        <PieChart className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                        <h4 className="font-bold relative z-10">Monthly Performance</h4>
                        <p className="text-slate-400 text-sm mb-4 relative z-10">Track student success rates and attendance stats.</p>
                        <button className="btn-primary w-full bg-white text-slate-900 border-none h-11 text-xs font-bold uppercase relative z-10">Generate Stat Sheet</button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isHomeworkModalOpen} onClose={() => setIsHomeworkModalOpen(false)} title="Assing Homework">
                <form onSubmit={handleCreateHomework} className="space-y-4">
                    <input className="input-field" placeholder="Homework Title" required onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })} />
                    <textarea className="input-field min-h-[100px]" placeholder="Homework Instructions" required onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })} />
                    <select className="input-field" required onChange={(e) => setHomeworkForm({ ...homeworkForm, classId: e.target.value })}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                    </select>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Due Date</label>
                        <input className="input-field" type="date" required onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 mt-4">Assign to Students</button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherDashboard;
