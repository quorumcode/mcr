<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <div class="loader-wrap">
    <div class="loader" />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/zIndex.scss";

@keyframes loader {
  0% {
    transform: translateX(-50%) scaleX(0);
  }
  10% {
    transform: translateX(-50%) scaleX(0.1);
  }
  50% {
    transform: translateX(0) scaleX(0.5);
  }
  90% {
    transform: translateX(50%) scaleX(0.1);
  }
  100% {
    transform: translateX(50%) scaleX(0);
  }
}

.loader-wrap {
  border-radius: $rounding-large;
  position: absolute;
  height: 40px;
  width: calc(100% - 4px);
  z-index: z-index-overlay();
  overflow: hidden;
  border: 2px solid transparent;
}

.loader {
  position: relative;
  top: -3px;
  left: 0;
  right: 0;
  width: 100%;
  height: 6px;
  background-color: #d2d5eb;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $color-blue;
    animation: loader 2s linear infinite;
  }
}
</style>
