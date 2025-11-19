import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardIcon, HistoryIcon, UsersIcon, ListIcon, ShoppingCartIcon, StatsIcon, SearchIcon } from './icons';

const NavItem: React.FC<{ to: string; children: React.ReactNode; }> = ({ to, children }) => (
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
    const navigate = useNavigate();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            setSearchTerm('');
        }
    };

    return (
        <header className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg sticky top-0 z-40 border-b border-border-color dark:border-dark-border-color">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <motion.div whileHover={{ rotate: 15 }}>
                                <ShoppingCartIcon className="h-7 w-7" />
                            </motion.div>
                            ShopLedger
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
                                    className="block w-full pl-10 pr-3 py-2 border border-border-color dark:border-dark-border-color rounded-lg leading-5 bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface placeholder-subtle-text dark:placeholder-dark-subtle-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Search..."
                                />
                            </form>
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <NavItem to="/"><DashboardIcon className="h-5 w-5"/><span>Dashboard</span></NavItem>
                        <NavItem to="/history"><HistoryIcon className="h-5 w-5"/><span>Sales</span></NavItem>
                        <NavItem to="/expenses"><ListIcon className="h-5 w-5"/><span>Expenses</span></NavItem>
                        <NavItem to="/statistics"><StatsIcon className="h-5 w-5"/><span>Statistics</span></NavItem>
                        <NavItem to="/admin"><UsersIcon className="h-5 w-5"/><span>Admin</span></NavItem>
                    </nav>

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
                </div>
            </div>
        </header>
    );
};

export default Header;
