import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';

  // Construct the target URL
  const targetUrl = `https://admin-launcher-api-synapse-dev.dolong-4e5.workers.dev/${pathString}${req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'TZ3eYpuOwDfm6CEyLJyLmN0y',
        ...(req.body ? {} : {}),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to proxy request', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
