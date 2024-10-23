import { useState, useCallback } from 'react'

interface ToastOptions {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

interface ToastState extends ToastOptions {
  id: number
}

let id = 0

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const toastWithId = { ...options, id: id++ }
    setToasts((currentToasts) => [...currentToasts, toastWithId])

    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== toastWithId.id)
      )
    }, 3000)
  }, [])

  return { toast, toasts }
}

export const toast = (options: ToastOptions) => {
  console.log(options)
  // Bu fonksiyon gerçek bir uygulamada useToast hook'unu kullanmalıdır.
}
