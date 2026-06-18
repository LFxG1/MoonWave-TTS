const {
  corsHeaders,
  fetchVoicesFromAzure,
  safeErrorResponse,
} = require('../api/shared/speech.cjs');

module.exports = async function voices(context, req) {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: cors,
    };
    return;
  }

  try {
    const voices = await fetchVoicesFromAzure();
    context.res = {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: { voices },
    };
  } catch (error) {
    const response = safeErrorResponse(error);
    context.log.warn('Voices request failed', {
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
