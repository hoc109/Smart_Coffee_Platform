import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500 focus:ring-red-500" : "border-slate-700 hover:border-slate-600",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 font-medium ml-1 animate-in fade-in">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
