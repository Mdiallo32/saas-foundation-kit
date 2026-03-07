/**
 * Date parsing utilities for consistent date handling across the application.
 * Supports both string (ISO 8601) and Date objects for backward compatibility.
 */

/**
 * Parse a date string or Date object to a Date instance.
 * @param value - ISO 8601 date string or Date object
 * @returns Date object or null if value is falsy
 */
export const parseDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  // Validate that the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${value}`);
    return null;
  }

  return date;
};

/**
 * Ensure a value is a Date object.
 * Useful for type safety when you know a value should be a Date.
 * @param value - Date or ISO 8601 string
 * @returns Date object
 * @throws Error if value is falsy
 */
export const ensureDate = (value: string | Date | null | undefined): Date => {
  const date = parseDate(value);
  if (!date) {
    throw new Error(`Cannot parse date from: ${value}`);
  }
  return date;
};

/**
 * Convert a Date object to ISO 8601 string (YYYY-MM-DD format).
 * Useful for storing dates in a consistent format.
 * @param date - Date object
 * @returns ISO 8601 date string (date part only)
 */
export const dateToISOString = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return d.toISOString().split("T")[0];
};

/**
 * Get the number of days between two dates.
 * @param startDate - Start date
 * @param endDate - End date (defaults to today)
 * @returns Number of days (can be negative if endDate is before startDate)
 */
export const daysBetween = (
  startDate: Date | string,
  endDate: Date | string = new Date()
): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    return 0;
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is in the past.
 * @param date - Date to check
 * @returns true if date is in the past
 */
export const isInPast = (date: Date | string | null | undefined): boolean => {
  const d = parseDate(date);
  if (!d) return false;
  return d < new Date();
};

/**
 * Check if a date is in the future.
 * @param date - Date to check
 * @returns true if date is in the future
 */
export const isInFuture = (date: Date | string | null | undefined): boolean => {
  const d = parseDate(date);
  if (!d) return false;
  return d > new Date();
};

/**
 * Check if a date is today.
 * @param date - Date to check
 * @returns true if date is today
 */
export const isToday = (date: Date | string | null | undefined): boolean => {
  const d = parseDate(date);
  if (!d) return false;

  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};
