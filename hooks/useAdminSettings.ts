
import { useState, useEffect, useCallback } from 'react';
import { AdminSettings } from '../types';
import * as db from '../services/db';

const defaultSettings: AdminSettings = {
  theme: 'light',
  currency: 'KSh',
  isPhotoSavingEnabled: true,
};

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const remoteSettings = await db.getSettings();
        if (remoteSettings) {
          setSettings(remoteSettings);
        } else {
          // Initialize remote settings if none exist
          await db.updateSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Failed to load settings from Firestore', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Sync theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback(async (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      db.updateSettings(updated).catch(e => console.error("Firestore settings update failed", e));
      return updated;
    });
  }, []);

  return { settings, updateSettings, loading };
};
