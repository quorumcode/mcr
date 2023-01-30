<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { WidgetData, WidgetType } from "@/types/commonTypes";
import AppWidgetTypeOfRating from "@/components/AppWidgetTypeOfRating.vue";
import AppWidgetTypeOfCompact from "@/components/AppWidgetTypeOfCompact.vue";
import AppWidgetTypeOfRatingWithCarousel from "@/components/AppWidgetTypeOfRatingWithCarousel.vue";
import AppWidgetTypeOfCarousel from "@/components/AppWidgetTypeOfCarousel.vue";
import AppWidgetTypeOfLastReview from "@/components/AppWidgetTypeOfLastReview.vue";
import AppWidgetTypeOfScrolling from "@/components/AppWidgetTypeOfScrolling.vue";

const widgetsMap: { [type in keyof WidgetType]: InstanceType<any> } = {
  [WidgetType.rating]: AppWidgetTypeOfRating,
  [WidgetType.compact]: AppWidgetTypeOfCompact,
  [WidgetType.ratingWithCarousel]: AppWidgetTypeOfRatingWithCarousel,
  [WidgetType.carousel]: AppWidgetTypeOfCarousel,
  [WidgetType.lastReview]: AppWidgetTypeOfLastReview,
  [WidgetType.scrolling]: AppWidgetTypeOfScrolling,
};

export default defineComponent({
  props: {
    type: {
      type: String as PropType<WidgetType>,
      required: true,
    },
    cardBackgroud: {
      type: String,
      default: "white",
    },
    color: {
      type: String,
      default: "000000",
    },
    secondaryColor: {
      type: String,
      default: "6F728D",
    },
    backgroudColor: {
      type: String,
      default: "FFFFFF",
    },
    data: {
      type: Object as PropType<WidgetData>,
      required: true,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
    isMoreReviewsLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    loadMore: () => true,
  },
  setup(props) {
    const widgetComponent = computed(() => {
      return widgetsMap[props.type];
    });

    return { widgetComponent };
  },
});
</script>

<template>
  <div
    class="app-widget"
    :class="{
      '_is-compact': type === 'compact',
      '_no-border': backgroudColor === 'transparent',
    }"
    :style="`color: #${color}; background-color: #${backgroudColor}`"
  >
    <component
      :is="widgetComponent"
      :data="data"
      :is-mobile="isMobile"
      :is-more-reviews-loading="isMoreReviewsLoading"
      :secondary-color="secondaryColor"
      :backgroud-color="backgroudColor"
      :card-backgroud="cardBackgroud"
      @load-more="$emit('loadMore')"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";

.app-widget {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;
  background-color: transparent;
  border: 2px solid $color-blue-20;
  border-radius: $rounding-large;

  &._is-compact {
    max-height: 148px;
    padding: 8px 0 12px;
  }

  &._no-border {
    border-color: transparent;
  }
}
</style>
