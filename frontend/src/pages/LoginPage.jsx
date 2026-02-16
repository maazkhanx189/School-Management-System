import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, GraduationCap, Briefcase, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('student@school.com');
    const [password, setPassword] = useState('password123');
    const [role, setRole] = useState('student');
    const { login, loading } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login({ email, password, role });
        if (!result.success) {
            setError(result.error || 'Invalid credentials. Please try again.');
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap },
        { id: 'teacher', label: 'Teacher', icon: Briefcase },
        { id: 'administration', label: 'Staff', icon: UserCircle },
        { id: 'admin', label: 'Admin', icon: Building2 },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100 via-white to-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-200/20 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl p-8 lg:p-12 relative z-10"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary-200 mb-6 rotate-3">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-slate-500 font-medium">Log in to your EduSaaS account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${role === r.id
                                    ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                                    : 'border-slate-100 bg-white/50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <r.icon size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                        </label>
                        <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4">Forgot Password?</a>
                    </div>

                    {error && <p className="text-rose-500 text-sm font-medium px-1 animate-shake">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-xl shadow-slate-200"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 font-medium">
                    New here? <Link to="/register" className="text-slate-900 font-bold hover:underline underline-offset-4 ml-1">Register School</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
