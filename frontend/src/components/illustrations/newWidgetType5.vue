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
      cardOpacity: computed(() => (props.isActive ? "0.2" : "0.1")),
    };
  },
});
</script>

<template>
  <svg width="90" height="48" viewBox="0 0 90 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect v-if="!isActive" width="90" height="48" rx="10" :fill="fillColor" fill-opacity="0.1"/>
    <rect x="8" y="7" width="74" height="33" rx="6"  :fill="fillColor" :fill-opacity="cardOpacity"/>
    <path d="M17.2734 12L18.6841 15.0584L22.0287 15.4549L19.556 17.7416L20.2124 21.0451L17.2734 19.4L14.3345 21.0451L14.9909 17.7416L12.5182 15.4549L15.8628 15.0584L17.2734 12Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M27.2715 12L28.6822 15.0584L32.0268 15.4549L29.554 17.7416L30.2104 21.0451L27.2715 19.4L24.3326 21.0451L24.9889 17.7416L22.5162 15.4549L25.8608 15.0584L27.2715 12Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M37.2715 12L38.6822 15.0584L42.0268 15.4549L39.554 17.7416L40.2104 21.0451L37.2715 19.4L34.3326 21.0451L34.9889 17.7416L32.5162 15.4549L35.8608 15.0584L37.2715 12Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M47.2725 12L48.6831 15.0584L52.0277 15.4549L49.555 17.7416L50.2114 21.0451L47.2725 19.4L44.3335 21.0451L44.9899 17.7416L42.5172 15.4549L45.8618 15.0584L47.2725 12Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M57.2725 12L58.6831 15.0584L62.0277 15.4549L59.555 17.7416L60.2114 21.0451L57.2725 19.4L54.3335 21.0451L54.9899 17.7416L52.5172 15.4549L55.8618 15.0584L57.2725 12Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <rect x="12.2734" y="32" width="30.6818" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="12.2734" y="26" width="65.4545" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
  </svg>
</template>
