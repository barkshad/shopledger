import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardIcon, HistoryIcon, UsersIcon, ListIcon, ShoppingCartIcon, StatsIcon } from './icons';

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
    return (
        <header className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg sticky top-0 z-40 border-b border-border-color dark:border-dark-border-color">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                            <motion.div whileHover={{ rotate: 15 }}>
                                <ShoppingCartIcon className="h-7 w-7" />
                            </motion.div>
                            ShopLedger
                        </NavLink>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <NavItem to="/"><DashboardIcon className="h-5 w-5"/><span>Dashboard</span></NavItem>
                        <NavItem to="/history"><HistoryIcon className="h-5 w-5"/><span>Sales</span></NavItem>
                        <NavItem to="/expenses"><ListIcon className="h-5 w-5"/><span>Expenses</span></NavItem>
                        <NavItem to="/statistics"><StatsIcon className="h-5 w-5"/><span>Statistics</span></NavItem>
                        <NavItem to="/admin"><UsersIcon className="h-5 w-5"/><span>Admin</span></NavItem>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
