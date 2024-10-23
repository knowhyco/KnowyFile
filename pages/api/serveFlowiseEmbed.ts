import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import NextCors from 'nextjs-cors';

let cachedFileContent: string | null = null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS yapılandırmasını çalıştır
  await NextCors(req, res, {
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  try {
    if (!cachedFileContent) {
      const filePath = path.join(process.cwd(), 'public', 'flowise-embed-web.js')
      cachedFileContent = await fs.promises.readFile(filePath, 'utf8')
    }

    res.setHeader('Content-Type', 'application/javascript')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.status(200).send(cachedFileContent)
  } catch (error) {
    console.error('Error serving file:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
