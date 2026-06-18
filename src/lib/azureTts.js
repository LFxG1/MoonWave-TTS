export const OUTPUT_FORMATS = {
  mp3: {
    label: 'MP3',
    mime: 'audio/mpeg',
    ext: 'mp3',
  },
  wav: {
    label: 'WAV',
    mime: 'audio/wav',
    ext: 'wav',
  },
};

export const DEFAULT_HD_PARAMETERS = {
  temperature: 0.7,
  topP: 0.7,
  topK: 22,
  cfgScale: 1.4,
};

/** Escape characters that would otherwise break the SSML document. */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toSignedPercent(value) {
  const rounded = Math.round(value || 0);
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

function escapeTextWithPauseMarkers(text, pauseMarkers = true) {
  if (!pauseMarkers) {
    return escapeXml(text);
  }

  const pattern = /\[pause:(250ms|500ms|1s)\]/g;
  let output = '';
  let lastIndex = 0;
  String(text).replace(pattern, (match, duration, index) => {
    output += escapeXml(String(text).slice(lastIndex, index));
    output += `<break time="${duration}"/>`;
    lastIndex = index + match.length;
    return match;
  });
  output += escapeXml(String(text).slice(lastIndex));
  return output;
}

export function getTtsApiBaseUrl() {
  return (import.meta.env.VITE_TTS_API_BASE_URL || '/api').replace(/\/+$/, '') || '/api';
}

function endpoint(path) {
  const baseUrl = getTtsApiBaseUrl();
  const safePath = path.startsWith('/') ? path : `/${path}`;

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return `${baseUrl}${safePath}`;
  }

  if (baseUrl.startsWith('/')) {
    return `${baseUrl}${safePath}`;
  }

  throw new Error('VITE_TTS_API_BASE_URL must be a relative path or an http(s) URL.');
}

export function redactSensitiveText(value) {
  return String(value).replace(
    /(Ocp-Apim-Subscription-Key=|AZURE_SPEECH_KEY=)[^&\s)]+/gi,
    '$1[redacted]'
  );
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch {
    return response.statusText || 'The request could not be completed.';
  }
}

/** Build an SSML document with prosody (rate/pitch) and optional speaking style. */
export function buildSSML({
  text,
  voice,
  locale,
  style,
  styleDegree,
  stylePrompt,
  pauseMarkers = true,
  hdParameters,
  ratePercent = 0,
  pitchPercent = 0,
}) {
  const safeLocale = escapeXml(locale);
  const safeVoice = escapeXml(voice);
  const voiceParameters = formatHdParameters(hdParameters);
  const voiceAttributes = voiceParameters
    ? ` name="${safeVoice}" parameters="${escapeXml(voiceParameters)}"`
    : ` name="${safeVoice}"`;
  const prosody = `<prosody rate="${toSignedPercent(ratePercent)}" pitch="${toSignedPercent(
    pitchPercent
  )}">${escapeTextWithPauseMarkers(text, pauseMarkers)}</prosody>`;

  let inner = prosody;
  const cleanPrompt = String(stylePrompt || '').trim();
  if (cleanPrompt) {
    inner = `<mstts:express-as style="${escapeXml(cleanPrompt)}">${prosody}</mstts:express-as>`;
  } else if (style && style !== 'default') {
    const numericDegree = Number(styleDegree);
    const degreeAttr =
      styleDegree && Number.isFinite(numericDegree) ? ` styledegree="${numericDegree}"` : '';
    inner = `<mstts:express-as style="${escapeXml(style)}"${degreeAttr}>${prosody}</mstts:express-as>`;
  }

  return (
    `<speak version="1.0" ` +
    `xmlns="http://www.w3.org/2001/10/synthesis" ` +
    `xmlns:mstts="https://www.w3.org/2001/mstts" ` +
    `xml:lang="${safeLocale}">` +
    `<voice${voiceAttributes}>${inner}</voice>` +
    `</speak>`
  );
}

export function formatHdParameters(parameters) {
  if (!parameters || typeof parameters !== 'object') return '';
  const merged = { ...DEFAULT_HD_PARAMETERS, ...parameters };
  const temperature = Number(merged.temperature);
  const topP = Number(merged.topP);
  const topK = Number(merged.topK);
  const cfgScale = Number(merged.cfgScale);
  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(topP) ||
    !Number.isFinite(topK) ||
    !Number.isFinite(cfgScale)
  ) {
    return '';
  }
  return [
    `top_p=${topP}`,
    `top_k=${Math.round(topK)}`,
    `temperature=${temperature}`,
    `cfg_scale=${cfgScale}`,
  ].join(';');
}

/**
 * Synthesize speech through the backend Azure Function and return audio as a Blob + object URL.
 * Throws an Error with a human-readable message on any failure.
 */
export async function synthesizeSpeech({
  text,
  voice,
  locale,
  style,
  styleDegree,
  stylePrompt,
  pauseMarkers = true,
  hdParameters,
  ratePercent = 0,
  pitchPercent = 0,
  format = 'mp3',
}) {
  if (!text || !text.trim()) {
    throw new Error('Please enter some text to convert to speech.');
  }

  const outputFormat = OUTPUT_FORMATS[format] || OUTPUT_FORMATS.mp3;
  const requestBody = {
    text,
    voice,
    locale,
    style,
    styleDegree,
    stylePrompt,
    pauseMarkers,
    hdParameters,
    ratePercent,
    pitchPercent,
    format,
  };

  const response = await fetch(endpoint('/tts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(redactSensitiveText(await readErrorMessage(response)));
  }

  const blob = await response.blob();
  const contentType = response.headers.get('content-type') || outputFormat.mime;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    mime: contentType,
    ext: outputFormat.ext,
    format,
    durationSec: null,
    ssml: previewSSML(requestBody),
  };
}

/** Generate an SSML preview without calling Azure (used by the SSML export). */
export function previewSSML(params) {
  return buildSSML(params);
}

/** Retrieve the backend voice list to test the deployed Azure Function. */
export async function fetchAzureVoices() {
  const response = await fetch(endpoint('/voices'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(redactSensitiveText(await readErrorMessage(response)));
  }

  const data = await response.json();
  return Array.isArray(data?.voices) ? data.voices : [];
}

/** Check whether the Function host is reachable and has Speech app settings. */
export async function fetchBackendHealth() {
  const response = await fetch(endpoint('/health'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(redactSensitiveText(await readErrorMessage(response)));
  }

  return response.json();
}
