import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Building2,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label, collapsed }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to}>
            <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary-600'}
      `}>
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary-600'} />
                {!collapsed && <span className="font-medium">{label}</span>}
            </div>
        </Link>
    );
};

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const getMenuItems = () => {
        switch (user?.role) {
            case 'student':
                return [
                    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/homework', icon: BookOpen, label: 'Homework' },
                    { to: '/fees', icon: CreditCard, label: 'Fees' },
                    { to: '/profile', icon: GraduationCap, label: 'Profile' },
                ];
            case 'teacher':
                return [
                    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/classes', icon: Users, label: 'Classes' },
                    { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
                    { to: '/attendance', icon: ClipboardList, label: 'Attendance' },
                ];
            case 'administration':
                return [
                    { to: '/administration', icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/administration/staff', icon: Briefcase, label: 'Staff Management' },
                    { to: '/administration/finance', icon: CreditCard, label: 'Finance' },
                    { to: '/administration/admission', icon: GraduationCap, label: 'Admissions' },
                ];
            case 'admin':
                return [
                    { to: '/admin', icon: LayoutDashboard, label: 'Insights' },
                    { to: '/admin/schools', icon: Building2, label: 'Schools' },
                    { to: '/admin/users', icon: Users, label: 'Users' },
                    { to: '/admin/settings', icon: Settings, label: 'System Settings' },
                ];
            case 'superadmin':
                return [
                    { to: '/superadmin', icon: LayoutDashboard, label: 'Overview' },
                    { to: '/superadmin/schools', icon: Building2, label: 'Manage Schools' },
                    { to: '/superadmin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
                    { to: '/superadmin/logs', icon: ClipboardList, label: 'Audit Logs' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Desktop */}
            <motion.aside
                animate={{ width: collapsed ? 80 : 260 }}
                className="hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-20 transition-all duration-300"
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-100">
                        <Building2 size={24} />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-xl tracking-tight text-slate-900">EduSaaS</span>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-4">
                    {menuItems.map((item) => (
                        <SidebarLink key={item.to} {...item} collapsed={collapsed} />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all group"
                    >
                        <LogOut size={20} className="group-hover:text-rose-600" />
                        {!collapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-40 lg:hidden shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                        <Building2 size={24} />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-slate-900">EduSaaS</span>
                                </div>
                                <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="px-4 space-y-1.5 mt-4">
                                {menuItems.map((item) => (
                                    <SidebarLink key={item.to} {...item} collapsed={false} />
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-primary-100 rounded-xl text-sm w-64 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200"></div>

                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{user?.name}</span>
                                <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                                {user?.name?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
