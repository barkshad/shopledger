
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSales } from '../hooks/useSales';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import SalesManagementTab from './admin/SalesManagementTab';
import ReportsTab from './admin/ReportsTab';
import DataControlTab from './admin/DataControlTab';
import SettingsTab from './admin/SettingsTab';
import ActivityLog from './admin/ActivityLog';
import {
  ShoppingCartIcon,
  BarChartIcon,
  DatabaseZapIcon,
  SettingsIcon,
  UsersIcon,
  CreditCardIcon,
} from './icons';
import ExpensesManagementTab from './admin/ExpensesManagementTab';

type AdminTab = 'sales' | 'expenses' | 'reports' | 'data' | 'settings';

const MotionDiv = motion.div as any;

const AdminPanel = () => {
  const { settings } = useAdminSettings();
  const { addToast } = useToast();
  const [secretKey, setSecretKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');

  const [activityLog, setActivityLog] = useState<{ message: string; timestamp: Date }[]>([]);

  const logAction = useCallback((message: string) => {
    setActivityLog(prev =>
      [{ message, timestamp: new Date() }, ...prev].slice(0, 10)
    );
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretKey === settings.secretKey) {
      setIsAuthenticated(true);
      setError('');
      addToast('Admin access granted.', 'success');
      logAction('Logged into Admin Panel.');
    } else {
      setError('Incorrect secret key.');
      addToast('Authentication failed.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-8 rounded-xl shadow-subtle border border-border-color text-center"
        >
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <UsersIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Panel Access</h1>
          <p className="text-subtle-text mb-6">Please enter the secret key to access admin features.</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
              placeholder="•••••"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              Unlock
            </button>
          </form>
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
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-surface p-4 rounded-xl shadow-subtle border border-border-color">
            <nav className="flex lg:flex-col gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-on-primary'
                      : 'text-subtle-text hover:bg-primary/10 hover:text-primary'
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
              className="bg-surface p-6 rounded-xl shadow-subtle border border-border-color min-h-[60vh]"
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
