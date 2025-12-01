import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, HistoryIcon, ListIcon, UsersIcon, StatsIcon, SparklesIcon } from './icons';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-primary' : 'text-subtle-text dark:text-dark-subtle-text hover:text-primary'
      }`
    }
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </NavLink>
);

const BottomNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg border-t border-border-color dark:border-dark-border-color z-40">
      <nav className="flex items-center justify-around h-full">
        <NavItem to="/" icon={<DashboardIcon className="h-6 w-6" />} label="Home" />
        <NavItem to="/history" icon={<HistoryIcon className="h-6 w-6" />} label="Sales" />
        <NavItem to="/ai-assistant" icon={<SparklesIcon className="h-6 w-6" />} label="AI" />
        <NavItem to="/statistics" icon={<StatsIcon className="h-6 w-6" />} label="Stats" />
        <NavItem to="/expenses" icon={<ListIcon className="h-6 w-6" />} label="Exp" />
      </nav>
    </div>
  );
};

export default BottomNav;