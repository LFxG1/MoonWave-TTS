import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

const STORAGE_KEY = 'moonwave.settings.v1';

export const DEFAULT_SETTINGS = {
  azureKey: '',
  azureRegion: '',
  defaultVoice: 'en-US-AriaNeural',
  defaultLocale: 'en-US',
  outputFormat: 'mp3', // 'mp3' | 'wav'
};

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('MoonWave: could not read settings from localStorage.', error);
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readStoredSettings);

  // Persist any change back to localStorage so keys stay on this machine only.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('MoonWave: could not persist settings to localStorage.', error);
    }
  }, [settings]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      isConfigured: Boolean(settings.azureKey.trim() && settings.azureRegion.trim()),
    }),
    [settings, updateSettings, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside a <SettingsProvider>.');
  }
  return context;
}
