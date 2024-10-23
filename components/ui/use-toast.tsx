import { useState, useCallback } from 'react'

interface ToastOptions {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([])

  const toast = useCallback((options: ToastOptions) => {
    setToasts((prevToasts) => [...prevToasts, options])
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1))
    }, 3000)
  }, [])

  return { toast, toasts }
}

// Burayı ekleyin
export const toast = (options: ToastOptions) => {
  const { toast } = useToast()
  toast(options)
}