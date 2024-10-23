import { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from 'crypto'

// Start of Selection
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})
  
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const fileBuffer = await file.arrayBuffer()
  const fileKey = `uploads/${crypto.randomUUID()}-${file.name}`

  const putObjectParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
  }

  try {
    await s3Client.send(new PutObjectCommand(putObjectParams))

    // Generate a signed URL for the uploaded file
    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    }
    const signedUrl = await getSignedUrl(s3Client, new PutObjectCommand(getObjectParams), { expiresIn: 3600 })

    return new Response(JSON.stringify({ url: signedUrl }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error uploading to S3:', error)
    return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}