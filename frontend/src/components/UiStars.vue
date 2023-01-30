<script lang="ts">
import { computed, defineComponent } from "vue";
import IconStar from "./icons/IconStar.vue";

export default defineComponent({
  components: { IconStar },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    maxValue: {
      type: Number,
      default: 5,
    },
    autoSize: {
      type: Boolean,
      default: false,
    },
    isCompact: {
      type: Boolean,
      default: false,
    },
    widgetType: {
      type: String,
      default: "",
    },
    place: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const percentValue = computed(() => {
      return (props.value / props.maxValue) * 100;
    });

    const starAutoSizeStyles = computed(() => {
      if (!props.autoSize) {
        return "";
      }
      return {
        width: `${100 / props.maxValue}%`,
        height: "auto",
      };
    });

    return { percentValue, starAutoSizeStyles };
  },
});
</script>

<template>
  <div
    class="app-stars"
    :class="{
      '_auto-size': autoSize,
      '_widget-scrolling': widgetType === 'scrolling',
      '_is-dashboard-stats': place === 'dashboard-stats',
    }"
  >
    <div class="app-stars__back">
      <IconStar
        class="app-stars__star"
        :class="{ 'app-stars__star-compact': isCompact }"
        :style="starAutoSizeStyles"
        v-for="i in maxValue"
        :key="i"
      />
    </div>
    <div
      class="app-stars__front"
      :style="`clip-path: inset(0 ${100 - percentValue}% 0 0);`"
    >
      <IconStar
        class="app-stars__star"
        :class="{ 'app-stars__star-compact': isCompact }"
        :style="starAutoSizeStyles"
        v-for="i in maxValue"
        :key="i"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";

.app-stars {
  display: inline-block;
  position: relative;
  white-space: nowrap;
  line-height: 0;

  &__back {
    position: relative;
    top: -1px;
    color: rgba($color-black, 0.1);
  }

  &__front {
    position: absolute;
    top: -1px;
    left: 0;
    height: 100%;
    width: 100%;
    color: $color-yellow;
    overflow: hidden;
  }

  &__star-compact {
    height: 20px !important;
  }

  &._auto-size {
    display: block;
  }

  &._widget-scrolling {
    transform: scale(1.05);
    margin-left: 5px;
    margin-top: 1px;
  }

  &._is-dashboard-stats {
    transform: scale(1.65);
    margin-left: 32px;
    margin-top: 1px;
  }
}
</style>
