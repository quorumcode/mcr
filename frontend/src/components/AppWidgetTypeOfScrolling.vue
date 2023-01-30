<script lang="ts">
import { defineComponent, PropType } from "vue";
import { routesNames } from "@/routesNames";
import { WidgetData } from "@/types/commonTypes";
import AppRating from "@/components/AppRating.vue";
import AppWidgetReviewsScroll from "@/components/AppWidgetReviewsScroll.vue";

export default defineComponent({
  components: { AppRating, AppWidgetReviewsScroll },
  props: {
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
    cardBackgroud: {
      type: String,
      default: "white",
    },
    secondaryColor: {
      type: String,
      default: "6F728D",
    },
    backgroudColor: {
      type: String,
      default: "FFFFFF",
    },
  },
  emits: {
    loadMore: () => true,
  },
  setup() {
    return { routesNames };
  },
});
</script>

<template>
  <div class="widget">
    <RouterLink
      class="widget__header"
      :to="{
        name: routesNames.companyProfile,
        params: { id: data.companyId },
        query: { fromWidget: 'true' },
      }"
      target="_blank"
    >
      <h1 class="widget__title">Client Reviews</h1>
      <div class="rating-wrap">
        <AppRating
          :value="data.reviewsStats.rateAvg"
          :reviews-count="data.reviewsStats.count"
          :secondary-color="secondaryColor"
          :adaptive="false"
          widget-type="scrolling"
        />
      </div>
    </RouterLink>

    <div class="widget__spacer" />

    <AppWidgetReviewsScroll
      class="widget__slider"
      :data="data"
      :card-backgroud="cardBackgroud"
      :backgroud-color="backgroudColor"
      :items-per-slide="2"
      :is-mobile="isMobile"
      :is-more-reviews-loading="isMoreReviewsLoading"
      @load-more="$emit('loadMore')"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.fixed-color {
  color: rgba($color-black, 0.6);
}

.widget {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    padding-bottom: 24px;
    margin-bottom: 0;
    flex-shrink: 0;
    flex-grow: 0;
    margin-left: 32px;
    margin-right: 32px;
    color: currentColor;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__spacer {
    height: 1px;
    background-color: $color-black-10;
    margin-bottom: 24px;
    margin-left: 32px;
    margin-right: 32px;
    opacity: 0.7;
  }

  &__slider {
    flex-shrink: 1;
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    padding-right: 5px;
  }

  &__title {
    @include typography-main(16px, 600);
    margin: 0;
    margin-bottom: 8px;
    color: currentColor;
  }
}
</style>
