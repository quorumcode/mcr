<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return {
      fillColor: computed(() => (props.isActive ? "#FFF" : "#1E2B99")),
      starOpacity: computed(() => (props.isActive ? "1" : "0.6")),
      lineOpacity: computed(() => (props.isActive ? "1" : "0.2")),
    };
  },
});
</script>

<template>
  <svg width="90" height="48" viewBox="0 0 90 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect v-if="!isActive" width="90" height="48" rx="10" :fill="fillColor" fill-opacity="0.1"/>
    <path d="M20.3179 18L22.0107 21.67L26.0242 22.1459L23.0569 24.89L23.8446 28.8541L20.3179 26.88L16.7912 28.8541L17.5788 24.89L14.6115 22.1459L18.625 21.67L20.3179 18Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M32.3179 18L34.0107 21.67L38.0242 22.1459L35.0569 24.89L35.8446 28.8541L32.3179 26.88L28.7912 28.8541L29.5788 24.89L26.6115 22.1459L30.625 21.67L32.3179 18Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M44.3179 18L46.0107 21.67L50.0242 22.1459L47.0569 24.89L47.8446 28.8541L44.3179 26.88L40.7912 28.8541L41.5788 24.89L38.6115 22.1459L42.625 21.67L44.3179 18Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M56.3179 18L58.0107 21.67L62.0242 22.1459L59.0569 24.89L59.8446 28.8541L56.3179 26.88L52.7912 28.8541L53.5788 24.89L50.6115 22.1459L54.625 21.67L56.3179 18Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M68.3179 18L70.0107 21.67L74.0242 22.1459L71.0569 24.89L71.8446 28.8541L68.3179 26.88L64.7912 28.8541L65.5788 24.89L62.6115 22.1459L66.625 21.67L68.3179 18Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <rect x="12.2725" y="34" width="30.6818" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="14.3179" y="10" width="61.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="47.0454" y="34" width="30.6818" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
  </svg>
</template>
