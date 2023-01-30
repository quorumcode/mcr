interface Options {
  timeout: number;
  debounce: boolean;
}

export function throttle(
  callback: (...args: any) => void,
  { timeout, debounce = false }: Options
) {
  let timer: any;
  let throttledCount = 0;

  return function throttleCallback(...args: any) {
    if (!debounce && throttledCount === 0) {
      callback(...args);
    }
    clearTimeout(timer);
    throttledCount++;
    timer = setTimeout(() => {
      callback(...args);
      throttledCount = 0;
    }, timeout);
  };
}
