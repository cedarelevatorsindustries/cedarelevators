

/**
 * Logging Service for Cedar Elevators
 * 
 * This service provides structured logging with different levels.
 * In production, these logs can be directed to external services
 * like Logtail, Datadog, or Sentry.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogPayload {
    message: string
    context?: Record<string, any>
    error?: Error | any
}

const isProduction = process.env.NODE_ENV === 'production'

function formatLog(level: LogLevel, { message, context, error }: LogPayload): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    const errorStr = error ? ` | Error: ${error.message || error}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`
}

/**
 * Debug level logging - only in development
 */
export function logDebug(message: string, context?: Record<string, any>): void {
    if (!isProduction) {
        console.log(formatLog('debug', { message, context }))
    }
}

/**
 * Info level logging
 */
export function logInfo(message: string, context?: Record<string, any>): void {
    if (!isProduction) {
        console.log(formatLog('info', { message, context }))
    }
    // In production, send to logging service
    // await sendToLoggingService('info', message, context)
}

/**
 * Warning level logging
 */
export function logWarn(message: string, context?: Record<string, any>): void {
    console.warn(formatLog('warn', { message, context }))
    // In production, send to logging service
    // await sendToLoggingService('warn', message, context)
}

/**
 * Error level logging - always logs
 */
export function logError(message: string, error?: Error | any, context?: Record<string, any>): void {
    console.error(formatLog('error', { message, context, error }))
    // In production, send to error tracking service (Sentry, etc.)
    // await sendToErrorTracking(message, error, context)
}

/**
 * Log API/Action requests for debugging
 */
export function logRequest(action: string, params?: Record<string, any>): void {
    if (!isProduction) {
        console.log(formatLog('info', {
            message: `Action: ${action}`,
            context: params
        }))
    }
}

/**
 * Log API/Action responses for debugging
 */
export function logResponse(action: string, result: { success: boolean; error?: string }): void {
    if (!isProduction) {
        const level = result.success ? 'info' : 'warn'
        console.log(formatLog(level, {
            message: `Response: ${action}`,
            context: { success: result.success, error: result.error }
        }))
    }
}
// Export a unified logger object
export const logger = {
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    request: logRequest,
    response: logResponse
}

