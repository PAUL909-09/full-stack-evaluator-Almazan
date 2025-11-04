import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle } from "lucide-react" // Added: Import icons for success and error

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Determine the icon based on variant
        const Icon = variant === "success" ? CheckCircle : variant === "destructive" ? AlertCircle : null;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3"> {/* Added: Flex layout for icon and text */}
              {Icon && <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />} {/* Added: Render icon if present */}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}