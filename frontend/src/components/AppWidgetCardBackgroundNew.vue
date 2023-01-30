<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WidgetCardBackgroud } from "@/types/commonTypes";
import widgetCardType from "@/components/illustrations/widgetCardTypeNew.vue";

const illustrationsMap = {
  [WidgetCardBackgroud.black]: widgetCardType,
  [WidgetCardBackgroud.white]: widgetCardType,
  [WidgetCardBackgroud.transparent]: widgetCardType,
};

export default defineComponent({
  props: {
    modelValue: {
      type: String as PropType<WidgetCardBackgroud>,
      required: true,
    },
  },
  emits: {
    "update:modelValue": (value: WidgetCardBackgroud) => value,
  },
  setup(props, { emit }) {
    const items: {
      value: WidgetCardBackgroud;
      illustrationComponent: InstanceType<any>;
    } = Object.values(WidgetCardBackgroud).map((value) => ({
      value,
      illustrationComponent: illustrationsMap[value],
    }));

    const changeType = (value: WidgetCardBackgroud) => {
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

      <div :class="`preset-item preset-${item.value}`">
        <template v-if="item.value === 'transparent'">
          <div class="preset-transparent-border" />
          <div class="preset-transparent-top" />
          <div class="preset-transparent-bot" />
        </template>
      </div>
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
    flex-direction: column;
    background-color: #d5d6ec;
    border-radius: 10px;
    border: 2px solid transparent;
    cursor: pointer;
    height: 50px;
    width: 44px;
    padding: 0px 4px 2px;
    margin-right: 8px;
    animation-duration: 0.8s;
    animation-delay: 0.1s;
    animation-name: flipInX;
    animation-fill-mode: forwards;
    backface-visibility: visible !important;
    opacity: 0;

    &:nth-child(2) {
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }

    &:last-child {
      margin-right: 0;
    }

    &._is-active {
      @include shadow-medium;
      border-color: $color-blue;
      background-color: #666fba;

      .preset-transparent-border {
        border-color: #d3d6ec;
      }
    }
  }
}

.preset-item {
  min-width: 10px;
  min-height: 10px;
  border-radius: 6px;
}

.preset-white {
  background-color: #fff;
}
.preset-black {
  background-color: #0f1441;
}

.preset-transparent {
  overflow: hidden;
  position: relative;
  background-color: #fff;

  &-border {
    border: 1px solid rgb(196 196 196 / 70%);
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 5px;
    z-index: 2;
  }

  &-top {
    background-color: #c4c4c4;
    width: 50%;
    height: 50%;
    z-index: 1;
  }

  &-bot {
    background-color: #c4c4c4;
    width: 50%;
    height: 50%;
    right: 0;
    bottom: 0;
    position: absolute;
    z-index: 1;
  }
}
</style>
