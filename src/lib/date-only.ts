/**
 * Convert between a calendar-only `YYYY-MM-DD` value and a local `Date`.
 *
 * Date-only form values are not instants in time. Using `toISOString()` here
 * converts local midnight to UTC and can shift the calendar day (for example,
 * Sep 19 in Istanbul becomes Sep 18 UTC). These helpers deliberately use local
 * date parts so the day the user picked is the day the form stores.
 */
export function formatLocalDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`Invalid date-only value: ${value}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new RangeError(`Invalid date-only value: ${value}`);
  }

  return date;
}
