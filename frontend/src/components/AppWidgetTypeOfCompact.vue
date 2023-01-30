<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { WidgetData } from "@/types/commonTypes";
import { routesNames } from "@/routesNames";
import UiStars from "@/components/UiStars.vue";

export default defineComponent({
  components: { UiStars },
  props: {
    data: {
      type: Object as PropType<WidgetData>,
      required: true,
    },
    secondaryColor: {
      type: String,
      default: "6F728D",
    },
  },
  setup(props) {
    const fixedRatingValue = computed(() => {
      return props.data.reviewsStats.rateAvg.toFixed(1);
    });

    const ratingText = (rateAvg: number): string => {
      const rateRounded: number = Math.round(rateAvg);
      const text = {
        0: "No reviews",
        1: "Terrible",
        2: "Poor",
        3: "Okay",
        4: "Good",
        5: "Excellent",
      };
      return text[rateRounded];
    };

    return { fixedRatingValue, routesNames, ratingText };
  },
});
</script>

<template>
  <RouterLink
    class="widget"
    :to="{
      name: routesNames.companyProfile,
      params: { id: data.companyId },
      query: { fromWidget: 'true' },
    }"
    target="_blank"
  >
    <h1 class="widget__title">
      {{ ratingText(data.reviewsStats.rateAvg) }}
    </h1>
    <div class="widget__stars-wrap">
      <span class="widget__stars-rating">{{ fixedRatingValue }}</span>

      <UiStars
        class="widget__stars"
        :max-value="5"
        :value="data.reviewsStats.rateAvg"
        :auto-size="true"
        :is-compact="true"
      />
    </div>
    <div class="widget__info info">
      <div class="info__item">
        <span :style="`color: #${secondaryColor}`">Based on</span>
        <span class="info__value">{{ data.reviewsStats.count }}</span>
        <span :style="`color: #${secondaryColor}`">Reviews</span>
      </div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  color: currentColor;
  text-decoration: none;

  &__title {
    @include typography-main(14px, 600);
    color: $color-black;
    margin: 0;
    margin-bottom: 4px;
    color: currentColor;
  }

  &__stars-wrap {
    display: flex;
    justify-content: center;
    max-height: 20px;
  }

  &__stars {
    width: auto;
    min-width: 120px;
  }

  &__stars-rating {
    @include typography-main(12px, 600);
  }
}

.info {
  @include typography-main(12px);
  display: flex;
  align-items: center;
  justify-content: center;

  &__item {
    white-space: nowrap;

    &:not(:last-child) {
      &::after {
        content: "";
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 2px;
        background-color: $color-black-20;
        margin: 0 8px;
        position: relative;
        top: -2px;
      }
    }
  }

  &__value {
    @include typography-main(12px, 600);
    margin: 0 4px;
  }
}
</style>
