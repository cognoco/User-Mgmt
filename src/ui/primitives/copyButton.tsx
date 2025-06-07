"use client";

import React, { useState } from 'react';
import { Button } from "@/ui/primitives/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/primitives/tooltip";

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  tooltipMessage?: string;
  variant?: "ghost" | "default" | "link" | "outline" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const CopyButton = ({
  value,
  className,
  variant = "ghost",
  size = "icon",
  tooltipMessage = "Copy to clipboard",
  ...props
}: CopyButtonProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant={variant}
            className={cn(
              "relative",
              className
            )}
            onClick={copyToClipboard}
            {...props}
          >
            {hasCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">
              {hasCopied ? "Copied" : tooltipMessage}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasCopied ? "Copied!" : tooltipMessage}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 