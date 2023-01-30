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
    <rect x="8" y="22" width="74" height="18" rx="6" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <path d="M24.4316 8L25.8423 11.0584L29.1869 11.4549L26.7142 13.7416L27.3706 17.0451L24.4316 15.4L21.4927 17.0451L22.1491 13.7416L19.6764 11.4549L23.021 11.0584L24.4316 8Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M34.4316 8L35.8423 11.0584L39.1869 11.4549L36.7142 13.7416L37.3706 17.0451L34.4316 15.4L31.4927 17.0451L32.1491 13.7416L29.6764 11.4549L33.021 11.0584L34.4316 8Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M44.4316 8L45.8423 11.0584L49.1869 11.4549L46.7142 13.7416L47.3706 17.0451L44.4316 15.4L41.4927 17.0451L42.1491 13.7416L39.6764 11.4549L43.021 11.0584L44.4316 8Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M54.4316 8L55.8423 11.0584L59.1869 11.4549L56.7142 13.7416L57.3706 17.0451L54.4316 15.4L51.4927 17.0451L52.1491 13.7416L49.6764 11.4549L53.021 11.0584L54.4316 8Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M64.4316 8L65.8423 11.0584L69.1869 11.4549L66.7142 13.7416L67.3706 17.0451L64.4316 15.4L61.4927 17.0451L62.1491 13.7416L59.6764 11.4549L63.021 11.0584L64.4316 8Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <rect x="12.2725" y="32" width="30.6818" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="12.2725" y="26" width="65.4545" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
  </svg>
</template>
