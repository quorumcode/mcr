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
    <rect width="90" height="48" rx="10" :fill="fillColor" fill-opacity="0.1"/>
    <path d="M24.4321 5L25.8428 8.05836L29.1874 8.45492L26.7147 10.7416L27.3711 14.0451L24.4321 12.4L21.4932 14.0451L22.1496 10.7416L19.6768 8.45492L23.0214 8.05836L24.4321 5Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M34.4321 5L35.8428 8.05836L39.1874 8.45492L36.7147 10.7416L37.3711 14.0451L34.4321 12.4L31.4932 14.0451L32.1496 10.7416L29.6768 8.45492L33.0214 8.05836L34.4321 5Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M44.4321 5L45.8428 8.05836L49.1874 8.45492L46.7147 10.7416L47.3711 14.0451L44.4321 12.4L41.4932 14.0451L42.1496 10.7416L39.6768 8.45492L43.0214 8.05836L44.4321 5Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M54.4321 5L55.8428 8.05836L59.1874 8.45492L56.7147 10.7416L57.3711 14.0451L54.4321 12.4L51.4932 14.0451L52.1496 10.7416L49.6768 8.45492L53.0214 8.05836L54.4321 5Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M64.4321 5L65.8428 8.05836L69.1874 8.45492L66.7147 10.7416L67.3711 14.0451L64.4321 12.4L61.4932 14.0451L62.1496 10.7416L59.6768 8.45492L63.0214 8.05836L64.4321 5Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <rect x="47.0449" y="19" width="24.5455" height="24" rx="6" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="51.1357" y="23" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="51.1357" y="29" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="51.1357" y="35" width="10.2273" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="18.4092" y="19" width="24.5455" height="24" rx="6" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="22.5" y="23" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="22.5" y="29" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="22.5" y="35" width="10.2273" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <path d="M14.3188 27L10.2279 31L14.3188 35" :stroke="fillColor" :stroke-opacity="lineOpacity" stroke-width="2"/>
    <path d="M75.6816 35L79.7725 31L75.6816 27" :stroke="fillColor" :stroke-opacity="lineOpacity" stroke-width="2"/>
  </svg>
</template>