<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetData } from "@/types/commonTypes";
import UiSlider from "@/components/UiSlider.vue";
import AppWidgetReview from "@/components/AppWidgetReview.vue";

export default defineComponent({
  components: { AppWidgetReview, UiSlider },
  props: {
    data: {
      type: Object as PropType<WidgetData>,
      required: true,
    },
    itemsPerSlide: {
      type: Number,
      default: 2,
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
});
</script>

<template>
  <div>
    <UiSlider
      class="app-widget-reviews-slider"
      :items="data.reviews"
      :items-per-slide="itemsPerSlide"
    >
      <template v-slot:default="{ item }">
        <AppWidgetReview
          class="app-widget-reviews-slider__review"
          :class="`review-background-${cardBackgroud}`"
          :card-backgroud="cardBackgroud"
          :backgroud-color="backgroudColor"
          :company-id="data.companyId"
          :id="item.id"
          :user-name="item.client.name"
          :rating-value="item.rate"
          :message="item.message"
          :date="item.createdAt"
        />
      </template>
    </UiSlider>
  </div>
</template>

<style lang="scss" scoped>
.app-widget-reviews-slider {
  height: 100%;

  &__review {
    height: 100%;
  }
}

.review-background-white {
  background-color: #fff;
}

.review-background-black {
  background-color: #000;
}

.review-background-transparent {
  background-color: rgba(30, 43, 153, 0.2);
}
</style>
