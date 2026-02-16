import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    CreditCard,
    Briefcase,
    Search,
    Filter,
    TrendingUp,
    Plus,
    X,
    Loader2,
    CheckCircle2,
    GraduationCap,
    Clock,
    UserPlus,
    ChevronRight
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

const AdministrationDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('fees');
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);

    // Sync tab with URL
    useEffect(() => {
        const path = location.pathname;
        if (path === '/administration/staff') setActiveTab('teachers');
        else if (path === '/administration/finance') setActiveTab('fees');
        else if (path === '/administration/admission') setActiveTab('students');
        else if (path === '/administration') setActiveTab('fees'); // Default
    }, [location]);

    const handleTabClick = (tabId) => {
        if (tabId === 'fees') navigate('/administration/finance');
        else if (tabId === 'teachers') navigate('/administration/staff');
        else if (tabId === 'students') navigate('/administration/admission');
    };

    // Modals state
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Form states
    const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', department: '' });
    const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', classId: '', totalFee: '' });
    const [taskForm, setTaskForm] = useState({ title: '', description: '', teacherId: '' });
    const [feeForm, setFeeForm] = useState({ amount: '', paymentMethod: 'Cash', note: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feeRes, teacherRes, studentRes, classRes] = await Promise.all([
                api.get('/administration/fee-reports'),
                api.get('/administration/teachers'),
                api.get('/administration/students'),
                api.get('/admin/classes')
            ]);
            setFees(feeRes.data.data);
            setTeachers(teacherRes.data.data);
            setStudents(studentRes.data.data);
            setClasses(classRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            await api.post('/administration/create-teacher', teacherForm);
            setIsTeacherModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create teacher');
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/administration/create-student', studentForm);
            setIsStudentModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create student');
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/administration/tasks', taskForm);
            setIsTaskModalOpen(false);
            alert('Task assigned successfully');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to assign task');
        }
    };

    const handleCollectFee = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/administration/fees/${selectedStudent}/pay`, feeForm);
            setIsFeeModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to record payment');
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
                    <h1 className="text-3xl font-bold text-slate-900">Administration Console 🏢</h1>
                    <p className="text-slate-500 font-medium">Manage students, teachers, tasks, and finances in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="btn-primary bg-slate-900 text-white hover:bg-slate-800"
                    >
                        <Briefcase size={18} />
                        Assign Task
                    </button>
                    <button
                        onClick={() => setIsStudentModalOpen(true)}
                        className="btn-primary"
                    >
                        <UserPlus size={18} />
                        New Student
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary-50 text-primary-600">
                            <Users size={24} />
                        </div>
                        <h3 className="text-slate-500 font-bold text-sm uppercase">Total Students</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{students.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                            <Briefcase size={24} />
                        </div>
                        <h3 className="text-slate-500 font-bold text-sm uppercase">Teachers</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{teachers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-slate-500 font-bold text-sm uppercase">Revenue MTD</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        ${fees.reduce((sum, f) => sum + f.paidAmount, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
                    {[
                        { id: 'fees', label: 'Finance', icon: CreditCard },
                        { id: 'teachers', label: 'Teachers', icon: Briefcase },
                        { id: 'students', label: 'Students', icon: GraduationCap },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <motion.div layout className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    {activeTab === 'fees' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Student</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Total</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Paid</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Status</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {fees.map((fee) => (
                                        <tr key={fee._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {fee.studentId?.name?.[0]}
                                                    </div>
                                                    <span className="font-semibold text-slate-900">{fee.studentId?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-slate-900">${fee.totalAmount}</td>
                                            <td className="px-8 py-5 text-sm font-bold text-emerald-600">${fee.paidAmount}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${fee.remainingAmount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                    {fee.remainingAmount === 0 ? 'Fully Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => { setSelectedStudent(fee.studentId?._id); setIsFeeModalOpen(true); }}
                                                    className="text-primary-600 font-bold text-sm hover:underline"
                                                >
                                                    Collect Fee
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Staff Members</h3>
                                <button onClick={() => setIsTeacherModalOpen(true)} className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                    <Plus size={18} /> Add Teacher
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teachers.map((t) => (
                                    <div key={t._id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-600 mb-4">
                                            <Briefcase size={24} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">{t.name}</h4>
                                        <p className="text-slate-500 text-sm">{t.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Student Directory</h3>
                                <button onClick={() => setIsStudentModalOpen(true)} className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                    <Plus size={18} /> New Student
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {students.map((s) => (
                                    <div key={s._id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                                            <GraduationCap size={24} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">{s.name}</h4>
                                        <p className="text-slate-500 text-sm">{s.email}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                                            <span>CLASS ID: {s.classId?._id?.substring(0, 8)}</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Modals */}
            <Modal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} title="Add New Teacher">
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                    <input className="input-field" placeholder="Full Name" required onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} />
                    <input className="input-field" type="email" placeholder="Email" required onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
                    <input className="input-field" type="password" placeholder="Temporary Password" required onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} />
                    <button type="submit" className="btn-primary w-full py-4 mt-4">Create Teacher Profile</button>
                </form>
            </Modal>

            <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title="Register Student">
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    <input className="input-field" placeholder="Full Name" required onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
                    <input className="input-field" type="email" placeholder="Email" required onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
                    <input className="input-field" type="password" placeholder="Password" required onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} />
                    <select className="input-field" required onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                    </select>
                    <input className="input-field" type="number" placeholder="Total Fee Amount" required onChange={(e) => setStudentForm({ ...studentForm, totalFee: e.target.value })} />
                    <button type="submit" className="btn-primary w-full py-4 mt-4">Enroll Student</button>
                </form>
            </Modal>

            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign Administrative Task">
                <form onSubmit={handleAssignTask} className="space-y-4">
                    <input className="input-field" placeholder="Task Title" required onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                    <textarea className="input-field min-h-[100px]" placeholder="Detailed Description" required onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                    <select className="input-field" required onChange={(e) => setTaskForm({ ...taskForm, teacherId: e.target.value })}>
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <button type="submit" className="btn-primary w-full py-4 mt-4 bg-slate-900 border-none">Assign Task</button>
                </form>
            </Modal>

            <Modal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} title="Collect Fee Payment">
                <form onSubmit={handleCollectFee} className="space-y-4">
                    <p className="text-slate-500 text-sm mb-4">Recording payment for the selected student.</p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                        <input className="input-field pl-8" type="number" placeholder="Amount" required onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} />
                    </div>
                    <select className="input-field" onChange={(e) => setFeeForm({ ...feeForm, paymentMethod: e.target.value })}>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Online">Online Plateform</option>
                    </select>
                    <input className="input-field" placeholder="Note (Optional)" onChange={(e) => setFeeForm({ ...feeForm, note: e.target.value })} />
                    <button type="submit" className="btn-primary w-full py-4 mt-4 bg-emerald-600 border-none shadow-emerald-100">Record Transaction</button>
                </form>
            </Modal>
        </div>
    );
};

export default AdministrationDashboard;
