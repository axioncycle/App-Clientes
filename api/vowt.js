// Vercel Serverless Function — proxy para API Vowt
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Store,Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, method = 'GET', headers = {}, body } = req.body;

    if (!url || !url.startsWith('https://api.vowtecommerce.com.br/')) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const fetchOpts = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOpts);
    const data = await response.json().catch(() => ({ error: 'Resposta inválida' }));

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
