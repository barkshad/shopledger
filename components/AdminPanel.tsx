
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { useAuth } from '../hooks/useAuth';
import SalesManagementTab from './admin/SalesManagementTab';
import ReportsTab from './admin/ReportsTab';
import DataControlTab from './admin/DataControlTab';
import SettingsTab from './admin/SettingsTab';
import ActivityLog from './admin/ActivityLog';
import Spinner from './Spinner';
import {
  ShoppingCartIcon,
  BarChartIcon,
  DatabaseZapIcon,
  SettingsIcon,
  UsersIcon,
  CreditCardIcon,
  CancelIcon,
} from './icons';
import ExpensesManagementTab from './admin/ExpensesManagementTab';

type AdminTab = 'sales' | 'expenses' | 'reports' | 'data' | 'settings';

const MotionDiv = motion.div as any;

const AdminPanel = () => {
  const { settings, loading: settingsLoading } = useAdminSettings();
  const { user, loading: authLoading, login, register, logout } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');
  const [isBusy, setIsBusy] = useState(false);

  const [activityLog, setActivityLog] = useState<{ message: string; timestamp: Date }[]>([]);

  const logAction = useCallback((message: string) => {
    setActivityLog(prev =>
      [{ message, timestamp: new Date() }, ...prev].slice(0, 10)
    );
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    try {
      if (isRegistering) {
        await register(email, password);
        addToast('Admin account created successfully!', 'success');
      } else {
        await login(email, password);
        addToast('Welcome back, Admin!', 'success');
      }
      logAction(isRegistering ? 'Registered new admin account.' : 'Logged in.');
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Authentication failed.', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
      try {
          await logout();
          addToast('Signed out successfully.', 'info');
      } catch (e) {
          addToast('Error signing out.', 'error');
      }
  };

  if (settingsLoading || authLoading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color text-center"
        >
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-primary text-white mb-6 transform -rotate-3">
              <UsersIcon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{isRegistering ? 'Setup Admin Account' : 'Admin Panel Login'}</h1>
          <p className="text-subtle-text dark:text-dark-subtle-text mb-8">Access secure shop management tools.</p>
          
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold uppercase text-subtle-text mb-1">Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="admin@shopledger.com"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-subtle-text mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                />
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isBusy ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"/> : (isRegistering ? 'Register Admin' : 'Login to Dashboard')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border-color dark:border-dark-border-color">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm font-semibold text-primary dark:text-white hover:underline"
              >
                  {isRegistering ? 'Already have an account? Login' : 'Need an admin account? Register'}
              </button>
          </div>
        </MotionDiv>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'sales', label: 'Sales', icon: <ShoppingCartIcon className="h-5 w-5" /> },
    { id: 'expenses', label: 'Expenses', icon: <CreditCardIcon className="h-5 w-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChartIcon className="h-5 w-5" /> },
    { id: 'data', label: 'Data', icon: <DatabaseZapIcon className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesManagementTab logAction={logAction} />;
      case 'expenses':
        return <ExpensesManagementTab logAction={logAction} />;
      case 'reports':
        return <ReportsTab logAction={logAction} />;
      case 'data':
        return <DataControlTab logAction={logAction} />;
      case 'settings':
        return <SettingsTab logAction={logAction} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-medium text-subtle-text">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                  <CancelIcon className="h-4 w-4" /> Sign Out
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-surface dark:bg-dark-surface p-4 rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color">
            <nav className="flex lg:flex-col gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'text-subtle-text hover:bg-primary/5 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <ActivityLog logs={activityLog} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color min-h-[60vh]"
            >
              {renderTabContent()}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
