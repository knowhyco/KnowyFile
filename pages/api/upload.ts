import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from 'crypto'
import formidable from 'formidable'
import fs from 'fs/promises'

export const config = {
  api: {
    bodyParser: false,
  },
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const tempDir = '/home/ubuntu/KnowhyFile/TEMP'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable({
    uploadDir: tempDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  })

  try {
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const fileArray = files.file as formidable.File[] | undefined
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = fileArray[0]
    const fileBuffer = await fs.readFile(file.filepath)
    const fileKey = `uploads/${crypto.randomUUID()}-${file.originalFilename}`

    const putObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.mimetype!,
    }

    await s3Client.send(new PutObjectCommand(putObjectParams))

    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    }

    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), {
      expiresIn: 3600, // 1 saat
    })

    // Geçici dosyayı temizle
    await fs.unlink(file.filepath)

    res.status(200).json({ url: signedUrl })
  } catch (error: any) {
    console.error('File upload error:', error)
    res.status(500).json({ error: 'File upload failed', details: error.message })
  }
}
