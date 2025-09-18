// frontend_design/src/pages/api/auth/demo.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API base URL from environment
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Forward the request to the backend
    const response = await fetch(`${apiBaseUrl}/api/auth/demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers
        ...(req.headers.cookie && { 'Cookie': req.headers.cookie }),
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Forward any cookies from the backend
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Demo API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
