// src/components/ui/badge-variants.js
import { cva } from "class-variance-authority";

/**
 * Badge variants
 */
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        approved: "border-transparent bg-emerald-600 text-white",
        revision: "border-transparent bg-orange-500 text-white",
        submitted: "border-transparent bg-blue-600 text-white",
        todo: "border-transparent bg-gray-500 text-white",
        inProgress: "border-transparent bg-yellow-500 text-white",
        done: "border-transparent bg-green-600 text-white",
        rejected: "border-transparent bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);