// A curated catalogue of popular Azure Neural voices.
// `styles` lists the express-as speaking styles each voice officially supports.
// (Voices with an empty styles array only support the neutral/default delivery.)

export const VOICES = [
  // English (US)
  {
    id: 'en-US-AriaNeural',
    name: 'Aria',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: [
      'chat',
      'cheerful',
      'empathetic',
      'friendly',
      'hopeful',
      'narration-professional',
      'newscast-casual',
      'newscast-formal',
      'excited',
      'sad',
      'angry',
      'whispering',
    ],
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: [
      'assistant',
      'chat',
      'customerservice',
      'newscast',
      'cheerful',
      'friendly',
      'hopeful',
      'excited',
      'sad',
      'angry',
      'whispering',
    ],
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: [
      'newscast',
      'cheerful',
      'friendly',
      'hopeful',
      'excited',
      'sad',
      'angry',
      'shouting',
      'whispering',
    ],
  },
  {
    id: 'en-US-DavisNeural',
    name: 'Davis',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: ['chat', 'cheerful', 'friendly', 'hopeful', 'excited', 'sad', 'angry', 'whispering'],
  },
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Andrew (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: [],
  },
  {
    id: 'en-US-AvaMultilingualNeural',
    name: 'Ava (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: [],
  },
  {
    id: 'en-US-EmmaNeural',
    name: 'Emma',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: ['cheerful', 'sad', 'angry', 'excited', 'friendly', 'hopeful'],
  },
  // English (UK)
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia',
    locale: 'en-GB',
    localeName: 'English (UK)',
    gender: 'Female',
    styles: ['cheerful', 'sad'],
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan',
    locale: 'en-GB',
    localeName: 'English (UK)',
    gender: 'Male',
    styles: ['chat', 'cheerful', 'sad'],
  },
  // English (Australia)
  {
    id: 'en-AU-NatashaNeural',
    name: 'Natasha',
    locale: 'en-AU',
    localeName: 'English (Australia)',
    gender: 'Female',
    styles: [],
  },
  // Spanish
  {
    id: 'es-ES-ElviraNeural',
    name: 'Elvira',
    locale: 'es-ES',
    localeName: 'Spanish (Spain)',
    gender: 'Female',
    styles: ['cheerful', 'sad'],
  },
  {
    id: 'es-MX-DaliaNeural',
    name: 'Dalia',
    locale: 'es-MX',
    localeName: 'Spanish (Mexico)',
    gender: 'Female',
    styles: ['cheerful', 'sad'],
  },
  // French
  {
    id: 'fr-FR-DeniseNeural',
    name: 'Denise',
    locale: 'fr-FR',
    localeName: 'French (France)',
    gender: 'Female',
    styles: ['cheerful', 'sad'],
  },
  // German
  {
    id: 'de-DE-KatjaNeural',
    name: 'Katja',
    locale: 'de-DE',
    localeName: 'German (Germany)',
    gender: 'Female',
    styles: [],
  },
  // Italian
  {
    id: 'it-IT-ElsaNeural',
    name: 'Elsa',
    locale: 'it-IT',
    localeName: 'Italian (Italy)',
    gender: 'Female',
    styles: [],
  },
  // Portuguese (Brazil) - supports the "calm" style
  {
    id: 'pt-BR-FranciscaNeural',
    name: 'Francisca',
    locale: 'pt-BR',
    localeName: 'Portuguese (Brazil)',
    gender: 'Female',
    styles: ['calm', 'cheerful', 'sad'],
  },
  // Japanese
  {
    id: 'ja-JP-NanamiNeural',
    name: 'Nanami',
    locale: 'ja-JP',
    localeName: 'Japanese (Japan)',
    gender: 'Female',
    styles: ['chat', 'cheerful', 'customerservice'],
  },
  // Korean
  {
    id: 'ko-KR-SunHiNeural',
    name: 'Sun-Hi',
    locale: 'ko-KR',
    localeName: 'Korean (Korea)',
    gender: 'Female',
    styles: [],
  },
  // Chinese (Mandarin) - rich set of styles incl. "calm"
  {
    id: 'zh-CN-XiaoxiaoNeural',
    name: 'Xiaoxiao',
    locale: 'zh-CN',
    localeName: 'Chinese (Mandarin)',
    gender: 'Female',
    styles: ['calm', 'chat', 'cheerful', 'gentle', 'sad', 'angry', 'fearful', 'newscast'],
  },
  // Hindi
  {
    id: 'hi-IN-SwaraNeural',
    name: 'Swara',
    locale: 'hi-IN',
    localeName: 'Hindi (India)',
    gender: 'Female',
    styles: [],
  },
];

/** Unique locales present in the catalogue, in catalogue order. */
export function getLocales() {
  const seen = new Set();
  const locales = [];
  for (const voice of VOICES) {
    if (!seen.has(voice.locale)) {
      seen.add(voice.locale);
      locales.push({ locale: voice.locale, localeName: voice.localeName });
    }
  }
  return locales;
}

export function getVoicesByLocale(locale) {
  return VOICES.filter((voice) => voice.locale === locale);
}

export function getVoiceById(id) {
  return VOICES.find((voice) => voice.id === id) || null;
}

/** Turn an Azure style id like "narration-professional" into "Narration Professional". */
export function humanizeStyle(style) {
  if (!style || style === 'default') return 'Default';
  const special = {
    customerservice: 'Customer Service',
    'narration-professional': 'Narration (Professional)',
    'newscast-casual': 'Newscast (Casual)',
    'newscast-formal': 'Newscast (Formal)',
  };
  if (special[style]) return special[style];
  return style
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// Common Azure Speech regions for the Settings dropdown.
export const AZURE_REGIONS = [
  'eastus',
  'eastus2',
  'westus',
  'westus2',
  'westus3',
  'centralus',
  'southcentralus',
  'westcentralus',
  'canadacentral',
  'brazilsouth',
  'northeurope',
  'westeurope',
  'uksouth',
  'francecentral',
  'germanywestcentral',
  'switzerlandnorth',
  'swedencentral',
  'eastasia',
  'southeastasia',
  'japaneast',
  'japanwest',
  'koreacentral',
  'australiaeast',
  'centralindia',
  'uaenorth',
  'southafricanorth',
];
