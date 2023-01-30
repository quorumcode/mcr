<script lang="ts">
import { defineComponent, PropType } from "vue";
import { FullReviewStats } from "@/types/commonTypes";

enum nameAssessment {
  excellent = "Excellent",
  good = "Good",
  okay = "Okay",
  poor = "Poor",
  terrible = "Terrible",
}

export default defineComponent({
  props: {
    reviewStats: {
      type: Object as PropType<FullReviewStats>,
      required: true,
    },
  },
  setup() {
    return { nameAssessment };
  },
});
</script>

<template>
  <div class="review-chart">
    <div
      v-for="(name, prop) in nameAssessment"
      :key="name"
      class="review-chart__item"
    >
      <div class="review-chart__item-name">{{ name }}</div>
      <div class="review-chart__item-percent">{{ reviewStats[prop] }}%</div>
      <div class="review-chart__item-chart">
        <div
          class="review-chart__item-fill"
          :class="prop"
          :style="`width: ${reviewStats[prop] ? reviewStats[prop] : '0'}%`"
        />
        <div class="review-chart__item-value" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";

.review-chart {
  @include shadow-x-large;
  background-color: $color-white;
  border-radius: $rounding-large;
  padding: 22px 24px;

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;

    &:not(:last-child) {
      margin-bottom: 8px;
    }

    &-name {
      @include typography-main(12px, 700);
      color: $color-blue;
    }

    &-percent {
      @include typography-main(12px, 700);
      color: $color-blue;
      margin-left: auto;
      margin-right: 8px;
    }

    &-chart {
      height: 16px;
      width: 168px;
      background-color: $color-black-10;
      position: relative;
    }

    &-fill {
      height: 100%;
    }

    &-value {
      @include typography-main(16px, 500);
      color: $color-blue;
      position: absolute;
      top: 0;
      right: 8px;
    }
  }
}

.excellent {
  background: $color-green;
}
.good {
  background: #a1d95a;
}
.okay {
  background: #ffda55;
}
.poor {
  background: #ffad33;
}
.terrible {
  background: $color-red;
}
</style>
