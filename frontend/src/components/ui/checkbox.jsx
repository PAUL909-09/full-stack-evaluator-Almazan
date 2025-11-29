// src/components/ui/checkbox.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  CHECKBOX WRAPPER (label + input)
/* ------------------------------------------------------------------ */
const Checkbox = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border-2 border-primary text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...rest}
      />
      <span className="text-sm font-medium peer-disabled:opacity-50">
        {props.children}
      </span>
    </label>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };