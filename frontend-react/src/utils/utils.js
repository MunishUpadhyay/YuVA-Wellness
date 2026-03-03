import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Usage: cn("bg-red-500", condition && "text-white")
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
