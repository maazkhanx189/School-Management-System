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

const STANDARD_CLASSES = [
    'Play Group', 'Nursery', 'K-G', 'Ist', 'Second', 'Third',
    'Fourth', 'Fifth', 'Sixth', 'Sventh', 'Eight', 'Ninth', 'Ten'
];

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
    const [staff, setStaff] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attendance, setAttendance] = useState({ records: [], stats: { students: {}, teachers: {} } });

    // Sync tab with URL
    useEffect(() => {
        const path = location.pathname;
        if (path === '/administration/staff') setActiveTab('staff');
        else if (path === '/administration/finance') setActiveTab('fees');
        else if (path === '/administration/admission') setActiveTab('students');
        else if (path === '/administration/classes') setActiveTab('classes');
        else if (path === '/administration/attendance') setActiveTab('attendance');
        else setActiveTab('fees');
    }, [location]);

    const handleTabClick = (tabId) => {
        if (tabId === 'fees') navigate('/administration/finance');
        else if (tabId === 'staff') navigate('/administration/staff');
        else if (tabId === 'students') navigate('/administration/admission');
        else if (tabId === 'classes') navigate('/administration/classes');
        else if (tabId === 'attendance') navigate('/administration/attendance');
    };

    // Modals state
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedClassForTask, setSelectedClassForTask] = useState('');
    const [viewingClassStudents, setViewingClassStudents] = useState(null);

    const [editingUser, setEditingUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form states
    const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', role: 'teacher' });
    const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', classId: '', totalFee: '' });
    const [taskForm, setTaskForm] = useState({ title: '', description: '', teacherId: '' });
    const [feeForm, setFeeForm] = useState({ amount: '', paymentMethod: 'Cash', note: '' });
    const [classForm, setClassForm] = useState({ name: '', section: '', teacherId: '' });

    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feeRes, teacherRes, staffRes, studentRes, classRes, attendanceRes] = await Promise.all([
                api.get('/administration/fee-reports'),
                api.get('/administration/teachers'),
                api.get('/administration/staff'),
                api.get('/administration/students'),
                api.get('/admin/classes'),
                api.get('/administration/attendance-report')
            ]);
            setFees(feeRes.data.data);
            setTeachers(teacherRes.data.data);
            setStaff(staffRes.data.data);
            setStudents(studentRes.data.data);
            setClasses(classRes.data.data);
            setAttendance(attendanceRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/administration/users/${editingUser._id}`, teacherForm);
            } else {
                await api.post('/administration/create-teacher', teacherForm);
            }
            setIsTeacherModalOpen(false);
            setIsEditMode(false);
            setEditingUser(null);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to save staff information');
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/administration/users/${editingUser._id}`, studentForm);
            } else {
                await api.post('/administration/create-student', studentForm);
            }
            setIsStudentModalOpen(false);
            setIsEditMode(false);
            setEditingUser(null);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to save student information');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/administration/users/${userId}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    const openEditStaffModal = (user) => {
        setEditingUser(user);
        setIsEditMode(true);
        setTeacherForm({ name: user.name, email: user.email, role: user.role });
        setIsTeacherModalOpen(true);
    };

    const openEditStudentModal = (user) => {
        setEditingUser(user);
        setIsEditMode(true);
        const fee = fees.find(f => (f.studentId?._id || f.studentId) === user._id);
        setStudentForm({
            name: user.name,
            email: user.email,
            classId: user.classId?._id || user.classId || '',
            totalFee: fee?.totalAmount || ''
        });
        setIsStudentModalOpen(true);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/classes', classForm);
            setIsClassModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create class');
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

    const filteredTeachersForTask = () => {
        if (!selectedClassForTask) return teachers;

        const selectedClass = classes.find(c => c._id === selectedClassForTask);
        if (selectedClass && selectedClass.teacherId) {
            return teachers.filter(t => t._id === (selectedClass.teacherId._id || selectedClass.teacherId));
        }
        return teachers;
    };

    const getWeeklyAdmissions = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return students.filter(s => new Date(s.createdAt) >= oneWeekAgo);
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
                        <h3 className="text-slate-500 font-bold text-sm uppercase">Staff Count</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{staff.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-slate-500 font-bold text-sm uppercase">Revenue MTD</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        ${fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100 p-2 rounded-3xl w-full">
                    <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm">
                        {[
                            { id: 'fees', label: 'Finance', icon: CreditCard },
                            { id: 'staff', label: 'Staff Management', icon: Briefcase },
                            { id: 'students', label: 'Admissions', icon: GraduationCap },
                            { id: 'classes', label: 'Classes', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'fees' && (
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search student name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                        </div>
                    )}
                </div>

                <motion.div layout className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    {activeTab === 'fees' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Student</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Class</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Month</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Total</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Paid</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">Status</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.map((student) => {
                                        const fee = fees.find(f => (f.studentId?._id || f.studentId) === student._id);
                                        return (
                                            <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            {student.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-slate-900 block">{student.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-medium">{student.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                                    {student.classId?.name || 'Unassigned'}
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                                    {fee?.month || 'N/A'}
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-900">${fee?.totalAmount || 0}</td>
                                                <td className="px-8 py-5 text-sm font-bold text-emerald-600">${fee?.paidAmount || 0}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${fee?.remainingAmount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {fee ? (fee.remainingAmount === 0 ? 'Fully Paid' : 'Pending') : 'No Record'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => { setSelectedStudent(student._id); setIsFeeModalOpen(true); }}
                                                        className="text-primary-600 font-bold text-sm hover:underline"
                                                    >
                                                        Collect Fee
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">All School Staff</h3>
                                <button onClick={() => setIsTeacherModalOpen(true)} className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                    <Plus size={18} /> Add Staff Member
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {staff.map((s) => (
                                    <div key={s._id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 group relative">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-600 mb-4">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${s.role === 'teacher' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {s.role}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditStaffModal(s)} className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                                                        <Search size={14} title="Edit" />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(s._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                                                        <X size={14} title="Delete" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">{s.name}</h4>
                                        <p className="text-slate-500 text-sm">{s.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="p-8">
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">Weekly New Admissions 📅</h3>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                                            LAST 7 DAYS
                                        </span>
                                    </div>
                                    {getWeeklyAdmissions().length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {getWeeklyAdmissions().map((s) => (
                                                <div key={s._id} className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20">
                                                    <h4 className="font-bold text-slate-900">{s.name}</h4>
                                                    <p className="text-xs text-slate-500">{s.email}</p>
                                                    <p className="text-[10px] mt-2 font-bold text-emerald-600 uppercase">Enrolled: {new Date(s.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">No new admissions this week.</p>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">Full Student Directory</h3>
                                        <button onClick={() => setIsStudentModalOpen(true)} className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                            <Plus size={18} /> New Student
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {students.map((s) => {
                                            const studentFee = fees.find(f => (f.studentId?._id || f.studentId) === s._id);
                                            return (
                                                <div key={s._id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 group relative">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                                                            <GraduationCap size={24} />
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openEditStudentModal(s)} className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                                                                <Search size={14} title="Edit" />
                                                            </button>
                                                            <button onClick={() => handleDeleteUser(s._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                                                                <X size={14} title="Delete" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900">{s.name}</h4>
                                                    <p className="text-slate-500 text-sm">{s.email}</p>
                                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                                        <div className="flex items-center justify-between text-xs font-bold">
                                                            <span className="text-slate-400 uppercase">Class</span>
                                                            <span className="text-slate-900">{s.classId?.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs font-bold">
                                                            <span className="text-slate-400 uppercase">Fee Status</span>
                                                            <span className={studentFee?.remainingAmount === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                                {studentFee ? (studentFee.remainingAmount === 0 ? 'Paid' : `$${studentFee.remainingAmount} Pending`) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div className="p-8">
                            {viewingClassStudents ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setViewingClassStudents(null)}
                                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                                            >
                                                <ChevronRight size={20} className="rotate-180" />
                                            </button>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{viewingClassStudents.name} - Students</h3>
                                                <p className="text-sm text-slate-500">Section {viewingClassStudents.section}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {students.filter(s => (s.classId?._id || s.classId) === viewingClassStudents._id).length > 0 ? (
                                            students.filter(s => (s.classId?._id || s.classId) === viewingClassStudents._id).map(s => {
                                                const studentFee = fees.find(f => (f.studentId?._id || f.studentId) === s._id);
                                                return (
                                                    <div key={s._id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 group relative">
                                                        <div className="flex items-start justify-between">
                                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                                                                <GraduationCap size={24} />
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => openEditStudentModal(s)} className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                                                                    <Search size={14} title="Edit" />
                                                                </button>
                                                                <button onClick={() => handleDeleteUser(s._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                                                                    <X size={14} title="Delete" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-slate-900">{s.name}</h4>
                                                        <p className="text-slate-500 text-sm">{s.email}</p>
                                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                                            <div className="flex items-center justify-between text-xs font-bold">
                                                                <span className="text-slate-400 uppercase">Fee Status</span>
                                                                <span className={studentFee?.remainingAmount === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                                    {studentFee ? (studentFee.remainingAmount === 0 ? 'Paid' : `$${studentFee.remainingAmount} Pending`) : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full py-12 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                                <p className="text-slate-400 font-medium">No students enrolled in this class yet.</p>
                                                <button
                                                    onClick={() => {
                                                        setStudentForm({ ...studentForm, classId: viewingClassStudents._id });
                                                        setIsStudentModalOpen(true);
                                                    }}
                                                    className="mt-4 text-primary-600 font-bold hover:underline inline-flex items-center gap-2"
                                                >
                                                    <Plus size={18} /> Register First Student
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">Class Management</h3>
                                        <button onClick={() => setIsClassModalOpen(true)} className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                            <Plus size={18} /> Create New Class
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {classes.map((c) => (
                                            <div
                                                key={c._id}
                                                onClick={() => setViewingClassStudents(c)}
                                                className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary-100/20 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="w-12 h-12 bg-white group-hover:bg-primary-50 rounded-2xl shadow-sm flex items-center justify-center text-primary-600 mb-4 transition-colors">
                                                        <Users size={24} />
                                                    </div>
                                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-400 transition-all group-hover:translate-x-1" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-900">{c.name}</h4>
                                                <p className="text-slate-500 text-sm">Section: {c.section}</p>
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                                                    <span>TEACHER: {c.teacherId?.name || 'Not Assigned'}</span>
                                                    <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">Show Students</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-slate-900">Attendance Overview</h3>
                                <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
                                    Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100">
                                    <h4 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} /> Student Attendance
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-indigo-600">{attendance?.stats?.students?.present || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Present</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-rose-500">{attendance?.stats?.students?.absent || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Absent</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-amber-500">{attendance?.stats?.students?.late || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Late</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100">
                                    <h4 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                                        <Briefcase size={20} /> Teacher Attendance
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-emerald-600">{attendance?.stats?.teachers?.present || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Present</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-rose-500">{attendance?.stats?.teachers?.absent || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Absent</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-amber-500">{attendance?.stats?.teachers?.late || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Late</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Records Table */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <h4 className="font-bold text-slate-900">Attendance Logs</h4>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Recent First</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Info</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {attendance?.records?.length > 0 ? (
                                                attendance.records.map((record) => (
                                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{record.userId?.name}</div>
                                                            <div className="text-xs text-slate-400">{record.userId?.email || 'No email'}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${record.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                {record.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                                            {new Date(record.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${record.status === 'present' ? 'text-emerald-600' :
                                                                    record.status === 'absent' ? 'text-rose-600' : 'text-amber-600'
                                                                }`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'present' ? 'bg-emerald-600' :
                                                                        record.status === 'absent' ? 'bg-rose-600' : 'bg-amber-600'
                                                                    }`} />
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-400 text-xs italic">
                                                            {record.classId ? `${record.classId.name}-${record.classId.section}` : record.note || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                        No attendance records found for this school.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Modals */}
            <Modal isOpen={isTeacherModalOpen} onClose={() => { setIsTeacherModalOpen(false); setIsEditMode(false); setEditingUser(null); }} title={isEditMode ? "Edit Staff Member" : "Add Staff Member"}>
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                    <input className="input-field" placeholder="Full Name" required value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} />
                    <input className="input-field" type="email" placeholder="Email" required value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
                    {!isEditMode && <input className="input-field" type="password" placeholder="Temporary Password" required onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} />}
                    <select className="input-field" value={teacherForm.role} onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}>
                        <option value="teacher">Teacher</option>
                        <option value="administration">Administration</option>
                    </select>
                    <button type="submit" className="btn-primary w-full py-4 mt-4">{isEditMode ? "Save Changes" : "Create Staff Profile"}</button>
                </form>
            </Modal>

            <Modal isOpen={isStudentModalOpen} onClose={() => { setIsStudentModalOpen(false); setIsEditMode(false); setEditingUser(null); }} title={isEditMode ? "Edit Student" : "Register Student"}>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    <input className="input-field" placeholder="Full Name" required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
                    <input className="input-field" type="email" placeholder="Email" required value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
                    {!isEditMode && <input className="input-field" type="password" placeholder="Password" required onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} />}
                    <select
                        className="input-field"
                        required
                        value={studentForm.classId}
                        onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    >
                        <option value="">Select Class</option>
                        {STANDARD_CLASSES.map(clsName => {
                            const availableSections = classes.filter(c => c.name === clsName);

                            return (
                                <optgroup key={clsName} label={clsName}>
                                    {availableSections.length > 0 ? (
                                        availableSections.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.name} - Section {c.section}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>{clsName} (No Sections Created)</option>
                                    )}
                                </optgroup>
                            );
                        })}
                    </select>
                    {!isEditMode && <input className="input-field" type="number" placeholder="Total Fee Amount" required value={studentForm.totalFee} onChange={(e) => setStudentForm({ ...studentForm, totalFee: e.target.value })} />}
                    <button type="submit" className="btn-primary w-full py-4 mt-4">{isEditMode ? "Update Student Profile" : "Enroll Student"}</button>
                </form>
            </Modal>

            <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Create New Class">
                <form onSubmit={handleCreateClass} className="space-y-4">
                    <select
                        className="input-field"
                        required
                        onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    >
                        <option value="">Select Class Name</option>
                        {STANDARD_CLASSES.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <input className="input-field" placeholder="Section (e.g., A, B)" required onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} />
                    <select className="input-field" onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}>
                        <option value="">Assign Teacher (Optional)</option>
                        {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <button type="submit" className="btn-primary w-full py-4 mt-4">Create Class</button>
                </form>
            </Modal>

            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign Administrative Task">
                <form onSubmit={handleAssignTask} className="space-y-4">
                    <select
                        className="input-field"
                        onChange={(e) => setSelectedClassForTask(e.target.value)}
                        value={selectedClassForTask}
                    >
                        <option value="">Select Class (Filter Teachers)</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                    </select>

                    <input className="input-field" placeholder="Task Title" required onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                    <textarea className="input-field min-h-[100px]" placeholder="Detailed Description" required onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />

                    <select className="input-field" required onChange={(e) => setTaskForm({ ...taskForm, teacherId: e.target.value })}>
                        <option value="">Select Teacher</option>
                        {filteredTeachersForTask().map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
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
                        <option value="Online">Online Platform</option>
                    </select>
                    <input className="input-field" placeholder="Note (Optional)" onChange={(e) => setFeeForm({ ...feeForm, note: e.target.value })} />
                    <button type="submit" className="btn-primary w-full py-4 mt-4 bg-emerald-600 border-none shadow-emerald-100">Record Transaction</button>
                </form>
            </Modal>
        </div>
    );
};

export default AdministrationDashboard;
