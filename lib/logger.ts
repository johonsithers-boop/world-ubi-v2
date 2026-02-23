/**
 * Structured logger for World UBI Coin
 * - Development: logs to console with timestamps
 * - Production: logs errors (integrate with Sentry/Datadog here)
 */

type LogData = Record<string, unknown> | unknown

const isDev = process.env.NODE_ENV !== 'production'

function format(level: string, message: string): string {
    return `[${new Date().toISOString()}] [${level}] ${message}`
}

export const logger = {
    debug(message: string, data?: LogData) {
        if (isDev) {
            console.debug(format('DEBUG', message), data !== undefined ? data : '')
        }
    },

    info(message: string, data?: LogData) {
        if (isDev) {
            console.info(format('INFO', message), data !== undefined ? data : '')
        }
    },

    warn(message: string, data?: LogData) {
        console.warn(format('WARN', message), data !== undefined ? data : '')
    },

    error(message: string, data?: LogData) {
        console.error(format('ERROR', message), data !== undefined ? data : '')

        // Production: forward to error monitoring service
        // if (!isDev && typeof window !== 'undefined') {
        //     Sentry.captureException(data instanceof Error ? data : new Error(message))
        // }
    },
}
