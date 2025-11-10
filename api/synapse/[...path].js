export default async function handler(req, res) {
  // Get the path segments after /api/synapse/
  const path = req.query.path ? req.query.path.join('/') : '';

  // Construct the target URL with query parameters
  const queryString = new URLSearchParams(req.query);
  // Remove the path parameter as it's not part of the original query
  queryString.delete('path');
  const queryStr = queryString.toString();
  const targetUrl = `https://admin-launcher-api-synapse-dev.dolong-4e5.workers.dev/${path}${queryStr ? '?' + queryStr : ''}`;

  try {
    // Forward the request with the API key
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'x-api-key': 'TZ3eYpuOwDfm6CEyLJyLmN0y',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Return the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
}
