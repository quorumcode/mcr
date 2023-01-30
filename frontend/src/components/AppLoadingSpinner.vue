<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <svg
    class="app-loading-spinner"
    width="19"
    height="17"
    viewBox="0 0 19 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 0L12.0392 5.50505L18.0595 6.21885L13.6086 10.335L14.7901 16.2812L9.5 13.32L4.20993 16.2812L5.39144 10.335L0.940492 6.21885L6.96077 5.50505L9.5 0Z"
      stroke="currentColor"
    />
  </svg>
</template>

<style lang="scss" scoped>
@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}

.app-loading-spinner {
  width: 24px;
  height: 24px;
}

path {
  stroke-dasharray: 30;
  stroke-dashoffset: 120;
  animation: dash 3s linear forwards infinite;
}
</style>
