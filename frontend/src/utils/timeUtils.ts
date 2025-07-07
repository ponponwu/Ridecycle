import { TFunction } from 'i18next'

/**
 * Parses an English time string (e.g., "2 days remaining") and returns a localized string.
 * @param timeString The string from the backend.
 * @param t The i18next TFunction.
 * @returns A localized and formatted time string.
 */
export const formatRemainingTime = (timeString: string | null | undefined, t: TFunction): string => {
    if (!timeString) {
        return ''
    }

    // Regex to capture the number and the unit (day, hour, minute, second)
    const match = timeString.match(/(\d+)\s*(day|hour|minute|second)s?/i)

    if (match) {
        const count = parseInt(match[1], 10)
        const unit = match[2].toLowerCase()

        // Use i18next for pluralization and translation
        // Assumes keys like 'timeUnits.day', 'timeUnits.day_plural' exist in locales
        return t(`timeUnits.${unit}`, { count })
    }

    // Fallback if the string format is unexpected
    return timeString.replace(/remaining/i, '').trim()
}
