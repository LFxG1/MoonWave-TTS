// A curated catalogue of popular Azure Neural voices.
// `styles` lists the express-as speaking styles available in MoonWave's UI.
// Dragon HD/Omni styles are curated from Azure's HD voice docs because the
// live voices/list endpoint can return an empty StyleList for those voices.

export const DRAGON_HD_STYLES = [
  'amazed',
  'amused',
  'angry',
  'annoyed',
  'anxious',
  'appreciative',
  'calm',
  'cautious',
  'concerned',
  'confident',
  'confused',
  'curious',
  'defeated',
  'defensive',
  'defiant',
  'determined',
  'disappointed',
  'disgusted',
  'doubtful',
  'ecstatic',
  'encouraging',
  'excited',
  'fast',
  'fearful',
  'frustrated',
  'happy',
  'hesitant',
  'hurt',
  'impatient',
  'impressed',
  'intrigued',
  'joking',
  'laughing',
  'optimistic',
  'painful',
  'panicked',
  'panting',
  'pleading',
  'proud',
  'quiet',
  'reassuring',
  'reflective',
  'relieved',
  'remorseful',
  'resigned',
  'sad',
  'sarcastic',
  'secretive',
  'serious',
  'shocked',
  'shouting',
  'shy',
  'skeptical',
  'slow',
  'struggling',
  'surprised',
  'suspicious',
  'sympathetic',
  'terrified',
  'upset',
  'urgent',
  'whispering',
];

export const VOICES = [
  // English (US)
  {
    id: 'en-US-Ava:DragonHDOmniLatestNeural',
    name: 'Ava Omni HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'Omni',
    supportsStylePrompt: true,
    supportsHdParameters: true,
  },
  {
    id: 'en-US-Andrew:DragonHDOmniLatestNeural',
    name: 'Andrew Omni HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'Omni',
    supportsStylePrompt: true,
    supportsHdParameters: true,
  },
  {
    id: 'en-US-Emma:DragonHDLatestNeural',
    name: 'Emma Dragon HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'HD',
  },
  {
    id: 'en-US-Andrew:DragonHDLatestNeural',
    name: 'Andrew Dragon HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'HD',
  },
  {
    id: 'en-US-Ava:DragonHDLatestNeural',
    name: 'Ava Dragon HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'HD',
  },
  {
    id: 'en-US-Brian:DragonHDLatestNeural',
    name: 'Brian Dragon HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'HD',
  },
  {
    id: 'en-US-Steffan:DragonHDLatestNeural',
    name: 'Steffan Dragon HD',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: DRAGON_HD_STYLES,
    recommended: true,
    badge: 'HD',
  },
  {
    id: 'en-US-EmmaMultilingualNeural',
    name: 'Emma (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: [],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Andrew (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: ['empathetic', 'relieved'],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-AvaMultilingualNeural',
    name: 'Ava (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: [],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-BrianMultilingualNeural',
    name: 'Brian (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: [],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-SerenaMultilingualNeural',
    name: 'Serena (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: ['empathetic', 'excited', 'friendly', 'shy', 'serious', 'relieved', 'sad'],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-DavisMultilingualNeural',
    name: 'Davis (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: ['empathetic', 'funny', 'relieved'],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-SteffanMultilingualNeural',
    name: 'Steffan (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Male',
    styles: [],
    recommended: true,
    badge: 'Recommended',
  },
  {
    id: 'en-US-NancyMultilingualNeural',
    name: 'Nancy (Multilingual)',
    locale: 'en-US',
    localeName: 'English (US)',
    gender: 'Female',
    styles: ['excited', 'friendly', 'funny', 'relieved', 'shy'],
    recommended: true,
    badge: 'Recommended',
  },
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

export function getRecommendedVoicesByLocale(locale) {
  return VOICES.filter((voice) => voice.locale === locale && voice.recommended);
}

export function getStandardVoicesByLocale(locale) {
  return VOICES.filter((voice) => voice.locale === locale && !voice.recommended);
}

export function getVoiceById(id) {
  return VOICES.find((voice) => voice.id === id) || null;
}

export function isDragonHdVoice(voiceOrId) {
  const id = typeof voiceOrId === 'string' ? voiceOrId : voiceOrId?.id;
  return /:DragonHD(?:Omni)?LatestNeural$/i.test(id || '');
}

export function isDragonOmniVoice(voiceOrId) {
  const id = typeof voiceOrId === 'string' ? voiceOrId : voiceOrId?.id;
  return /:DragonHDOmniLatestNeural$/i.test(id || '');
}

export function supportsStylePrompt(voiceOrId) {
  const voice = typeof voiceOrId === 'string' ? getVoiceById(voiceOrId) : voiceOrId;
  return Boolean(voice?.supportsStylePrompt);
}

export function supportsHdParameters(voiceOrId) {
  const voice = typeof voiceOrId === 'string' ? getVoiceById(voiceOrId) : voiceOrId;
  return Boolean(voice?.supportsHdParameters);
}

export function getVoiceStyles(voiceOrId) {
  const voice = typeof voiceOrId === 'string' ? getVoiceById(voiceOrId) : voiceOrId;
  return Array.isArray(voice?.styles) ? voice.styles : [];
}

export function getVoiceLanguageCount(voiceOrId) {
  const voice = typeof voiceOrId === 'string' ? getVoiceById(voiceOrId) : voiceOrId;
  if (!voice) return 0;
  if (Number.isFinite(voice.languageCount)) return voice.languageCount;
  if (voice.id.includes('Multilingual') || isDragonOmniVoice(voice)) return getLocales().length;
  return 1;
}

export function getVoiceLanguageLabel(voiceOrId) {
  const count = getVoiceLanguageCount(voiceOrId);
  if (!count) return 'No languages';
  if (count === 1) return '1 language';
  return `${count} library languages`;
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
