import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  Ref,
} from "vue";
import { InjectionKey } from "vue";

const intervals = {
  xs: [0, 544],
  sm: [545, 768],
  md: [769, 1039],
  lg: [1040, 1263],
  xl: [1264, Infinity],
} as const;

type IntervalName = keyof typeof intervals;

interface ReturnValue {
  currentInterval: Ref<IntervalName>;
  isMobile: Ref<boolean>;
}

const ResponsiveKey: InjectionKey<ReturnValue> = Symbol("Responsive");

function getResponsive(): ReturnValue {
  const currentInterval = ref<IntervalName>("xl");

  const isMobile = computed(() => {
    return ["xs", "sm"].includes(currentInterval.value || "");
  });

  const handleResize = () => {
    const width = window.innerWidth;
    const keys = Object.keys(intervals) as IntervalName[];

    currentInterval.value = keys.find((intervalName) => {
      const boundaries = intervals[intervalName];
      return width > boundaries[0] && width <= boundaries[1];
    }) as IntervalName;
  };

  onMounted(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
  });

  return { currentInterval, isMobile };
}

function provideResponsive(): void {
  return provide(ResponsiveKey, getResponsive());
}

function useResponsive(): ReturnValue {
  return inject(ResponsiveKey) as ReturnValue;
}

export { ResponsiveKey, provideResponsive, useResponsive };
