
import React, { useState } from 'react';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import { useToast } from '../../hooks/useToast';
import { usePWA } from '../../hooks/usePWA';
import { useAuth } from '../../hooks/useAuth';
import { DownloadIcon } from '../icons';

const SettingsTab: React.FC<{ logAction: (message: string) => void }> = ({ logAction }) => {
    const { settings, updateSettings } = useAdminSettings();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { isInstallable, installApp } = usePWA();

    const inputStyles = "mt-1 block w-full px-3 py-2 bg-background border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm";

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Admin Settings</h2>

            {/* Account Info */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold mb-1">Authenticated Account</h3>
                <p className="text-sm text-subtle-text">Logged in as: <span className="text-primary dark:text-white font-mono">{user?.email}</span></p>
                <p className="text-[10px] mt-2 text-subtle-text/60">Note: Authentication is handled securely via Firebase.</p>
            </div>

            {/* PWA Installation */}
            {isInstallable && (
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold">Install ShopLedger</h3>
                        <p className="text-sm text-subtle-text">Download this app for offline use and faster access.</p>
                    </div>
                    <button 
                        onClick={installApp}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-lg hover:bg-zinc-800 transition-all"
                    >
                        <DownloadIcon className="h-5 w-5" /> Install App
                    </button>
                </div>
            )}

            {/* General Settings */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferences</h3>
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                    <label htmlFor="theme" className="text-on-surface">Theme</label>
                    <select id="theme" value={settings.theme} onChange={e => {updateSettings({ theme: e.target.value as 'light' | 'dark' }); logAction(`Set theme to ${e.target.value}.`);}} className={inputStyles + " w-40"}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                {/* Currency Selector */}
                <div className="flex items-center justify-between">
                    <label htmlFor="currency" className="text-on-surface">Currency</label>
                    <select id="currency" value={settings.currency} onChange={e => {updateSettings({ currency: e.target.value as any }); logAction(`Set currency to ${e.target.value}.`);}} className={inputStyles + " w-40"}>
                        <option value="KSh">KSh</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
                {/* Photo Saving Toggle */}
                <div className="flex items-center justify-between">
                    <label htmlFor="photoSaving" className="text-on-surface">Enable Photo Saving</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="photoSaving" className="sr-only peer" checked={settings.isPhotoSavingEnabled} onChange={e => {updateSettings({ isPhotoSavingEnabled: e.target.checked }); logAction(`Photo saving ${e.target.checked ? 'enabled' : 'disabled'}.`);}}/>
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
