'use client'

import { Component, ReactNode } from 'react'
import { Button } from './ui/Button'
import { PiWarningCircle, PiArrowClockwise } from 'react-icons/pi'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
        // Error is already captured via getDerivedStateFromError.
        // In production, forward to a monitoring service (e.g. Sentry)
        // by integrating here.
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[200px] flex items-center justify-center p-6">
                    <div className="text-center max-w-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <PiWarningCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <Button
                            onClick={this.handleReset}
                            variant="outline"
                            size="sm"
                        >
                            <PiArrowClockwise className="h-4 w-4 mr-2" />
                            Try again
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
