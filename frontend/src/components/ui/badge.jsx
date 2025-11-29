// src/components/ui/badge.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Import variants from separate file ── */
import { badgeVariants } from "@/components/ui/badge-variants";

/* ── Badge component ONLY ── */
function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

Badge.displayName = "Badge";

export default Badge;