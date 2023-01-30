<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { routesNames } from "@/routesNames";
import { Chart } from "chart.js";
import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";
import ChartDataLabels from "chartjs-plugin-datalabels";
import UiButton from "@/components/UiButton.vue";
import UiButtonLink from "@/components/UiButtonLink.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import UIDatePicker from "@/components/UIDatePicker.vue";
import { PeriodText, PeriodSettings } from "@/types/commonTypes";
import IconChevron from "@/components/icons/IconChevron.vue";

export default defineComponent({
  components: {
    Vue3ChartJs,
    UiButton,
    UiButtonLink,
    IconArrowRight,
    UIDatePicker,
    IconChevron,
  },
  props: {
    chartData: {
      type: Object,
      default: () => {},
    },
    periodSettings: {
      type: Object,
    },
  },
  async setup(props, { emit }) {
    const chartRef = ref(null);
    const isDatePickerOpen = ref(false);

    const isDataAvailable = computed(() => {
      return (
        props.chartData.byEmail || props.chartData.byBcc || props.chartData.byQr
      );
    });

    Chart.register(ChartDataLabels);
    const options = computed(() => ({
      layout: {
        padding: 0,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
        datalabels: {
          formatter: (value: number) => {
            if (value > 0) {
              return value;
            } else {
              return "";
            }
          },
          color: ["#1E2B99", "white", "white"],
          font: {
            weight: "bold",
            size: 24,
            family: "NotoSans",
          },
          anchor: (chartData: unknown) => {
            if (chartData.dataset.data.indexOf(100) === -1) {
              return "center";
            } else {
              return "start";
            }
          },
        },
      },
    }));

    watch(props.chartData, () => {
      const data = pieChart.data.datasets[0].data;
      data.length = 0;
      data.push(props.chartData.byEmail);
      data.push(props.chartData.byBcc);
      data.push(props.chartData.byQr);
      chartRef.value?.update();
    });

    const openDatePicker = () => {
      isDatePickerOpen.value = true;
    };

    const getPeriodText = () => {
      if (props.periodSettings?.period) {
        return PeriodText[props.periodSettings?.period];
      } else {
        return PeriodText.custom;
      }
    };

    const applyPeriod = (...args) => {
      isDatePickerOpen.value = false;
      emit("change", "reviews", ...args);
    };

    const pieChart = {
      id: "pie",
      type: "pie",
      data: {
        datasets: [
          {
            data: [
              props.chartData.byEmail,
              props.chartData.byBcc,
              props.chartData.byQr,
            ],
            backgroundColor: ["#D2D5EB", "#a0a8e2", "#1e2b99"],
            borderWidth: 0,
          },
        ],
      },
      options: options.value,
    };

    return {
      routesNames,
      isDataAvailable,
      pieChart,
      chartRef,
      isDatePickerOpen,
      openDatePicker,
      getPeriodText,
      applyPeriod,
    };
  },
});
</script>

<template>
  <div class="app-chart">
    <UIDatePicker
      v-if="isDatePickerOpen"
      :settings="periodSettings"
      @cancel="isDatePickerOpen = false"
      @change="applyPeriod"
    />
    <div class="app-chart__header">
      <h2 class="app-chart__header-title">Received reviews</h2>
      <div class="app-chart__header-control">
        <UiButton
          @click="openDatePicker()"
          :isDisabled="false"
          :class="{ '_is-active': isDatePickerOpen }"
          view="control-small"
        >
          {{ getPeriodText() }}
          <IconChevron class="dropdown" />
        </UiButton>
      </div>
    </div>
    <div class="app-chart__content">
      <div class="app-chart__content-left">
        <Vue3ChartJs
          v-if="isDataAvailable"
          :id="pieChart.id"
          ref="chartRef"
          :type="pieChart.type"
          :data="pieChart.data"
          :options="pieChart.options"
        />
        <div v-else class="_no-data">0%</div>
      </div>
      <div class="app-chart__content-right">
        <div class="legend-item">
          <div class="legend-item__icon"></div>
          <div class="legend-item__text">by CSV</div>
        </div>
        <div class="legend-item">
          <div class="legend-item__icon"></div>
          <div class="legend-item__text">by BCC</div>
        </div>
        <div class="legend-item">
          <div class="legend-item__icon"></div>
          <div class="legend-item__text">by QR code & URL</div>
        </div>
      </div>
    </div>
    <div class="app-chart__action">
      <UiButtonLink
        type="primary"
        class="app-chart__action-button"
        :to="{
          name: routesNames.dashboardGetReviews,
        }"
      >
        <template #icon>
          <IconArrowRight />
        </template>
        Get reviews
      </UiButtonLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";

.app-chart {
  @include shadow-x-large;
  background-color: $color-white;
  border-radius: $rounding-large;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;

  @include responsive-media((xs, md)) {
    margin: 24px 20% 0;
  }

  .ui-date-picker {
    position: absolute;
    transform: translate(-50px, 34px);
    z-index: 2;

    @include responsive-media((xs, md)) {
      left: 50%;
      transform: translate(-50%, 34px);
    }
  }

  &__header {
    display: flex;

    &-title {
      @include typography-main(20px, 700);
      color: $color-blue;
      margin: 0;
    }

    &-control {
      @include typography-main(16px, 600);
      color: $color-blue;
      margin-left: auto;
      display: flex;
      align-items: center;

      .chevron-icon {
        height: 18px;
        transform: scale(1, 1.2);
      }

      ._current-year {
        margin: 0 8px;
      }

      button {
        .dropdown {
          vertical-align: bottom;
        }
      }

      ._is-active {
        background-color: $color-blue-20;
      }
    }
  }

  &__content {
    display: flex;
    position: relative;

    &-left {
      width: 53%;
      margin-right: 18px;

      .chart-curcle-2 {
        position: absolute;
        left: 0;
      }

      ._no-data {
        @include typography-main(24px, 700);
        height: 200px;
        width: 200px;
        border-radius: 100px;
        background-color: $color-blue-06;
        color: $color-blue;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: default;
      }
    }

    &-right {
      .legend-item {
        display: flex;
        margin-bottom: 16px;
        align-items: center;

        &__text {
          @include typography-main(14px);
          color: $color-black;
        }

        &__icon {
          width: 12px;
          height: 12px;
          margin-right: 10px;
          border-radius: 6px;
          flex-shrink: 0;
        }
      }

      .legend-item:nth-child(1) {
        .legend-item__icon {
          background-color: #d2d5eb;
        }
      }

      .legend-item:nth-child(2) {
        .legend-item__icon {
          background-color: #a0a8e2;
        }
      }

      .legend-item:nth-child(3) {
        .legend-item__icon {
          background-color: #1e2b99;
        }
      }
    }
  }

  &__action {
    &-button {
      width: 100%;
    }
  }
}
</style>
