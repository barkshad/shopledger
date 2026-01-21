
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
    DashboardIcon, 
    HistoryIcon, 
    ListIcon, 
    ShoppingCartIcon, 
    StatsIcon, 
    SearchIcon, 
    CalendarIcon,
    CancelIcon,
    ChevronDownIcon,
    UsersIcon
} from './icons';

const MotionDiv = motion.div as any;

const NavItem: React.FC<{ to: string; children?: React.ReactNode; }> = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-soft'
                    : 'text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
            }`
        }
    >
        {children}
    </NavLink>
);

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { addToast } = useToast();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            setSearchTerm('');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            addToast('Session terminated.', 'info');
            navigate('/auth');
        } catch (e) {
            addToast('Protocol error during sign-out.', 'error');
        }
    };

    return (
        <header className="bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-xl sticky top-0 z-40 border-b border-border-color dark:border-dark-border-color">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex items-center justify-between h-18 gap-8">
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="flex items-center gap-3">
                            <div className="bg-black dark:bg-white p-1.5 rounded-lg shadow-soft">
                                <ShoppingCartIcon className="h-5 w-5 text-white dark:text-black" strokeWidth={2.5} />
                            </div>
                            <span className="hidden sm:inline text-lg font-bold tracking-tight uppercase">ShopLedger</span>
                        </NavLink>
                    </div>
                    
                    {/* Desktop Command Bar */}
                    <div className="hidden md:flex flex-1 justify-center max-w-sm">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-4 w-4 text-zinc-400" />
                            </div>
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 border border-border-color dark:border-dark-border-color rounded-xl leading-5 bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm transition-all"
                                placeholder="Universal Search"
                            />
                        </form>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        <NavItem to="/"><DashboardIcon className="h-4 w-4"/><span>Index</span></NavItem>
                        <NavItem to="/history"><HistoryIcon className="h-4 w-4"/><span>Sales</span></NavItem>
                        <NavItem to="/weekly"><CalendarIcon className="h-4 w-4"/><span>Groups</span></NavItem>
                        <NavItem to="/expenses"><ListIcon className="h-4 w-4"/><span>Outflow</span></NavItem>
                        <NavItem to="/statistics"><StatsIcon className="h-4 w-4"/><span>Analysis</span></NavItem>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="md:hidden">
                            <button
                                onClick={() => navigate('/search')}
                                className="p-2 rounded-xl text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                            >
                                <SearchIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {user && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 pl-1 pr-2 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-border-color dark:border-dark-border-color hover:border-zinc-400 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-[10px] font-bold uppercase shadow-soft">
                                        {user.email?.charAt(0)}
                                    </div>
                                    <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                            <MotionDiv
                                                initial={{ opacity: 0, scale: 0.98, y: 4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-3 w-64 bg-surface dark:bg-dark-surface rounded-2xl shadow-premium border border-border-color dark:border-dark-border-color z-20 overflow-hidden"
                                            >
                                                <div className="px-5 py-4 border-b border-border-color dark:border-dark-border-color bg-zinc-50 dark:bg-zinc-900">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Identity</p>
                                                    <p className="text-sm font-bold truncate text-on-surface dark:text-white mt-1">{user.email}</p>
                                                </div>
                                                <div className="p-2">
                                                    <button 
                                                        onClick={() => {navigate('/admin'); setIsProfileOpen(false);}}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                                    >
                                                        <UsersIcon className="h-4 w-4" /> System Control
                                                    </button>
                                                    <button 
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                    >
                                                        <CancelIcon className="h-4 w-4" /> Terminate Session
                                                    </button>
                                                </div>
                                            </MotionDiv>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
