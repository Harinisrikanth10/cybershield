import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
}

export function getRiskBadgeClasses(category: string): { bg: string; text: string; border: string } {
  switch (category.toLowerCase()) {
    case "critical":
      return {
        bg: "bg-red-500/15",
        text: "text-red-400",
        border: "border-red-500/40",
      };
    case "high":
      return {
        bg: "bg-orange-500/15",
        text: "text-orange-400",
        border: "border-orange-500/40",
      };
    case "moderate":
    case "medium":
      return {
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        border: "border-amber-500/40",
      };
    case "low":
    default:
      return {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/40",
      };
  }
}
