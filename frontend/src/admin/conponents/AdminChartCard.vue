<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { Chart } from "chart.js";
import AppCard from "@/components/AppCard.vue";

export default defineComponent({
  components: { AppCard },
  props: {
    title: {
      type: String,
      default: "",
    },
    config: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const ctx = ref<HTMLCanvasElement>();
    const chart = ref<Chart>();

    onMounted(() => {
      chart.value = new Chart(ctx.value, props.config);
    });

    onBeforeUnmount(() => {
      chart.value?.destroy();
    });

    return { ctx };
  },
});
</script>

<template>
  <AppCard class="chart-card">
    <h2 class="chart-card__title">{{ title }}</h2>
    <canvas ref="ctx" class="chart-card__graph"></canvas>
    <div v-if="$slots.default" class="chart-card__slot">
      <slot />
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.chart-card {
  &__title {
    @include typography-main(24px, 700);
    margin: 0;
    margin-bottom: 12px;
    color: $color-blue;
  }

  &__graph {
    width: 100%;
    height: 300px;
  }

  &__slot {
    margin-top: 24px;
  }
}
</style>
