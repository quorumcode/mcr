<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

interface ScrollPayload {
  current: number;
  total: number;
  scrollWidth: number;
}

export default defineComponent({
  props: {
    isSmooth: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    scroll: (payload: ScrollPayload) => payload,
  },
  setup(props, { emit }) {
    const rootRef = ref<HTMLElement>();

    const handleScroll = () => {
      const payload: ScrollPayload = {
        current: rootRef.value.scrollLeft,
        total: rootRef.value.scrollWidth - rootRef.value.clientWidth,
        scrollWidth: rootRef.value.scrollWidth,
      };
      emit("scroll", payload);
    };

    onMounted(() => {
      handleScroll();
    });

    const scrollTo = (value) => {
      const maxScroll = rootRef.value.scrollWidth - rootRef.value.clientWidth;
      let normalizedValue = value;
      if (value < 0) {
        normalizedValue = 0;
      }
      if (value > maxScroll) {
        normalizedValue = maxScroll;
      }
      rootRef.value.scrollLeft = normalizedValue;
    };

    return { rootRef, scrollTo, handleScroll };
  },
});
</script>

<template>
  <div
    class="ui-horizontal-scroller"
    :class="{ '_is-smooth': isSmooth }"
    @scroll="handleScroll"
    ref="rootRef"
  >
    <div class="inner">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ui-horizontal-scroller {
  position: relative;
  overflow: auto;
  overflow-y: hidden;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }

  &._is-smooth {
    scroll-behavior: smooth;
  }
}

.inner {
  position: relative;
  height: 100%;
}
</style>
