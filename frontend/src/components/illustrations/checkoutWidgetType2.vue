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
  <svg width="90" height="64" viewBox="0 0 90 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect v-if="!isActive" width="90" height="64" rx="10" fill="#1E2B99" fill-opacity="0.1"/>
    <path d="M17 6L18.4107 9.05836L21.7553 9.45492L19.2825 11.7416L19.9389 15.0451L17 13.4L14.0611 15.0451L14.7175 11.7416L12.2447 9.45492L15.5893 9.05836L17 6Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M27 6L28.4107 9.05836L31.7553 9.45492L29.2825 11.7416L29.9389 15.0451L27 13.4L24.0611 15.0451L24.7175 11.7416L22.2447 9.45492L25.5893 9.05836L27 6Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M37 6L38.4107 9.05836L41.7553 9.45492L39.2825 11.7416L39.9389 15.0451L37 13.4L34.0611 15.0451L34.7175 11.7416L32.2447 9.45492L35.5893 9.05836L37 6Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M47 6L48.4107 9.05836L51.7553 9.45492L49.2825 11.7416L49.9389 15.0451L47 13.4L44.0611 15.0451L44.7175 11.7416L42.2447 9.45492L45.5893 9.05836L47 6Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M57 6L58.4107 9.05836L61.7553 9.45492L59.2825 11.7416L59.9389 15.0451L57 13.4L54.0611 15.0451L54.7175 11.7416L52.2447 9.45492L55.5893 9.05836L57 6Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <rect x="12.2725" y="20" width="65.4546" height="18" rx="2" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="16" y="30" width="27.6136" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="16.3638" y="24" width="57.2727" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="12.2725" y="42" width="65.4546" height="14" rx="2" fill="#1E2B99" :fill-opacity="starOpacity" />
    <rect x="38.8638" y="47" width="12.2727" height="4" rx="2" fill="white"/>
  </svg>
</template>
