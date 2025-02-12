"use client";

import Image from "next/image";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  width?: number;
  height?: number;
  htmlImg?: boolean; // Use regular <img> tag instead of next/image
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback = "?",
  width = 40,
  height = 40,
  className,
  htmlImg = false,
  ...props
}) => {
  const [isError, setIsError] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {src && !isError ? (
        htmlImg ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
            onError={(error) => {
              console.error("Image loading error:", error);
              setIsError(true);
            }}
          />
        ) : (
          <Image
            src={src}
            alt={alt || ""}
            width={width}
            height={height}
            className="aspect-square h-full w-full object-cover"
            onError={(error) => {
              console.error("Image loading error:", error);
              setIsError(true);
            }}
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-gray-700">
          {fallback}
        </div>
      )}
    </div>
  );
};

export { Avatar };
