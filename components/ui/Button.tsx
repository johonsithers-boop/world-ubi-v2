import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    isLoading?: boolean
    fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', isLoading, fullWidth, children, disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]",
            outline: "border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900",
            ghost: "hover:bg-gray-100 text-gray-900",
            destructive: "bg-red-500 text-white hover:bg-red-600"
        }

        const sizes = {
            default: "h-12 px-6 py-3 text-base",
            sm: "h-9 px-4 text-sm",
            lg: "h-14 px-8 text-lg",
            icon: "h-10 w-10"
        }

        return (
            <button
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                aria-busy={isLoading}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </div>
                ) : (
                    children
                )}
            </button>
        )
    }
)

Button.displayName = "Button"

export { Button }
