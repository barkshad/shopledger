
import { useState, useEffect, useCallback } from 'react';
import { AdminSettings } from '../types';
import * as db from '../services/db';
import { useAuth } from './useAuth';

const defaultSettings: AdminSettings = {
  theme: 'light',
  currency: 'KSh',
  isPhotoSavingEnabled: true,
};

export const useAdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const remoteSettings = await db.getSettings(user.uid);
        if (remoteSettings) {
          setSettings(remoteSettings);
        } else {
          // Initialize remote settings if none exist
          await db.updateSettings(user.uid, defaultSettings);
        }
      } catch (error) {
        console.error('Failed to load settings from Firestore', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  // Sync theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback(async (newSettings: Partial<AdminSettings>) => {
    if (!user) return;
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      db.updateSettings(user.uid, updated).catch(e => console.error("Firestore settings update failed", e));
      return updated;
    });
  }, [user]);

  return { settings, updateSettings, loading };
};
