import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Render a character's name with their alias as a nickname inserted after the
// first name, e.g. ("Hadrel Abren", "Twinkle") -> `Hadrel "Twinkle" Abren`.
// Falls back to appending it when the name is a single word.
export function displayName(name: string, alias: string | null | undefined): string {
  if (!alias) return name
  const i = name.indexOf(' ')
  if (i === -1) return `${name} "${alias}"`
  return `${name.slice(0, i)} "${alias}"${name.slice(i)}`
}
