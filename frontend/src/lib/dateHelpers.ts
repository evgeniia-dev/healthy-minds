import { getDay, startOfMonth } from "date-fns";

/**
 * Returns the number of empty leading cells needed to align the first day
 * of a month to the correct column in a Monday-first weekly grid.
 *
 * `getDay` returns 0 for Sunday, so we shift by +6 mod 7:
 *   Mon (1) → 0,  Tue (2) → 1,  …,  Sun (0) → 6
 */
export function mondayFirstOffset(date: Date): number {
  return (getDay(startOfMonth(date)) + 6) % 7;
}
