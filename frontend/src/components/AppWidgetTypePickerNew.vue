<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetType } from "@/types/commonTypes";
import widgetType1 from "@/components/illustrations/newWidgetType1.vue";
import widgetType2 from "@/components/illustrations/newWidgetType2.vue";
import widgetType3 from "@/components/illustrations/newWidgetType3.vue";
import widgetType4 from "@/components/illustrations/newWidgetType4.vue";
import widgetType5 from "@/components/illustrations/newWidgetType5.vue";
import widgetType6 from "@/components/illustrations/newWidgetType6.vue";

const illustrationsMap = [
  { typeName: WidgetType.compact, illustration: widgetType1 },
  { typeName: WidgetType.ratingWithCarousel, illustration: widgetType2 },
  { typeName: WidgetType.rating, illustration: widgetType3 },
  { typeName: WidgetType.carousel, illustration: widgetType4 },
  { typeName: WidgetType.lastReview, illustration: widgetType5 },
  { typeName: WidgetType.scrolling, illustration: widgetType6 },
];

export default defineComponent({
  components: {
    widgetType2,
  },
  props: {
    modelValue: {
      type: String as PropType<WidgetType>,
      required: true,
    },
    isEnableAnimation: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    "update:modelValue": (value: WidgetType) => value,
  },
  setup(props, { emit }) {
    const changeType = (value: WidgetType) => {
      emit("update:modelValue", value);
    };
    return { changeType, illustrationsMap };
  },
});
</script>

<template>
  <div class="app-widget-type-picker">
    <div
      class="app-widget-type-picker__item"
      :class="{
        '_is-active': item.typeName === modelValue,
        '_is-enable-animation': isEnableAnimation,
        '_is-disable-animation': !isEnableAnimation,
      }"
      v-for="item in illustrationsMap"
      :key="item.typeName"
      @click="changeType(item.typeName)"
      tabindex="0"
      @keydown.space.prevent="changeType(item.typeName)"
    >
      <component
        :is="item.illustration"
        :is-active="item.typeName === modelValue"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/animation.scss";

.app-widget-type-picker {
  display: flex;
  flex-wrap: wrap;
  align-content: center;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-blue-10;
    border-radius: $rounding-medium;
    cursor: pointer;
    height: 48px;
    width: 90px;
    box-sizing: border-box;
    position: relative;
    margin-bottom: 12px;
    opacity: 0;

    &._is-enable-animation {
      animation-duration: 0.6s;
      animation-delay: 0.01s;
      animation-name: flipInX;
      animation-fill-mode: forwards;
      backface-visibility: visible !important;

      &:nth-child(3),
      &:nth-child(4) {
        animation-delay: 0.1s;
      }

      &:nth-child(5),
      &:nth-child(6) {
        animation-delay: 0.2s;
      }
    }

    &._is-disable-animation {
      opacity: 1;
    }

    &:nth-child(odd) {
      margin-right: 8px;
    }

    &:nth-last-child(1) {
      margin-bottom: 0;
    }

    &:nth-last-child(2) {
      margin-bottom: 0;
    }

    &._is-active {
      box-shadow: 4px 4px 17px rgba($color-blue, 0.2);
      border-color: $color-blue;
      background-color: $color-blue-60;
      background-color: #666fba;

      &::after {
        content: "";
        border: 2px solid $color-blue;
        width: 100%;
        height: 100%;
        position: absolute;
        border-radius: $rounding-medium;
        box-sizing: border-box;
      }
    }
  }
}
</style>
