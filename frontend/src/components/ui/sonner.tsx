"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors
      expand={true}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-sm",
          success:
            "group-[.toast]:border-green-200 group-[.toast]:bg-green-50 group-[.toast]:text-green-900 dark:group-[.toast]:border-green-800 dark:group-[.toast]:bg-green-950 dark:group-[.toast]:text-green-100",
          error:
            "group-[.toast]:border-red-200 group-[.toast]:bg-red-50 group-[.toast]:text-red-900 dark:group-[.toast]:border-red-800 dark:group-[.toast]:bg-red-950 dark:group-[.toast]:text-red-100",
          warning:
            "group-[.toast]:border-yellow-200 group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900 dark:group-[.toast]:border-yellow-800 dark:group-[.toast]:bg-yellow-950 dark:group-[.toast]:text-yellow-100",
          info:
            "group-[.toast]:border-blue-200 group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 dark:group-[.toast]:border-blue-800 dark:group-[.toast]:bg-blue-950 dark:group-[.toast]:text-blue-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
