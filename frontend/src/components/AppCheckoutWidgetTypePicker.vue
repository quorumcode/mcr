<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetType, CheckoutWidgetType } from "@/types/commonTypes";
import checkoutWidgetType1 from "@/components/illustrations/checkoutWidgetType1.vue";
import checkoutWidgetType2 from "@/components/illustrations/checkoutWidgetType2.vue";

const illustrationsMap = {
  [WidgetType.invite]: checkoutWidgetType1,
  [WidgetType.addReview]: checkoutWidgetType2,
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
    setDefaultHeight: (value: number) => value,
  },
  setup(props, { emit }) {
    const items: {
      value: WidgetType;
      illustrationComponent: InstanceType<any>;
    } = Object.values(CheckoutWidgetType).map((value) => ({
      value,
      illustrationComponent: illustrationsMap[value],
    }));

    const changeType = (value: WidgetType) => {
      emit("update:modelValue", value);
      if (value === WidgetType.addReview) {
        emit("setDefaultHeight", 600);
      } else if (value === WidgetType.invite) {
        emit("setDefaultHeight", 360);
      }
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
      }"
      v-for="item in items"
      :key="item.value"
      @click="changeType(item.value)"
      tabindex="0"
      @keydown.space.prevent="changeType(item.value)"
    >
      <component
        :is="item.illustrationComponent"
        :is-active="item.value === modelValue"
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
    height: 64px;
    width: 90px;
    box-sizing: border-box;
    position: relative;

    animation-duration: 0.4s;
    animation-delay: 0.2s;
    animation-name: flipInX;
    animation-fill-mode: forwards;
    backface-visibility: visible !important;
    opacity: 0;

    &:nth-child(2) {
      animation-delay: 0.3s;
    }

    &:nth-child(odd) {
      margin-right: 8px;
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
