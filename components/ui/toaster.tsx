// app/components/Toaster.tsx
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, className, ...props }) => (
        <Toast
          key={id}
          {...props}
          className={cn(
            "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 pr-6 shadow-xl backdrop-blur",
            props.variant === "destructive" && "bg-red-50 border-red-200 text-red-800",
            className
          )}
        >
          <div className="grid gap-1">
            {title && (
              <ToastTitle className="text-sm font-semibold tracking-tight">
                {title}
              </ToastTitle>
            )}
            {description && (
              <ToastDescription className="text-xs leading-5 text-gray-600">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="absolute right-2 top-2 opacity-60 hover:opacity-100" />
        </Toast>
      ))}

      <ToastViewport className="fixed top-6 right-6 z-[100] flex max-h-screen w-96 flex-col gap-3 outline-none" />
    </ToastProvider>
  )
}
