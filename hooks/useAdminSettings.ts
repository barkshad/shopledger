import { useState, useEffect, useCallback } from 'react';

const ADMIN_SETTINGS_KEY = 'shopLedgerAdminSettings';
const ADMIN_SECRET_KEY_DEFAULT = '12345';

export interface AdminSettings {
  secretKey: string;
  theme: 'light' | 'dark';
  currency: 'KSh' | 'USD' | 'EUR' | 'GBP';
  isPhotoSavingEnabled: boolean;
}

const defaultSettings: AdminSettings = {
  secretKey: ADMIN_SECRET_KEY_DEFAULT,
  theme: 'light',
  currency: 'KSh',
  isPhotoSavingEnabled: true,
};

const getStoredSettings = (): AdminSettings => {
  try {
    const stored = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to parse admin settings from localStorage', error);
  }
  return defaultSettings;
};

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>(getStoredSettings);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save admin settings to localStorage', error);
    }

    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return { settings, updateSettings };
};