import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ authenticated: false, error: 'Método não permitido. Use POST.' });
  }

  try {
    const expectedPassword = 'GEAPIFE-CONTROLE';
    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ authenticated: false, error: 'Senha não fornecida.' });
    }

    if (password.trim() === expectedPassword) {
      return res.status(200).json({ authenticated: true });
    } else {
      return res.status(401).json({ authenticated: false, error: 'Senha incorreta.' });
    }
  } catch (err) {
    return res.status(500).json({ authenticated: false, error: 'Erro interno na validação de acesso.' });
  }
}
