import format from "date-fns/format";

export function formatDate(date: Date, { withTime = false } = {}): string {
  if (withTime) {
    return format(date, "d LLL, y HH:mm");
  }
  return format(date, "d LLL, y");
}
