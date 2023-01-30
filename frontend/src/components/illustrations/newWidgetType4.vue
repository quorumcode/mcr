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
    <rect v-if="!isActive" width="90" height="48" rx="10" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="47.0449" y="12" width="24.5455" height="24" rx="6" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="51.1357" y="16" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="51.1357" y="22" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="51.1357" y="28" width="10.2273" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="18.4087" y="12" width="24.5455" height="24" rx="6" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="22.4995" y="16" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="22.4995" y="22" width="16.3636" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="22.4995" y="28" width="10.2273" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <path d="M14.3184 20L10.2275 24L14.3184 28" :stroke="fillColor" :stroke-opacity="lineOpacity" stroke-width="2"/>
    <path d="M75.6816 28L79.7725 24L75.6816 20" :stroke="fillColor" :stroke-opacity="lineOpacity" stroke-width="2"/>
  </svg>
</template>
