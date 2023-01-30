<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { routesNames } from "@/routesNames";
import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";
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
    companyId: {
      type: String,
      default: undefined as string | undefined,
    },
    periodSettings: {
      type: Object,
    },
  },
  async setup(props, { emit }) {
    const chartRef = ref(null);
    const isDatePickerOpen = ref(false);

    const options = computed(() => ({
      responsive: true,
      cutout: 60,
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
          formatter: () => "",
        },
      },
    }));

    watch(props.chartData, () => {
      const data = doughnutChart.data.datasets[0].data;
      data.length = 0;
      data.push(props.chartData.widget);
      data.push(props.chartData.site);
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
      emit("change", "visits", ...args);
    };

    const doughnutChart = {
      id: "doughnut",
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [props.chartData.widget, props.chartData.site],
            backgroundColor: ["#a0a8e2", "#1e2b99"],
            borderWidth: 0,
          },
        ],
      },
      options: options.value,
    };

    return {
      routesNames,
      doughnutChart,
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
      <h2 class="app-chart__header-title">Company Page Visits</h2>
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
          v-if="chartData.total"
          :id="doughnutChart.id"
          ref="chartRef"
          :type="doughnutChart.type"
          :data="doughnutChart.data"
          :options="doughnutChart.options"
        />
        <div v-else class="_no-data">
          <div class="_no-data-curcle" />
        </div>
      </div>
      <div class="app-chart__content-right">
        <div class="_visits-sum">
          {{ chartData.site }}
        </div>
        <div class="_visit-text">from search</div>
        <div class="_visitors-sum">
          {{ chartData.widget }}
        </div>
        <div class="_visitors-text">from widget</div>
      </div>
    </div>
    <div class="app-chart__action">
      <UiButtonLink
        type="primary"
        class="app-chart__action-button"
        :to="{
          name: routesNames.companyProfile,
          params: { id: companyId },
        }"
      >
        <template #icon>
          <IconArrowRight />
        </template>
        Visit company page
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
  margin-right: 24px;

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
      width: 65%;
      margin-right: 18px;

      ._no-data {
        height: 200px;
        width: 200px;
        border-radius: 100px;
        background-color: $color-blue-06;
        display: flex;
        justify-content: center;
        align-items: center;

        &-curcle {
          height: 118px;
          width: 118px;
          border-radius: 59px;
          background-color: $color-white;
        }
      }
    }

    &-right {
      ._visits-sum {
        @include typography-main(24px, 700);
        color: $color-blue;
      }

      ._visit-text {
        @include typography-main(14px);
        color: $color-black;
      }

      ._visitors-sum {
        @include typography-main(24px, 700);
        color: #8a91ca;
        margin-top: 16px;
      }

      ._visitors-text {
        @include typography-main(14px);
        color: $color-black;
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
