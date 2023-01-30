const endingCharsCount = 6;

export function formatPhone(code: string, value: string): string {
  if (value.length <= endingCharsCount) {
    return `${code} ${value}`;
  }
  const startValue = value.slice(0, value.length - endingCharsCount);
  const endValue = value.slice(-endingCharsCount);
  return `${code} ${startValue} ${endValue}`;
}
