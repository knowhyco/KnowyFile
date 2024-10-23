'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from "/home/ubuntu/KnowhyFile/components/ui/button"
import { Progress } from "/home/ubuntu/KnowhyFile/components/ui/progress"
import { toast } from "/home/ubuntu/KnowhyFile/components/ui/use-toast"
import { ToastProvider } from "/home/ubuntu/KnowhyFile/components/ui/toast"

interface FileWithPreview extends File {
  preview: string;
  shareLink: string | null;
}

export default function FileUploadSite() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        shareLink: null
      }))
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  })

  const uploadFiles = async () => {
    setUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.shareLink) continue // Skip already uploaded files

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('Upload failed')

        const data = await response.json()
        setFiles(prevFiles => prevFiles.map((f, index) => 
          index === i ? { ...f, shareLink: data.url } : f
        ))

        setUploadProgress((i + 1) / files.length * 100)
      } catch (error) {
        console.error('Error uploading file:', error)
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
      }
    }

    setUploading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link Copied",
      description: "The sharing link has been copied to your clipboard.",
    })
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Dark File Upload Site</h1>
        
        <div {...getRootProps()} className={`border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center cursor-pointer ${isDragActive ? 'bg-gray-800' : 'bg-gray-700'}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4" size={48} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag 'n' drop some files here, or click to select files</p>
          }
          <p className="text-sm text-gray-400 mt-2">Max file size: 10MB</p>
        </div>

        {files.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
            <ul className="space-y-4">
              {files.map((file, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    {file.shareLink ? (
                      <CheckCircle className="text-green-500 mr-2" size={20} />
                    ) : (
                      <AlertCircle className="text-yellow-500 mr-2" size={20} />
                    )}
                    <span>{file.name}</span>
                  </div>
                  {file.shareLink && (
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(file.shareLink!)}>
                      <Copy className="mr-2" size={16} />
                      Copy Link
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {files.length > 0 && (
          <Button onClick={uploadFiles} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        )}

        {uploading && (
          <div style={{ marginTop: '1rem' }}>
            <Progress value={uploadProgress} />
          </div>
        )}
      </div>
    </ToastProvider>
  )
}
