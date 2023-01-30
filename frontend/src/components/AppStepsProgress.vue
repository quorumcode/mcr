<script lang="ts">
import { defineComponent } from "vue";
import IconCheck from "@/components/icons/IconCheck.vue";

export default defineComponent({
  components: { IconCheck },
  props: {
    stepsCount: {
      type: Number,
      required: true,
    },
    currentStep: {
      type: Number,
      default: 1,
    },
  },
});
</script>

<template>
  <div class="steps">
    <div
      class="steps__item"
      :class="{
        '_is-active': step === currentStep,
        '_is-success': step < currentStep,
      }"
      v-for="step in stepsCount"
      :key="step"
    >
      <IconCheck v-if="step < currentStep" class="icon" />
      <template v-else>{{ step }}</template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.steps {
  @include typography-main(20px, 600);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2px;

  &__item {
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    height: 32px;
    width: 32px;
    border-radius: $rounding-circle;
    background-color: $color-blue-06;
    color: $color-blue-40;

    &._is-active {
      background-color: $color-blue;
      color: $color-white;
    }

    &._is-success {
      background-color: $color-green;
      color: $color-white;
    }

    &:not(:last-child) {
      margin-right: 24px;
    }
  }

  &::before {
    content: "";
    position: absolute;
    height: 2px;
    width: 100%;
    top: calc(50% - 1px);
    left: 0;
    background-color: $color-blue-06;
    z-index: -1;
  }
}
</style>
