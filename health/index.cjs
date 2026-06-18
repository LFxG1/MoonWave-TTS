const {
  corsHeaders,
  getSpeechHealth,
} = require('../api/shared/speech.cjs');

module.exports = async function health(context, req) {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: cors,
    };
    return;
  }

  context.res = {
    status: 200,
    headers: {
      ...cors,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: getSpeechHealth(),
  };
};
