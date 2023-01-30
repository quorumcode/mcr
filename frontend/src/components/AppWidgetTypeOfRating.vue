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

    return { fixedRatingValue, routesNames };
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
    <h1 class="widget__title">Client Reviews</h1>
    <UiStars
      class="widget__stars"
      :max-value="5"
      :value="data.reviewsStats.rateAvg"
      :auto-size="true"
    />
    <div class="widget__info info">
      <div class="info__item">
        <span class="info__value">{{ fixedRatingValue }}</span>
        <span :style="`color: #${secondaryColor}`">Average rate</span>
      </div>
      <div class="info__item">
        <span class="info__value">{{ data.reviewsStats.count }}</span>
        <span :style="`color: #${secondaryColor}`">Reviews</span>
      </div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

// .fixed-color {
//   color: rgba($color-black, 0.6);
// }

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
    margin: 0;
    margin-bottom: 12px;
    color: currentColor;
  }

  &__stars {
    margin: 0 auto;
    margin-bottom: 4px;
    width: 50%;
    min-width: 120px;
  }

  // &._is-dark-mode {
  //   .fixed-color {
  //     color: rgba($color-white, 0.6);
  //   }
  // }
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
    @include typography-main(12px, 700);
    margin-right: 0.3em;
  }
}
</style>
