<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import IconChevronRight from "@/components/icons/IconChevronRight.vue";
import IconChevronLeft from "@/components/icons/IconChevronLeft.vue";
import UiHorizontalScroller from "@/components/UiHorizontalScroller.vue";

type Item = any;

export default defineComponent({
  components: { UiHorizontalScroller, IconChevronLeft, IconChevronRight },
  props: {
    items: {
      type: Array as PropType<Array<Item>>,
      required: true,
    },
    itemsPerSlide: {
      type: Number,
      default: 2,
    },
  },
  setup(props) {
    const itemPercentWidth = computed(() => {
      return 100 / props.itemsPerSlide;
    });

    const scrollerRef = ref<HTMLElement>();
    const scrollSectionPayload = ref({ current: 0, total: 0, scrollWidth: 0 });
    const scrollTick = computed(() => {
      return scrollSectionPayload.value.scrollWidth / props.items.length;
    });

    const scrollRight = () => {
      const nearestSlideStart =
        Math.floor(
          (scrollSectionPayload.value.current + 20) / scrollTick.value
        ) * scrollTick.value;
      scrollerRef.value.scrollTo(nearestSlideStart + scrollTick.value);
    };

    const scrollLeft = () => {
      const nearestSlideEnd =
        Math.ceil(
          (scrollSectionPayload.value.current - 20) / scrollTick.value
        ) * scrollTick.value;
      scrollerRef.value.scrollTo(nearestSlideEnd - scrollTick.value);
    };

    return {
      itemPercentWidth,
      scrollerRef,
      scrollSectionPayload,
      scrollLeft,
      scrollRight,
      scrollTick,
    };
  },
});
</script>

<template>
  <div class="ui-slider">
    <div class="ui-slider__corner">
      <button
        type="button"
        class="arrow"
        :class="{ '_is-disabled': scrollSectionPayload.current === 0 }"
        @click="scrollLeft"
      >
        <IconChevronLeft />
      </button>
    </div>
    <UiHorizontalScroller
      class="ui-slider__content"
      :is-smooth="true"
      @scroll="scrollSectionPayload = $event"
      ref="scrollerRef"
    >
      <div class="grid">
        <div
          class="grid__item"
          v-for="(item, index) in items"
          :key="index"
          :style="{ width: `${itemPercentWidth}%` }"
        >
          <slot :item="item" />
        </div>
      </div>
    </UiHorizontalScroller>
    <div class="ui-slider__corner">
      <button
        type="button"
        class="arrow"
        :class="{
          '_is-disabled':
            scrollSectionPayload.current === scrollSectionPayload.total,
        }"
        @click="scrollRight"
      >
        <IconChevronRight />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/grid.scss";

.ui-slider {
  display: flex;
  align-items: center;

  &__corner {
    flex-shrink: 0;
    flex-grow: 0;
  }

  &__content {
    height: 100%;
    flex-shrink: 1;
    flex-grow: 1;
    margin: 0 2px;
  }
}

.grid {
  display: flex;
  flex-wrap: nowrap;
  height: 100%;

  &__item {
    flex-shrink: 0;
    flex-grow: 0;
    padding: 0 6px;
    box-sizing: border-box;
  }
}

.arrow {
  margin: 0;
  overflow: visible;
  font: inherit;
  outline: none;
  box-sizing: border-box;
  display: inline-block;
  cursor: pointer;
  border: none;
  text-align: center;
  border-radius: $rounding-small;
  background-color: $color-blue-06;
  line-height: 0;
  padding: 0;
  opacity: 0.9;

  &._is-disabled {
    pointer-events: none;
    opacity: 0.3;
  }
}
</style>
