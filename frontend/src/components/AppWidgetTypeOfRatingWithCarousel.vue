<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetData } from "@/types/commonTypes";
import { routesNames } from "@/routesNames";
import AppRating from "@/components/AppRating.vue";
import AppWidgetReviewsSlider from "@/components/AppWidgetReviewsSlider.vue";

export default defineComponent({
  components: { AppRating, AppWidgetReviewsSlider },
  props: {
    data: {
      type: Object as PropType<WidgetData>,
      required: true,
    },
    secondaryColor: {
      type: String,
      default: "6F728D",
    },
    cardBackgroud: {
      type: String,
      default: "white",
    },
    backgroudColor: {
      type: String,
      default: "FFFFFF",
    },
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
      <AppRating
        :value="data.reviewsStats.rateAvg"
        :reviews-count="data.reviewsStats.count"
        :secondary-color="secondaryColor"
        :adaptive="false"
      />
    </RouterLink>

    <div class="widget__spacer" />

    <AppWidgetReviewsSlider
      class="widget__slider"
      :data="data"
      :secondary-color="secondaryColor"
      :card-backgroud="cardBackgroud"
      :backgroud-color="backgroudColor"
      :items-per-slide="2"
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
  }

  &__title {
    @include typography-main(14px, 600);
    margin: 0;
    margin-bottom: 8px;
    color: currentColor;
  }
}
</style>
