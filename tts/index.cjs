const {
  corsHeaders,
  parseJsonBody,
  safeErrorResponse,
  synthesizeWithAzure,
} = require('../api/shared/speech.cjs');

module.exports = async function tts(context, req) {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: cors,
    };
    return;
  }

  try {
    const result = await synthesizeWithAzure(parseJsonBody(req.body));
    context.res = {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': result.contentType,
        'Content-Disposition': result.contentDisposition,
        'Cache-Control': 'no-store',
      },
      body: result.audio,
      isRaw: true,
    };
  } catch (error) {
    const response = safeErrorResponse(error);
    context.log.warn('TTS request failed', {
      status: response.status,
      code: response.body.error.code,
    });
    context.res = {
      status: response.status,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: response.body,
    };
  }
};
