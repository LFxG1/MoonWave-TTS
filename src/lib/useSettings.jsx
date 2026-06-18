import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  clearStoredSettings,
  DEFAULT_SETTINGS,
  persistStoredSettings,
  readStoredSettings,
} from './settingsStorage.js';
import { fetchBackendHealth } from './azureTts.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readStoredSettings);
  const mountedRef = useRef(true);
  const [backendStatus, setBackendStatus] = useState({
    state: 'checking',
    voices: 0,
    message: 'Checking backend connection.',
  });

  // Only non-secret studio preferences are stored in the browser.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    persistStoredSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    clearStoredSettings();
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const checkBackend = useCallback(async () => {
    if (mountedRef.current) {
      setBackendStatus((previous) => ({
        ...previous,
        state: 'checking',
        message: 'Checking backend connection.',
      }));
    }

    try {
      const health = await fetchBackendHealth();
      const ready = Boolean(health?.ok && health?.configured);
      const nextStatus = {
        state: ready ? 'ready' : 'offline',
        voices: 0,
        message: ready
          ? 'Function backend connected.'
          : 'Function connected, but Azure Speech app settings are missing.',
      };
      if (mountedRef.current) {
        setBackendStatus(nextStatus);
      }
      return nextStatus;
    } catch (error) {
      const nextStatus = {
        state: 'offline',
        voices: 0,
        message: error.message || String(error),
      };
      if (mountedRef.current) {
        setBackendStatus(nextStatus);
      }
      return nextStatus;
    }
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      backendStatus,
      checkBackend,
      isConfigured: backendStatus.state === 'ready',
    }),
    [settings, updateSettings, resetSettings, backendStatus, checkBackend]
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
