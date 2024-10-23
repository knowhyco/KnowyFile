import React, { useState, useCallback, useEffect } from 'react'
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

const Home: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);

  const uploadFiles = async () => {
    setUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.shareLink) continue // Zaten yüklenmiş dosyaları atla

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Yükleme başarısız')
        }

        const data = await response.json()
        const updatedFile = { ...file, shareLink: data.url }
        setFiles(prevFiles => prevFiles.map((f, index) => 
          index === i ? updatedFile : f
        ))
        setUploadedFiles(prevFiles => [...prevFiles, updatedFile])
        setUploadProgress((i + 1) / files.length * 100)
      } catch (error: any) {
        console.error('Dosya yükleme hatası:', error)
        toast({
          title: "Yükleme Hatası",
          description: `${file.name} dosyası yüklenemedi: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    setUploading(false)
  }

  const handleUpload = async () => {
    await uploadFiles();
  };

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link Kopyalandı",
      description: "Paylaşım linki panoya kopyalandı.",
    })
  }

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('/api/getUploadedFiles')
      if (!response.ok) {
        throw new Error('Dosyalar getirilemedi')
      }
      const data = await response.json()
      setUploadedFiles(data.files)
    } catch (error) {
      console.error('Dosyaları getirme hatası:', error)
      toast({
        title: "Hata",
        description: "Önceden yüklenen dosyalar getirilemedi.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Karanlık Dosya Yükleme Sitesi</h1>
        
        <div {...getRootProps()} className={`border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center cursor-pointer ${isDragActive ? 'bg-gray-800' : 'bg-gray-700'}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4" size={48} />
          {
            isDragActive ?
              <p>Dosyaları buraya bırakın ...</p> :
              <p>Dosyaları buraya sürükleyip bırakın veya dosya seçmek için tıklayın</p>
          }
          <p className="text-sm text-gray-400 mt-2">Maksimum dosya boyutu: 10MB</p>
        </div>

        {files.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Yüklenen Dosyalar</h2>
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
                      Linki Kopyala
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {files.length > 0 && (
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Yükleniyor...' : 'Dosyaları Yükle'}
          </Button>
        )}

        {uploading && (
          <div style={{ marginTop: '1rem' }}>
            <Progress value={uploadProgress} />
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Önceden Yüklenen Dosyalar</h2>
            <ul className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={20} />
                    <span>{file.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(file.shareLink!)}>
                    <Copy className="mr-2" size={16} />
                    Linki Kopyala
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToastProvider>
  );
};

export default Home;
