<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetType } from "@/types/commonTypes";
import widgetType1 from "@/components/illustrations/widgetType1.vue";
import widgetType2 from "@/components/illustrations/widgetType2.vue";
import widgetType3 from "@/components/illustrations/widgetType3.vue";
import widgetType4 from "@/components/illustrations/widgetType4.vue";
import widgetType5 from "@/components/illustrations/widgetType5.vue";
import widgetType6 from "@/components/illustrations/widgetType6.vue";

const illustrationsMap = {
  [WidgetType.rating]: widgetType1,
  [WidgetType.ratingWithCarousel]: widgetType2,
  [WidgetType.carousel]: widgetType3,
  [WidgetType.lastReview]: widgetType4,
  [WidgetType.scrolling]: widgetType5,
  [WidgetType.compact]: widgetType6,
};

export default defineComponent({
  props: {
    modelValue: {
      type: String as PropType<WidgetType>,
      required: true,
    },
  },
  emits: {
    "update:modelValue": (value: WidgetType) => value,
  },
  setup(props, { emit }) {
    const items: {
      value: WidgetType;
      illustrationComponent: InstanceType<any>;
    } = Object.values(WidgetType).map((value) => ({
      value,
      illustrationComponent: illustrationsMap[value],
    }));

    const changeType = (value: WidgetType) => {
      emit("update:modelValue", value);
    };

    return { items, changeType };
  },
});
</script>

<template>
  <div class="app-widget-type-picker">
    <div
      class="app-widget-type-picker__item"
      :class="{
        '_is-active': item.value === modelValue,
        '_is-no-padding':
          item.value === 'ratingWithCarousel' || item.value === 'carousel',
      }"
      v-for="item in items"
      :key="item.value"
      @click="changeType(item.value)"
    >
      <component :is="item.illustrationComponent" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";

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
    border: 2px solid transparent;
    cursor: pointer;
    height: 68px;
    width: 80px;
    padding: 0 8px;

    &:nth-child(odd) {
      margin-right: 8px;
    }

    &:not(:last-child) {
      margin-bottom: 12px;
    }

    &._is-active {
      @include shadow-medium;
      border-color: $color-blue;
    }

    &._is-no-padding {
      padding: 0;
      width: 96px;
    }
  }
}
</style>
