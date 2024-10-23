import React from 'react'
import { useToast } from './use-toast'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts } = useToast()

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md ${
              toast.variant === 'destructive' ? 'bg-red-500' : 'bg-gray-800'
            } text-white`}
          >
            <h3 className="font-bold">{toast.title}</h3>
            <p>{toast.description}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export const toast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
  console.log(options)
  // Bu fonksiyon gerçek bir uygulamada useToast hook'unu kullanmalıdır.
}
