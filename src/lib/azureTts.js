// Thin wrapper around the Microsoft Cognitive Services Speech SDK.
// The SDK is imported dynamically so it is only loaded when the user
// actually generates speech (keeps the initial landing bundle small).

export const OUTPUT_FORMATS = {
  mp3: {
    label: 'MP3',
    mime: 'audio/mpeg',
    ext: 'mp3',
    sdkFormatName: 'Audio24Khz96KBitRateMonoMp3',
  },
  wav: {
    label: 'WAV',
    mime: 'audio/wav',
    ext: 'wav',
    sdkFormatName: 'Riff24Khz16BitMonoPcm',
  },
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

/** Build an SSML document with prosody (rate/pitch) and optional speaking style. */
export function buildSSML({
  text,
  voice,
  locale,
  style,
  styleDegree,
  ratePercent = 0,
  pitchPercent = 0,
}) {
  const safeText = escapeXml(text);
  const prosody = `<prosody rate="${toSignedPercent(ratePercent)}" pitch="${toSignedPercent(
    pitchPercent
  )}">${safeText}</prosody>`;

  let inner = prosody;
  if (style && style !== 'default') {
    const degreeAttr = styleDegree ? ` styledegree="${styleDegree}"` : '';
    inner = `<mstts:express-as style="${style}"${degreeAttr}>${prosody}</mstts:express-as>`;
  }

  return (
    `<speak version="1.0" ` +
    `xmlns="http://www.w3.org/2001/10/synthesis" ` +
    `xmlns:mstts="https://www.w3.org/2001/mstts" ` +
    `xml:lang="${locale}">` +
    `<voice name="${voice}">${inner}</voice>` +
    `</speak>`
  );
}

/**
 * Synthesize speech with Azure and return the audio as a Blob + object URL.
 * Throws an Error with a human-readable message on any failure.
 */
export async function synthesizeSpeech({
  key,
  region,
  text,
  voice,
  locale,
  style,
  styleDegree,
  ratePercent = 0,
  pitchPercent = 0,
  format = 'mp3',
}) {
  if (!key || !region) {
    throw new Error('Azure Speech key and region are required. Add them in Settings.');
  }
  if (!text || !text.trim()) {
    throw new Error('Please enter some text to convert to speech.');
  }

  const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk');
  const outputFormat = OUTPUT_FORMATS[format] || OUTPUT_FORMATS.mp3;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key.trim(), region.trim());
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat =
    SpeechSDK.SpeechSynthesisOutputFormat[outputFormat.sdkFormatName];

  const ssml = buildSSML({ text, voice, locale, style, styleDegree, ratePercent, pitchPercent });

  // Passing `null` as the audio config synthesizes to memory instead of the
  // default speaker, so we control playback ourselves.
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

  try {
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(ssml, resolve, reject);
    });

    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
      const blob = new Blob([result.audioData], { type: outputFormat.mime });
      const url = URL.createObjectURL(blob);
      // audioDuration is in 100-nanosecond ticks when present.
      const durationSec = result.audioDuration ? result.audioDuration / 1e7 : null;
      return {
        blob,
        url,
        mime: outputFormat.mime,
        ext: outputFormat.ext,
        format,
        durationSec,
        ssml,
      };
    }

    if (result.reason === SpeechSDK.ResultReason.Canceled) {
      const details = SpeechSDK.CancellationDetails.fromResult(result);
      let message = `Synthesis canceled (${details.reason}).`;
      if (details.errorDetails) {
        message += ` ${details.errorDetails}`;
      }
      if (
        details.reason === SpeechSDK.CancellationReason.Error &&
        /401|403|authentication|forbidden/i.test(details.errorDetails || '')
      ) {
        message += ' Check that your Speech key and region are correct in Settings.';
      }
      throw new Error(message);
    }

    throw new Error('Speech synthesis failed for an unknown reason.');
  } finally {
    synthesizer.close();
  }
}

/** Generate an SSML preview without calling Azure (used by the SSML export). */
export function previewSSML(params) {
  return buildSSML(params);
}

/** Retrieve the full list of voices available to the account (used to test the key). */
export async function fetchAzureVoices({ key, region }) {
  if (!key || !region) {
    throw new Error('Azure Speech key and region are required.');
  }
  const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk');
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key.trim(), region.trim());
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);
  try {
    const result = await synthesizer.getVoicesAsync();
    if (result.reason === SpeechSDK.ResultReason.VoicesListRetrieved) {
      return result.voices || [];
    }
    throw new Error(result.errorDetails || 'Could not retrieve the voice list. Check your key and region.');
  } finally {
    synthesizer.close();
  }
}
