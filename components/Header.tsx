
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
    DashboardIcon, 
    HistoryIcon, 
    UsersIcon, 
    ListIcon, 
    ShoppingCartIcon, 
    StatsIcon, 
    SearchIcon, 
    CalendarIcon,
    CancelIcon,
    ChevronDownIcon
} from './icons';

const MotionDiv = motion.div as any;

// Fixed: Added optional modifier to children prop to resolve potential TypeScript errors in strict environments
const NavItem: React.FC<{ to: string; children?: React.ReactNode; }> = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-subtle-text dark:text-dark-subtle-text hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
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
            addToast('Signed out successfully.', 'info');
            navigate('/auth');
        } catch (e) {
            addToast('Error signing out.', 'error');
        }
    };

    return (
        <header className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg sticky top-0 z-40 border-b border-border-color dark:border-dark-border-color">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <MotionDiv whileHover={{ rotate: 15 }}>
                                <ShoppingCartIcon className="h-7 w-7" />
                            </MotionDiv>
                            <span className="hidden sm:inline">ShopLedger</span>
                        </NavLink>
                    </div>
                    
                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center px-2 lg:ml-6 lg:justify-start">
                        <div className="max-w-lg w-full lg:max-w-xs">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-subtle-text dark:text-dark-subtle-text" />
                                </div>
                                <input
                                    type="search"
                                    name="search"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-border-color dark:border-dark-border-color rounded-xl leading-5 bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface placeholder-subtle-text dark:placeholder-dark-subtle-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Search..."
                                />
                            </form>
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <NavItem to="/"><DashboardIcon className="h-5 w-5"/><span>Dashboard</span></NavItem>
                        <NavItem to="/history"><HistoryIcon className="h-5 w-5"/><span>Sales</span></NavItem>
                        <NavItem to="/weekly"><CalendarIcon className="h-5 w-5"/><span>Weekly</span></NavItem>
                        <NavItem to="/expenses"><ListIcon className="h-5 w-5"/><span>Expenses</span></NavItem>
                        <NavItem to="/statistics"><StatsIcon className="h-5 w-5"/><span>Statistics</span></NavItem>
                    </nav>

                    <div className="flex items-center gap-2">
                        {/* Mobile Search Icon */}
                        <div className="md:hidden">
                            <button
                                onClick={() => navigate('/search')}
                                className="p-2 rounded-full text-subtle-text dark:text-dark-subtle-text hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                                aria-label="Search"
                            >
                                <SearchIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* User Profile Dropdown */}
                        {user && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 pl-2 pr-2 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-border-color dark:border-dark-border-color hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                                        {user.email?.charAt(0)}
                                    </div>
                                    <ChevronDownIcon className={`h-4 w-4 text-subtle-text transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                            <MotionDiv
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 bg-surface dark:bg-dark-surface rounded-2xl shadow-xl border border-border-color dark:border-dark-border-color z-20 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-border-color dark:border-dark-border-color">
                                                    <p className="text-xs font-bold text-subtle-text uppercase tracking-wider">Signed in as</p>
                                                    <p className="text-sm font-semibold truncate text-on-surface dark:text-white">{user.email}</p>
                                                </div>
                                                <div className="p-2">
                                                    <button 
                                                        onClick={() => {navigate('/admin'); setIsProfileOpen(false);}}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-on-surface dark:text-white"
                                                    >
                                                        <UsersIcon className="h-5 w-5" /> Admin Panel
                                                    </button>
                                                    <button 
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <CancelIcon className="h-5 w-5" /> Sign Out
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
