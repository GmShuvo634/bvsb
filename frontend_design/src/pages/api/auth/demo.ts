// src/pages/api/auth/demo.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Forward the request to the backend
    const backendUrl = `${BACKEND_URL}/api/auth/demo`;
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for session management
        ...(req.headers.cookie && { 'Cookie': req.headers.cookie }),
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Forward response headers (especially cookies)
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
