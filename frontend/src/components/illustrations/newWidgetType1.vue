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
  <svg width="90" height="48" viewBox="0 0 90 48" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{'_is-active': isActive}" :fillColor="fillColor">
    <rect v-if="!isActive" width="90" height="48" rx="10" :fill="fillColor" fill-opacity="0.1"/>
    <path d="M21 14L22.6928 17.67L26.7063 18.1459L23.739 20.89L24.5267 24.8541L21 22.88L17.4733 24.8541L18.261 20.89L15.2937 18.1459L19.3072 17.67L21 14Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M33 14L34.6928 17.67L38.7063 18.1459L35.739 20.89L36.5267 24.8541L33 22.88L29.4733 24.8541L30.261 20.89L27.2937 18.1459L31.3072 17.67L33 14Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M45 14L46.6928 17.67L50.7063 18.1459L47.739 20.89L48.5267 24.8541L45 22.88L41.4733 24.8541L42.261 20.89L39.2937 18.1459L43.3072 17.67L45 14Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M57 14L58.6928 17.67L62.7063 18.1459L59.739 20.89L60.5267 24.8541L57 22.88L53.4733 24.8541L54.261 20.89L51.2937 18.1459L55.3072 17.67L57 14Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <path d="M69 14L70.6928 17.67L74.7063 18.1459L71.739 20.89L72.5267 24.8541L69 22.88L65.4733 24.8541L66.261 20.89L63.2937 18.1459L67.3072 17.67L69 14Z" :fill="fillColor" :fill-opacity="starOpacity"/>
    <rect x="13" y="30" width="30" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
    <rect x="47" y="30" width="30" height="4" rx="2" :fill="fillColor" :fill-opacity="lineOpacity"/>
  </svg>
</template>
