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
    <rect x="12.2725" y="16" width="65.4545" height="12" rx="2" :fill="fillColor" :fill-opacity="cardOpacity"/>
    <rect x="16.3633" y="20" width="30.6818" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="49.0903" y="20" width="11.25" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="12.2725" y="32" width="65.4545" height="16" rx="2" fill="#1E2B99" :fill-opacity="starOpacity" />
    <rect x="38.8633" y="38" width="12.2727" height="4" rx="2" fill="white"/>
  </svg>
</template>
