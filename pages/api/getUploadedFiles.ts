import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const listParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: 'uploads/',
    }

    const listCommand = new ListObjectsV2Command(listParams)
    const listResponse = await s3Client.send(listCommand)

    const files = await Promise.all((listResponse.Contents || []).map(async (object) => {
      const getObjectParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: object.Key!,
      }

      const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), {
        expiresIn: 3600, // 1 saat
      })

      return {
        name: object.Key!.split('-').slice(1).join('-'), // UUID'yi kaldır
        shareLink: signedUrl,
      }
    }))

    res.status(200).json({ files })
  } catch (error: any) {
    console.error('Dosya listesi alma hatası:', error)
    res.status(500).json({ error: 'Dosya listesi alınamadı', details: error.message })
  }
}
