<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onBeforeUnmount,
  onMounted,
} from "vue";
import UiButton from "@/components/UiButton.vue";
import IconChevronLeft from "@/components/icons/IconChevronLeft.vue";
import IconChevronRight from "@/components/icons/IconChevronRight.vue";
import { PeriodValue, PeriodText } from "@/types/commonTypes";
import { getPeriodStartDate } from "@/helpers/params";

export default defineComponent({
  components: {
    UiButton,
    IconChevronLeft,
    IconChevronRight,
  },
  props: {
    settings: {
      type: Object,
      default: () => ({
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        period: PeriodValue.year,
      }),
    },
  },
  async setup(props, { emit }) {
    // Const
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const msPerDay = 1000 * 60 * 60 * 24;

    // Utils
    const trimDate = (date: Date | undefined) => {
      if (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      } else {
        return undefined;
      }
    };
    const getStartDiff = (index: number) => {
      return Math.floor(
        (+getDateByIndex(index) - +(startDate.value || 0)) / msPerDay
      );
    };
    const getEndDiff = (index: number) => {
      return Math.floor(
        (+getDateByIndex(index) - +(endDate.value || 0)) / msPerDay
      );
    };
    const getDateByIndex = (index: number) => {
      return new Date(
        selectedMonth.value.getFullYear(),
        selectedMonth.value.getMonth(),
        index
      );
    };
    const getSelectedRangeDates = (date: Date) => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstWeekDay = firstDay
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      const weekDayIndex = weekDays.findIndex((x) => x === firstWeekDay);
      const lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate();
      const result = [];
      const baseDiffs = {
        startDiff: getStartDiff(0),
        endDiff: getEndDiff(0),
      };
      for (let i = 1 - weekDayIndex; i <= lastDay; i++) {
        const day = new Date(date.getFullYear(), date.getMonth(), i).getDate();
        result.push({
          day,
          index: i,
          startDiff: baseDiffs.startDiff + i,
          endDiff: baseDiffs.endDiff + i,
          isWeekStart: (i + weekDayIndex) % 7 === 1,
          isWeekEnd: (i + weekDayIndex) % 7 === 0,
          isMonthEnd: i === lastDay,
        });
      }
      return result;
    };

    // State
    const selectedMonth = ref(trimDate(new Date()) || new Date());
    const period = ref(props.settings.period);
    const date1 = ref(trimDate(props.settings.startDate));
    const date2 = ref(trimDate(props.settings.endDate));
    const datePickerRef = ref<HTMLElement | null>(null);

    //Computed
    const selectedMonthName = computed(() =>
      selectedMonth.value.toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    );
    const selectedMonthRange = computed(() =>
      getSelectedRangeDates(selectedMonth.value)
    );
    const startDate = computed(() => {
      if (period.value) {
        return getPeriodStartDate(period.value);
      } else {
        return date1.value;
      }
    });
    const endDate = computed(() => {
      if (period.value) {
        return trimDate(new Date());
      } else if (date2.value) {
        return date2.value;
      } else {
        return date1.value;
      }
    });
    const isSingleDay = computed(() => {
      return startDate.value?.toDateString() === endDate.value?.toDateString();
    });

    // Methods
    const changeMonth = (value: number) => {
      selectedMonth.value = new Date(
        selectedMonth.value.setMonth(selectedMonth.value.getMonth() + value)
      );
    };
    const getClassObj = (day: any) => {
      const classObj: any = {};

      if (isSingleDay.value) {
        if (day.startDiff === 0) {
          classObj.first = true;
        }
      } else if (day.startDiff === 0) {
        classObj.first = true;
      } else if (day.endDiff === 0) {
        classObj.last = true;
      } else if (day.startDiff === 1) {
        classObj.second = true;
        classObj.middle = true;
        classObj.penultimate = day.endDiff === -1;
      } else if (day.endDiff === -1) {
        classObj.penultimate = true;
        classObj.middle = true;
      } else if (day.startDiff > 1 && day.endDiff < -1) {
        classObj.middle = true;
      }

      if (day.isWeekStart) {
        classObj.sunday = true;
      } else if (day.isWeekEnd) {
        classObj.saturday = true;
      }
      if (day.isMonthEnd) {
        classObj["end-of-month"] = true;
      }
      if (day.index <= 0) {
        classObj.grey = true;
      }
      return classObj;
    };
    const selectDate = (index: number) => {
      period.value = undefined;
      const date = getDateByIndex(index);
      if ((date1.value && date2.value) || !date1.value) {
        date1.value = date;
        date2.value = undefined;
      } else if (date1.value && !date2.value) {
        if (date1.value < date) {
          date2.value = date;
        } else {
          date2.value = date1.value;
          date1.value = date;
        }
      }
    };
    const selectPeriod = (key: string) => {
      date1.value = undefined;
      date2.value = undefined;
      period.value = key;
    };
    const applyChanges = () => {
      emit("change", date1.value, date2.value || date1.value, period.value);
    };
    const cancel = () => {
      emit("cancel");
    };
    const getPeriodText = (p: PeriodValue) => {
      return PeriodText[p];
    };
    const onClickHandler = (ev: MouseEvent) => {
      const path = ev.composedPath();
      if (path.findIndex((x) => x === datePickerRef.value) === -1) {
        cancel();
      }
    };

    onMounted(() => {
      setTimeout(() => {
        document.addEventListener("click", onClickHandler);
      }, 200);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", onClickHandler);
    });

    return {
      weekDays,
      changeMonth,
      selectedMonthName,
      selectedMonthRange,
      getClassObj,
      periods: PeriodValue,
      period,
      selectDate,
      selectPeriod,
      applyChanges,
      cancel,
      getPeriodText,
      datePickerRef,
    };
  },
});
</script>

<template>
  <div class="ui-date-picker" ref="datePickerRef">
    <div class="ui-date-picker__content">
      <div class="calendar">
        <UiButton
          @click="changeMonth(-1)"
          :isDisabled="false"
          view="control-secondary-dashboard"
        >
          <template #icon>
            <IconChevronLeft class="chevron-icon" />
          </template>
        </UiButton>
        <span class="calendar__month">{{ selectedMonthName }}</span>
        <UiButton
          @click="changeMonth(1)"
          :isDisabled="false"
          view="control-secondary-dashboard"
        >
          <template #icon>
            <IconChevronRight class="chevron-icon" />
          </template>
        </UiButton>
        <div class="calendar__weekdays">
          <div v-for="day of weekDays" :key="day">{{ day }}</div>
        </div>
        <div class="calendar__days">
          <div
            v-for="d of selectedMonthRange"
            :key="d"
            :class="getClassObj(d)"
            @click="selectDate(d.index)"
          >
            {{ d.day }}
          </div>
        </div>
      </div>
      <div class="range-controls">
        <UiButton
          v-for="p of periods"
          :key="p"
          @click="selectPeriod(p)"
          :isDisabled="false"
          :class="{ '_is-active': period === p }"
          view="control-small"
        >
          {{ getPeriodText(p) }}
        </UiButton>
      </div>
    </div>
    <div class="ui-date-picker__controls">
      <UiButton @click="cancel()" :isDisabled="false" view="control-secondary">
        Cancel
      </UiButton>
      <UiButton
        @click="applyChanges()"
        :isDisabled="false"
        view="control-secondary"
        class="apply"
      >
        Apply
      </UiButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";

.ui-date-picker {
  @include shadow-medium;
  display: inline-block;
  background-color: $color-white;
  border-radius: $rounding-medium;
  padding: 24px;
  box-sizing: border-box;
  min-width: fit-content;

  &__content {
    display: inline-flex;

    .calendar {
      display: inline-grid;
      grid-template-columns: repeat(7, minmax(0, 32px));
      grid-template-rows: repeat(8, minmax(0, 32px));
      align-items: center;
      grid-column-gap: 4px;
      grid-row-gap: 4px;

      &__month {
        @include typography-main(16px, 600);
        color: $color-black;
        grid-column: auto / span 5;
        text-align: center;
        align-self: end;
      }

      .chevron-icon {
        height: 18px;
        transform: scale(1, 1.2);
      }

      &__weekdays {
        @include typography-main(10px, 500);
        color: $color-black;
        display: contents;
        text-align: center;
      }

      &__days {
        display: contents;
        @include typography-main(14px, 500);
        color: $color-black;

        .middle {
          background-color: $color-blue-06;
          box-shadow: 2px 0 $color-blue-06, -2px 0 $color-blue-06;
          border: 2px solid transparent;
          color: $color-blue;
        }

        .penultimate {
          box-shadow: 18px 0 $color-blue-06, -2px 0 $color-blue-06;
        }

        .second {
          box-shadow: 2px 0 $color-blue-06, -18px 0 $color-blue-06;
        }

        .penultimate.second {
          box-shadow: 18px 0 $color-blue-06, -18px 0 $color-blue-06;
        }

        .sunday {
          border-radius: 100% 0 0 100%;
        }

        .saturday,
        .end-of-month {
          border-radius: 0 100% 100% 0;
        }

        .sunday.end-of-month {
          border-radius: 100%;
        }

        .last,
        .first {
          box-shadow: -2px 0 $color-blue-06;
          background-color: $color-blue-20;
          border: 2px solid $color-blue-60;
          border-radius: 100%;
          z-index: 0;
          color: $color-blue;
        }

        .grey {
          color: $color-black-40;
        }

        div {
          text-align: center;
          line-height: 28px;
          cursor: pointer;
        }
      }
    }

    .range-controls {
      display: flex;
      flex-flow: column;
      margin-left: 12px;

      button {
        margin-bottom: 12px;

        &._is-active {
          color: $color-white;
          background-color: $color-blue;
        }
      }
    }
  }
  &__controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 12px;
    margin-top: 12px;

    .apply {
      color: $color-white;
      background-color: $color-blue;
    }
  }
}
</style>
