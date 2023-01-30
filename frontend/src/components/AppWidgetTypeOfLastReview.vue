<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetData } from "@/types/commonTypes";
import AppWidgetReviewsSlider from "@/components/AppWidgetReviewsSlider.vue";

export default defineComponent({
  components: { AppWidgetReviewsSlider },
  props: {
    data: {
      type: Object as PropType<WidgetData>,
      required: true,
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
  <AppWidgetReviewsSlider
    class="widget"
    :data="data"
    :card-backgroud="cardBackgroud"
    :backgroud-color="backgroudColor"
    :items-per-slide="1"
  />
</template>

<style lang="scss" scoped>
.widget {
  height: 100%;
}
</style>
