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
  <svg
    width="44"
    height="38"
    viewBox="0 0 84 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="84" height="56" rx="10" :fill="fillColor" :fill-opacity="cardOpacity" />
    <path
      d="M14 8L15.6928 11.67L19.7063 12.1459L16.739 14.89L17.5267 18.8541L14 16.88L10.4733 18.8541L11.261 14.89L8.29366 12.1459L12.3072 11.67L14 8Z"
      :fill="fillColor"
      :fill-opacity="starOpacity"
    />
    <path
      d="M26 8L27.6928 11.67L31.7063 12.1459L28.739 14.89L29.5267 18.8541L26 16.88L22.4733 18.8541L23.261 14.89L20.2937 12.1459L24.3072 11.67L26 8Z"
      :fill="fillColor"
      :fill-opacity="starOpacity"
    />
    <path
      d="M38 8L39.6928 11.67L43.7063 12.1459L40.739 14.89L41.5267 18.8541L38 16.88L34.4733 18.8541L35.261 14.89L32.2937 12.1459L36.3072 11.67L38 8Z"
      :fill="fillColor"
      :fill-opacity="starOpacity"
    />
    <path
      d="M50 8L51.6928 11.67L55.7063 12.1459L52.739 14.89L53.5267 18.8541L50 16.88L46.4733 18.8541L47.261 14.89L44.2937 12.1459L48.3072 11.67L50 8Z"
      :fill="fillColor"
      :fill-opacity="starOpacity"
    />
    <path
      d="M62 8L63.6928 11.67L67.7063 12.1459L64.739 14.89L65.5267 18.8541L62 16.88L58.4733 18.8541L59.261 14.89L56.2937 12.1459L60.3072 11.67L62 8Z"
      :fill="fillColor"
      :fill-opacity="starOpacity"
    />
    <rect
      x="8"
      y="28"
      width="68"
      height="4"
      rx="2"
      :fill="fillColor"
      :fill-opacity="lineOpacity"
    />
    <rect
      x="8"
      y="36"
      width="68"
      height="4"
      rx="2"
      :fill="fillColor"
      :fill-opacity="lineOpacity"
    />
    <rect
      x="8"
      y="44"
      width="37"
      height="4"
      rx="2"
      :fill="fillColor"
      :fill-opacity="lineOpacity"
    />
  </svg>
</template>
