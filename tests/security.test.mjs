import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSSML as buildPreviewSSML, redactSensitiveText } from '../src/lib/azureTts.js';
import {
  DEFAULT_SETTINGS,
  sanitizeStoredPreferences,
} from '../src/lib/settingsStorage.js';
import {
  clipBaseName,
  normalizeClipTitle,
  normalizeProjectName,
  slugifyFilePart,
} from '../src/lib/projectStorage.js';

const require = createRequire(import.meta.url);
const {
  buildSSML: buildBackendSSML,
  corsHeaders,
  fetchVoicesFromAzure,
  getSpeechHealth,
  normalizeTtsRequest,
  safeErrorResponse,
  synthesizeWithAzure,
} = require('../api/shared/speech.cjs');

const env = {
  AZURE_SPEECH_KEY: 'test-secret-key',
  AZURE_SPEECH_REGION: 'eastus',
};

const validTtsRequest = {
  text: 'Hello from MoonWave',
  voice: 'en-US-AriaNeural',
  locale: 'en-US',
  style: 'cheerful',
  styleDegree: 1.2,
  ratePercent: 8,
  pitchPercent: -2,
  format: 'mp3',
};

test('buildSSML escapes text and attribute values', () => {
  const quote = String.fromCharCode(34);
  const ssml = buildPreviewSSML({
    text: '<hello & goodbye>',
    voice: `bad${quote}/><x`,
    locale: `en-US${quote} test=${quote}x`,
    style: `evil${quote}/><y`,
    styleDegree: `1${quote} bad=${quote}x`,
  });

  assert.doesNotMatch(ssml, /<x|<y|test="x/);
  assert.match(ssml, /&lt;hello &amp; goodbye&gt;/);
  assert.match(ssml, /voice name="bad&quot;\/&gt;&lt;x"/);
});

test('SSML preview converts only approved pause markers', () => {
  const ssml = buildPreviewSSML({
    text: 'Wait [pause:500ms] continue [pause:5s] <tag>',
    voice: 'en-US-Ava:DragonHDOmniLatestNeural',
    locale: 'en-US',
    stylePrompt: 'read like a quiet moonlit story',
    hdParameters: {
      temperature: 0.7,
      topP: 0.8,
      topK: 22,
      cfgScale: 1.2,
    },
  });

  assert.match(ssml, /<break time="500ms"\/>/);
  assert.match(ssml, /\[pause:5s\]/);
  assert.match(ssml, /&lt;tag&gt;/);
  assert.match(ssml, /style="read like a quiet moonlit story"/);
  assert.match(ssml, /parameters="top_p=0.8;top_k=22;temperature=0.7;cfg_scale=1.2"/);
});

test('stored preferences are allowlisted and exclude Azure credentials', () => {
  const preferences = sanitizeStoredPreferences({
    azureKey: 'SECRET',
    azureRegion: 'eastus',
    defaultLocale: 'zz-ZZ',
    defaultVoice: 'bad-voice',
    outputFormat: 'evil',
  });

  assert.deepEqual(preferences, {
    defaultVoice: DEFAULT_SETTINGS.defaultVoice,
    defaultLocale: DEFAULT_SETTINGS.defaultLocale,
    outputFormat: DEFAULT_SETTINGS.outputFormat,
  });
  assert.equal(Object.hasOwn(preferences, 'azureKey'), false);
  assert.equal(Object.hasOwn(preferences, 'azureRegion'), false);
});

test('valid stored preferences survive sanitization', () => {
  assert.deepEqual(
    sanitizeStoredPreferences({
      defaultLocale: 'en-GB',
      defaultVoice: 'en-GB-SoniaNeural',
      outputFormat: 'wav',
    }),
    {
      defaultVoice: 'en-GB-SoniaNeural',
      defaultLocale: 'en-GB',
      outputFormat: 'wav',
    }
  );
});

test('backend request validation rejects invalid format and voice', () => {
  assert.throws(
    () =>
      normalizeTtsRequest({
        ...validTtsRequest,
        voice: 'bad"/><voice',
        format: 'aac',
      }),
    /Invalid TTS request/
  );
});

test('backend request validation accepts Azure HD voice ids', () => {
  const normalized = normalizeTtsRequest({
    ...validTtsRequest,
    voice: 'en-US-Emma:DragonHDLatestNeural',
  });

  assert.equal(normalized.voice, 'en-US-Emma:DragonHDLatestNeural');
});

test('backend request validation normalizes rate and pitch bounds', () => {
  const normalized = normalizeTtsRequest({
    ...validTtsRequest,
    ratePercent: 500,
    pitchPercent: -500,
  });

  assert.equal(normalized.ratePercent, 100);
  assert.equal(normalized.pitchPercent, -50);
});

test('backend request validation accepts and clamps Omni prompt controls', () => {
  const normalized = normalizeTtsRequest({
    text: 'Hello [pause:1s] again',
    voice: 'en-US-Ava:DragonHDOmniLatestNeural',
    locale: 'en-US',
    style: 'default',
    stylePrompt: '  read like <moonlight> & "waves"  ',
    hdParameters: {
      temperature: 0.1,
      topP: 2,
      topK: 99,
      cfgScale: 0.5,
    },
    format: 'mp3',
  });

  assert.equal(normalized.stylePrompt, 'read like <moonlight> & "waves"');
  assert.deepEqual(normalized.hdParameters, {
    temperature: 0.3,
    topP: 1,
    topK: 50,
    cfgScale: 1,
  });

  const ssml = buildBackendSSML(normalized);
  assert.match(ssml, /style="read like &lt;moonlight&gt; &amp; &quot;waves&quot;"/);
  assert.match(ssml, /<break time="1s"\/>/);
  assert.match(ssml, /parameters="top_p=1;top_k=50;temperature=0.3;cfg_scale=1"/);
});

test('backend rejects ambiguous or unsupported Omni controls', () => {
  assert.throws(
    () =>
      normalizeTtsRequest({
        ...validTtsRequest,
        voice: 'en-US-AriaNeural',
        stylePrompt: 'read like a film trailer',
      }),
    /Invalid TTS request/
  );

  assert.throws(
    () =>
      normalizeTtsRequest({
        ...validTtsRequest,
        voice: 'en-US-Ava:DragonHDOmniLatestNeural',
        style: 'whispering',
        stylePrompt: 'read like a film trailer',
      }),
    /Invalid TTS request/
  );

  assert.throws(
    () =>
      normalizeTtsRequest({
        ...validTtsRequest,
        hdParameters: { temperature: 0.7 },
      }),
    /Invalid TTS request/
  );
});

test('safe Azure errors never expose the configured key', async () => {
  await assert.rejects(
    () =>
      synthesizeWithAzure(validTtsRequest, env, async () => {
        return new Response('test-secret-key should not be forwarded', { status: 401 });
      }),
    (error) => {
      const response = safeErrorResponse(error);
      const serialized = JSON.stringify(response);
      assert.doesNotMatch(serialized, /test-secret-key/);
      assert.match(serialized, /Azure Speech rejected the backend credentials or region/);
      return true;
    }
  );
});

test('POST /tts Azure helper sends REST headers and returns audio bytes', async () => {
  let captured;
  const result = await synthesizeWithAzure(validTtsRequest, env, async (url, options) => {
    captured = { url, options };
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  });

  assert.equal(captured.url, 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers['Ocp-Apim-Subscription-Key'], env.AZURE_SPEECH_KEY);
  assert.equal(captured.options.headers['Content-Type'], 'application/ssml+xml');
  assert.equal(captured.options.headers['X-Microsoft-OutputFormat'], 'audio-24khz-96kbitrate-mono-mp3');
  assert.match(captured.options.body, /<voice name="en-US-AriaNeural">/);
  assert.deepEqual([...result.audio], [1, 2, 3]);
  assert.equal(result.contentType, 'audio/mpeg');
});

test('POST /tts sends Omni prompt and tuning SSML to Azure', async () => {
  let captured;
  await synthesizeWithAzure(
    {
      text: 'Moonlight [pause:250ms] rises',
      voice: 'en-US-Andrew:DragonHDOmniLatestNeural',
      locale: 'en-US',
      style: 'default',
      stylePrompt: 'read like a careful ocean narrator',
      hdParameters: {
        temperature: 0.75,
        topP: 0.8,
        topK: 24,
        cfgScale: 1.2,
      },
      format: 'mp3',
    },
    env,
    async (url, options) => {
      captured = { url, options };
      return new Response(new Uint8Array([9, 8, 7]), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }
  );

  assert.equal(captured.url, 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1');
  assert.match(captured.options.body, /en-US-Andrew:DragonHDOmniLatestNeural/);
  assert.match(captured.options.body, /style="read like a careful ocean narrator"/);
  assert.match(
    captured.options.body,
    /parameters="top_p=0.8;top_k=24;temperature=0.75;cfg_scale=1.2"/
  );
  assert.match(captured.options.body, /<break time="250ms"\/>/);
});

test('GET /voices Azure helper returns sanitized voice metadata', async () => {
  const voices = await fetchVoicesFromAzure(env, async (url, options) => {
    assert.equal(url, 'https://eastus.tts.speech.microsoft.com/cognitiveservices/voices/list');
    assert.equal(options.headers['Ocp-Apim-Subscription-Key'], env.AZURE_SPEECH_KEY);
    return new Response(
      JSON.stringify([
        {
          ShortName: 'en-US-AriaNeural',
          DisplayName: 'Aria',
          Locale: 'en-US',
          LocaleName: 'English (United States)',
          Gender: 'Female',
          StyleList: ['cheerful', 'bad style<script>'],
          ExtraSecretField: env.AZURE_SPEECH_KEY,
        },
      ]),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  });

  assert.deepEqual(voices, [
    {
      name: 'en-US-AriaNeural',
      displayName: 'Aria',
      locale: 'en-US',
      localeName: 'English (United States)',
      gender: 'Female',
      styles: ['cheerful'],
    },
  ]);
});

test('health metadata reports configuration without exposing the key', () => {
  assert.deepEqual(getSpeechHealth(env), {
    ok: true,
    configured: true,
    keyConfigured: true,
    regionConfigured: true,
    regionValid: true,
  });

  const missing = getSpeechHealth({ AZURE_SPEECH_KEY: 'test-secret-key' });
  assert.equal(missing.ok, true);
  assert.equal(missing.configured, false);
  assert.equal(JSON.stringify(missing).includes('test-secret-key'), false);
});

test('Azure subscription keys are redacted from app-handled errors', () => {
  assert.equal(
    redactSensitiveText(
      'wss://eastus.tts.speech.microsoft.com/path?Ocp-Apim-Subscription-Key=SECRET123&X-ConnectionId=abc'
    ),
    'wss://eastus.tts.speech.microsoft.com/path?Ocp-Apim-Subscription-Key=[redacted]&X-ConnectionId=abc'
  );
});

test('CORS allows exact origins from a comma-separated list', () => {
  const headers = corsHeaders(
    { headers: { origin: 'http://127.0.0.1:5173' } },
    { ALLOWED_ORIGIN: 'http://localhost:5173,http://127.0.0.1:5173' }
  );

  assert.equal(headers['Access-Control-Allow-Origin'], 'http://127.0.0.1:5173');
  assert.equal(headers.Vary, 'Origin');
  assert.deepEqual(
    corsHeaders(
      { headers: { origin: 'http://evil.example' } },
      { ALLOWED_ORIGIN: 'http://localhost:5173,http://127.0.0.1:5173' }
    ),
    {}
  );
});

test('project folder helpers produce stable safe names', () => {
  assert.equal(normalizeProjectName('  Client   Demo  '), 'Client Demo');
  assert.equal(normalizeProjectName(''), 'Untitled Project');
  assert.equal(normalizeClipTitle('  Morning   read  '), 'Morning read');
  assert.equal(normalizeClipTitle(''), 'Untitled audio');
  assert.equal(slugifyFilePart('Client Demo: Español #1'), 'client-demo-espanol-1');
  assert.match(
    clipBaseName({
      createdAt: '2026-06-18T07:12:34.000Z',
      title: 'Hello, Project!',
      id: 'clip-abcdef123456',
    }),
    /^20260618-071234z-hello-project-ef123456$/
  );
});
