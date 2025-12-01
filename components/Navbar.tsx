import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardIcon, PlusCircleIcon, HistoryIcon, UsersIcon, CreditCardIcon, ListIcon, PackageIcon, ShoppingCartIcon, SparklesIcon } from './icons';

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-subtle-text hover:bg-primary/10 hover:text-primary'
            }`
        }
    >
        {children}
    </NavLink>
);

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const closeMenu = () => setIsOpen(false);

    return (
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border-color">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                            <ShoppingCartIcon className="h-6 w-6"/> ShopLedger
                        </NavLink>
                    </div>
                    <nav className="hidden md:flex items-center space-x-2">
                        <NavItem to="/"><DashboardIcon className="h-5 w-5"/><span>Dashboard</span></NavItem>
                        <NavItem to="/add-sale"><PlusCircleIcon className="h-5 w-5"/><span>POS</span></NavItem>
                        <NavItem to="/products"><PackageIcon className="h-5 w-5"/><span>Products</span></NavItem>
                        <NavItem to="/customers"><UsersIcon className="h-5 w-5"/><span>Customers</span></NavItem>
                        <NavItem to="/history"><HistoryIcon className="h-5 w-5"/><span>History</span></NavItem>
                        <NavItem to="/expenses"><ListIcon className="h-5 w-5"/><span>Expenses</span></NavItem>
                    </nav>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-subtle-text hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden"
                    >
                        <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavItem to="/" onClick={closeMenu}><DashboardIcon className="h-5 w-5"/><span>Dashboard</span></NavItem>
                            <NavItem to="/add-sale" onClick={closeMenu}><PlusCircleIcon className="h-5 w-5"/><span>POS</span></NavItem>
                            <NavItem to="/products" onClick={closeMenu}><PackageIcon className="h-5 w-5"/><span>Products</span></NavItem>
                             <NavItem to="/customers" onClick={closeMenu}><UsersIcon className="h-5 w-5"/><span>Customers</span></NavItem>
                            <NavItem to="/history" onClick={closeMenu}><HistoryIcon className="h-5 w-5"/><span>Sales History</span></NavItem>
                            <NavItem to="/expenses" onClick={closeMenu}><ListIcon className="h-5 w-5"/><span>Expenses</span></NavItem>
                            <NavItem to="/ai-assistant" onClick={closeMenu}><SparklesIcon className="h-5 w-5"/><span>Smart Assistant</span></NavItem>
                            <NavItem to="/admin" onClick={closeMenu}><UsersIcon className="h-5 w-5"/><span>Admin</span></NavItem>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;