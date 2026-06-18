const MAX_TEXT_CHARS = 5000;
const MAX_STYLE_PROMPT_CHARS = 220;
const USER_AGENT = 'TextToSpeechAzureFunction';

const DEFAULT_HD_PARAMETERS = {
  temperature: 0.7,
  topP: 0.7,
  topK: 22,
  cfgScale: 1.4,
};

const OUTPUT_FORMATS = {
  mp3: {
    azureFormat: 'audio-24khz-96kbitrate-mono-mp3',
    mime: 'audio/mpeg',
    ext: 'mp3',
  },
  wav: {
    azureFormat: 'riff-24khz-16bit-mono-pcm',
    mime: 'audio/wav',
    ext: 'wav',
  },
};

const VOICE_PATTERN = /^(?=.{3,160}$)[A-Za-z0-9-]+(?::[A-Za-z0-9-]+)?$/;
const LOCALE_PATTERN = /^[a-z]{2,3}-[A-Z0-9]{2,4}$/;
const STYLE_PATTERN = /^[a-z][a-z0-9-]{0,39}$/;
const STYLE_PROMPT_VOICE_PATTERN = /^en-US-(Ava|Andrew):DragonHDOmniLatestNeural$/i;
const DRAGON_OMNI_PATTERN = /:DragonHDOmniLatestNeural$/i;
const REGION_PATTERN = /^[a-z0-9-]{2,64}$/;

class PublicHttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'PublicHttpError';
    this.status = status;
    this.code = code;
    this.publicMessage = message;
    this.details = details;
  }
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizePercent(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.round(clamp(numeric, min, max));
}

function toSignedPercent(value = 0) {
  const numeric = Number(value) || 0;
  const rounded = Math.round(numeric);
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

function hasControlCharacters(value) {
  return /[\u0000-\u001F\u007F]/.test(value);
}

function normalizeStylePrompt(value, voice, style, errors) {
  if (typeof value !== 'string') {
    return '';
  }

  const prompt = value.replace(/\s+/g, ' ').trim();
  if (!prompt) {
    return '';
  }

  if (style && style !== 'default') {
    errors.push('stylePrompt cannot be combined with style');
  }

  if (!STYLE_PROMPT_VOICE_PATTERN.test(voice)) {
    errors.push('stylePrompt is only supported for Ava Omni HD and Andrew Omni HD voices');
  }

  if (prompt.length > MAX_STYLE_PROMPT_CHARS) {
    errors.push(`stylePrompt must be ${MAX_STYLE_PROMPT_CHARS} characters or fewer`);
  }

  if (hasControlCharacters(prompt)) {
    errors.push('stylePrompt must not contain control characters');
  }

  return prompt;
}

function normalizeHdNumber(value, fallback, min, max, name, errors) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    errors.push(`${name} must be a number`);
    return fallback;
  }
  return clamp(numeric, min, max);
}

function normalizeHdParameters(value, voice, errors) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push('hdParameters must be an object');
    return undefined;
  }

  if (!DRAGON_OMNI_PATTERN.test(voice)) {
    errors.push('hdParameters are only supported for Dragon HD Omni voices');
  }

  return {
    temperature: normalizeHdNumber(
      value.temperature,
      DEFAULT_HD_PARAMETERS.temperature,
      0.3,
      1,
      'temperature',
      errors
    ),
    topP: normalizeHdNumber(value.topP, DEFAULT_HD_PARAMETERS.topP, 0.3, 1, 'topP', errors),
    topK: Math.round(
      normalizeHdNumber(value.topK, DEFAULT_HD_PARAMETERS.topK, 1, 50, 'topK', errors)
    ),
    cfgScale: normalizeHdNumber(
      value.cfgScale,
      DEFAULT_HD_PARAMETERS.cfgScale,
      1,
      2,
      'cfgScale',
      errors
    ),
  };
}

function formatHdParameters(parameters) {
  if (!parameters) {
    return '';
  }

  return [
    `top_p=${parameters.topP}`,
    `top_k=${parameters.topK}`,
    `temperature=${parameters.temperature}`,
    `cfg_scale=${parameters.cfgScale}`,
  ].join(';');
}

function normalizeTtsRequest(input = {}) {
  const errors = [];
  const text = typeof input.text === 'string' ? input.text : '';
  const voice = typeof input.voice === 'string' ? input.voice.trim() : '';
  const locale = typeof input.locale === 'string' ? input.locale.trim() : 'en-US';
  const styleInput = typeof input.style === 'string' ? input.style.trim() : 'default';
  const style = styleInput && styleInput !== 'default' ? styleInput : 'default';
  const format = typeof input.format === 'string' ? input.format.trim().toLowerCase() : 'mp3';

  if (!text.trim()) {
    errors.push('text is required');
  }

  if (text.length > MAX_TEXT_CHARS) {
    errors.push(`text must be ${MAX_TEXT_CHARS} characters or fewer`);
  }

  if (!VOICE_PATTERN.test(voice)) {
    errors.push('voice must be a valid Azure voice short name');
  }

  if (!LOCALE_PATTERN.test(locale)) {
    errors.push('locale must be a valid BCP-47 locale');
  }

  if (style !== 'default' && !STYLE_PATTERN.test(style)) {
    errors.push('style must be a valid Azure speaking style');
  }

  const stylePrompt = normalizeStylePrompt(input.stylePrompt, voice, style, errors);

  if (!OUTPUT_FORMATS[format]) {
    errors.push('format must be mp3 or wav');
  }

  let styleDegree;
  if (input.styleDegree !== undefined && input.styleDegree !== null && input.styleDegree !== '') {
    const numericStyleDegree = Number(input.styleDegree);
    if (!Number.isFinite(numericStyleDegree)) {
      errors.push('styleDegree must be a number');
    } else {
      styleDegree = clamp(numericStyleDegree, 0.01, 2);
    }
  }

  const hdParameters = normalizeHdParameters(input.hdParameters, voice, errors);

  if (errors.length) {
    throw new PublicHttpError(400, 'INVALID_TTS_REQUEST', 'Invalid TTS request.', errors);
  }

  return {
    text,
    voice,
    locale,
    style,
    styleDegree,
    stylePrompt,
    pauseMarkers: input.pauseMarkers !== false,
    hdParameters,
    ratePercent: normalizePercent(input.ratePercent, 0, -50, 100),
    pitchPercent: normalizePercent(input.pitchPercent, 0, -50, 50),
    format,
  };
}

function buildSSML({
  text,
  voice,
  locale = 'en-US',
  style = 'default',
  styleDegree,
  stylePrompt,
  pauseMarkers = true,
  hdParameters,
  ratePercent = 0,
  pitchPercent = 0,
}) {
  const prosody = `<prosody rate="${toSignedPercent(ratePercent)}" pitch="${toSignedPercent(
    pitchPercent
  )}">${escapeTextWithPauseMarkers(text, pauseMarkers)}</prosody>`;

  const styled =
    stylePrompt
      ? `<mstts:express-as style="${escapeXml(stylePrompt)}">${prosody}</mstts:express-as>`
      : style && style !== 'default'
      ? `<mstts:express-as style="${escapeXml(style)}"${
          styleDegree ? ` styledegree="${escapeXml(styleDegree)}"` : ''
        }>${prosody}</mstts:express-as>`
      : prosody;
  const voiceParameters = formatHdParameters(hdParameters);

  return [
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"',
    ' xmlns:mstts="https://www.w3.org/2001/mstts"',
    ` xml:lang="${escapeXml(locale)}">`,
    `<voice name="${escapeXml(voice)}"${
      voiceParameters ? ` parameters="${escapeXml(voiceParameters)}"` : ''
    }>`,
    styled,
    '</voice></speak>',
  ].join('');
}

function getSpeechEnv(env = process.env) {
  const key = env.AZURE_SPEECH_KEY;
  const region = env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    throw new PublicHttpError(
      500,
      'AZURE_SPEECH_NOT_CONFIGURED',
      'Azure Speech backend is not configured.'
    );
  }

  if (!REGION_PATTERN.test(region)) {
    throw new PublicHttpError(
      500,
      'AZURE_SPEECH_NOT_CONFIGURED',
      'Azure Speech backend is not configured.'
    );
  }

  return { key, region };
}

function getSpeechHealth(env = process.env) {
  const keyConfigured = Boolean(env.AZURE_SPEECH_KEY);
  const regionConfigured = Boolean(env.AZURE_SPEECH_REGION);
  const regionValid = !regionConfigured || REGION_PATTERN.test(env.AZURE_SPEECH_REGION);

  return {
    ok: true,
    configured: keyConfigured && regionConfigured && regionValid,
    keyConfigured,
    regionConfigured,
    regionValid,
  };
}

function azureBaseUrl(region) {
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices`;
}

function getRequestHeader(req, headerName) {
  const headers = req?.headers || {};
  const requested = headerName.toLowerCase();

  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === requested) {
      return Array.isArray(value) ? value[0] : value;
    }
  }

  return undefined;
}

function allowedOriginsFromEnv(value) {
  return String(value || '')
    .split(/[\s,]+/)
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(req, env = process.env) {
  const allowedOrigins = allowedOriginsFromEnv(env.ALLOWED_ORIGIN);
  if (!allowedOrigins.length) {
    return {};
  }

  const origin = getRequestHeader(req, 'origin');
  if (!allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    Vary: 'Origin',
  };
}

function parseJsonBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      throw new PublicHttpError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
    }
  }

  return body;
}

function safeFilename(voice, ext) {
  const safeVoice = String(voice || 'speech')
    .replace(/[^A-Za-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return `${safeVoice || 'speech'}-${Date.now()}.${ext}`;
}

function azureFailure(status) {
  if (status === 401 || status === 403) {
    return new PublicHttpError(
      502,
      'AZURE_SPEECH_AUTH_FAILED',
      'Azure Speech rejected the backend credentials or region.'
    );
  }

  if (status === 429) {
    return new PublicHttpError(
      429,
      'AZURE_SPEECH_RATE_LIMITED',
      'Azure Speech quota or rate limit was exceeded.'
    );
  }

  if (status >= 400 && status < 500) {
    return new PublicHttpError(
      502,
      'AZURE_SPEECH_REQUEST_REJECTED',
      'Azure Speech rejected the synthesis request.'
    );
  }

  return new PublicHttpError(502, 'AZURE_SPEECH_FAILED', 'Azure Speech request failed.');
}

function safeErrorResponse(error) {
  const isPublic = error instanceof PublicHttpError;
  const status = isPublic ? error.status : 500;
  const body = {
    error: {
      code: isPublic ? error.code : 'INTERNAL_ERROR',
      message: isPublic ? error.publicMessage : 'The request could not be completed.',
    },
  };

  if (isPublic && error.details) {
    body.error.details = error.details;
  }

  return { status, body };
}

async function synthesizeWithAzure(input, env = process.env, fetchImpl = fetch) {
  const normalized = normalizeTtsRequest(input);
  const { key, region } = getSpeechEnv(env);
  const output = OUTPUT_FORMATS[normalized.format];
  const ssml = buildSSML(normalized);

  const response = await fetchImpl(`${azureBaseUrl(region)}/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': output.azureFormat,
      'User-Agent': USER_AGENT,
    },
    body: ssml,
  });

  if (!response.ok) {
    throw azureFailure(response.status);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  return {
    audio,
    contentType: output.mime,
    contentDisposition: `attachment; filename="${safeFilename(normalized.voice, output.ext)}"`,
    format: normalized.format,
    ssml,
  };
}

function sanitizeVoice(voice = {}) {
  const styles = Array.isArray(voice.StyleList)
    ? voice.StyleList.filter((style) => typeof style === 'string' && STYLE_PATTERN.test(style))
    : [];

  return {
    name: typeof voice.ShortName === 'string' ? voice.ShortName : '',
    displayName: typeof voice.DisplayName === 'string' ? voice.DisplayName : '',
    locale: typeof voice.Locale === 'string' ? voice.Locale : '',
    localeName: typeof voice.LocaleName === 'string' ? voice.LocaleName : '',
    gender: typeof voice.Gender === 'string' ? voice.Gender : '',
    styles,
  };
}

async function fetchVoicesFromAzure(env = process.env, fetchImpl = fetch) {
  const { key, region } = getSpeechEnv(env);
  const response = await fetchImpl(`${azureBaseUrl(region)}/voices/list`, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw azureFailure(response.status);
  }

  const voices = await response.json();
  if (!Array.isArray(voices)) {
    throw new PublicHttpError(502, 'AZURE_SPEECH_FAILED', 'Azure Speech request failed.');
  }

  return voices
    .map(sanitizeVoice)
    .filter((voice) => voice.name && voice.locale);
}

module.exports = {
  MAX_TEXT_CHARS,
  MAX_STYLE_PROMPT_CHARS,
  DEFAULT_HD_PARAMETERS,
  OUTPUT_FORMATS,
  PublicHttpError,
  allowedOriginsFromEnv,
  buildSSML,
  corsHeaders,
  fetchVoicesFromAzure,
  getSpeechHealth,
  normalizeTtsRequest,
  parseJsonBody,
  safeErrorResponse,
  synthesizeWithAzure,
  escapeXml,
  toSignedPercent,
};
