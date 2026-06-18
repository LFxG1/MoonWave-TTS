import { getVoiceById, getVoicesByLocale } from './voices.js';

export const SETTINGS_STORAGE_KEY = 'moonwave.settings.v1';
const LEGACY_CREDENTIALS_STORAGE_KEY = 'moonwave.azureCredentials.v1';

const OUTPUT_FORMATS = new Set(['mp3', 'wav']);

export const DEFAULT_SETTINGS = {
  defaultVoice: 'en-US-EmmaMultilingualNeural',
  defaultLocale: 'en-US',
  outputFormat: 'mp3',
};

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`MoonWave: could not read ${key}.`, error);
    return null;
  }
}

export function sanitizeStoredPreferences(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  const defaultLocale =
    typeof source.defaultLocale === 'string' && getVoicesByLocale(source.defaultLocale).length
      ? source.defaultLocale
      : DEFAULT_SETTINGS.defaultLocale;

  const defaultVoiceCandidate =
    typeof source.defaultVoice === 'string' ? getVoiceById(source.defaultVoice) : null;
  const fallbackVoice =
    defaultLocale === DEFAULT_SETTINGS.defaultLocale
      ? DEFAULT_SETTINGS.defaultVoice
      : getVoicesByLocale(defaultLocale)[0]?.id || DEFAULT_SETTINGS.defaultVoice;
  const defaultVoice =
    defaultVoiceCandidate?.locale === defaultLocale
      ? defaultVoiceCandidate.id
      : fallbackVoice;

  const outputFormat =
    typeof source.outputFormat === 'string' && OUTPUT_FORMATS.has(source.outputFormat)
      ? source.outputFormat
      : DEFAULT_SETTINGS.outputFormat;

  return {
    defaultVoice,
    defaultLocale,
    outputFormat,
  };
}

export function persistStoredSettings(settings) {
  const preferences = sanitizeStoredPreferences(settings);

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('MoonWave: could not persist preferences to localStorage.', error);
  }

  clearLegacyCredentials();
}

export function readStoredSettings() {
  const storedPreferences = readJson(localStorage, SETTINGS_STORAGE_KEY);
  const preferences = sanitizeStoredPreferences(storedPreferences);
  clearLegacyCredentials();

  return {
    ...DEFAULT_SETTINGS,
    ...preferences,
  };
}

function clearLegacyCredentials() {
  try {
    sessionStorage.removeItem(LEGACY_CREDENTIALS_STORAGE_KEY);
  } catch (error) {
    console.warn('MoonWave: could not clear legacy credentials from sessionStorage.', error);
  }
}

export function clearStoredSettings() {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (error) {
    console.warn('MoonWave: could not clear preferences from localStorage.', error);
  }

  clearLegacyCredentials();
}
