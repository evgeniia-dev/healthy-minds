import { describe, it, expect } from "vitest";
import { getDay, startOfMonth } from "date-fns";

/**
 * The MoodCalendar renders Monday as the first column of the week grid.
 * The leading empty-cell count must account for that so days land in the right column.
 *
 * Formula: (getDay(firstDayOfMonth) + 6) % 7
 *   Mon (1) → 0 empty cells
 *   Tue (2) → 1 empty cell
 *   ...
 *   Sun (0) → 6 empty cells
 */
function mondayFirstOffset(date: Date): number {
  return (getDay(startOfMonth(date)) + 6) % 7;
}

describe("MoodCalendar Monday-first start-day offset", () => {
  it("returns 0 empty cells when month starts on Monday", () => {
    // 2024-01-01 is a Monday
    expect(mondayFirstOffset(new Date(2024, 0, 1))).toBe(0);
  });

  it("returns 1 empty cell when month starts on Tuesday", () => {
    // 2025-04-01 is a Tuesday
    expect(mondayFirstOffset(new Date(2025, 3, 1))).toBe(1);
  });

  it("returns 5 empty cells when month starts on Saturday", () => {
    // 2025-02-01 is a Saturday
    expect(mondayFirstOffset(new Date(2025, 1, 1))).toBe(5);
  });

  it("returns 6 empty cells when month starts on Sunday", () => {
    // 2025-06-01 is a Sunday
    expect(mondayFirstOffset(new Date(2025, 5, 1))).toBe(6);
  });
});
