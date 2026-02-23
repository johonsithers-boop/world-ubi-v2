import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBalance(balance: string | number, decimals: number = 2): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance
  if (isNaN(num)) return "0.00"
  return num.toFixed(decimals)
}
