<script lang="ts">
import { defineComponent, PropType } from "vue";
import { getRandomString } from "@/helpers/getRandomString";

interface Item {
  value: unknown;
  title: string;
}

export default defineComponent({
  props: {
    modelValue: {
      required: true,
    },
    tabStyle: {
      type: String,
      default: "tab",
    },
    items: {
      type: Array as PropType<Item[]>,
      required: true,
    },
  },
  emits: {
    "update:modelValue": (value: unknown) => value,
  },
  setup(props, { emit }) {
    const name = getRandomString();
    const handleChange = (value: unknown) => {
      emit("update:modelValue", value);
    };

    return { name, handleChange };
  },
});
</script>

<template>
  <div class="ui-radio-buttons-input">
    <label v-for="item in items" :key="item.value" :class="`${tabStyle}__item`">
      <label :class="[{ '_is-active': modelValue === item.value }, tabStyle]">
        {{ item.title }}
        <input
          class="button__input"
          type="radio"
          :value="item.value"
          :name="name"
          @change="handleChange(item.value)"
        />
      </label>
    </label>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/typography.scss";
@import "@/styles/grid.scss";

.ui-radio-buttons-input {
  display: flex;
}

.tab {
  @include typography-main(16px, 700);
  padding: 14px;
  background: #dcdeef;
  border-radius: 10px 10px 0px 0px;
  color: rgba(30, 43, 153, 0.6);
  cursor: pointer;
  display: block;

  &._is-active {
    color: $color-blue;
    background-color: $color-white;
  }

  &__item {
    cursor: pointer;
    z-index: 1;
    position: relative;
  }
}

.button {
  @include typography-main(16px, 600);
  display: block;
  border-radius: $rounding-medium;
  padding: 8px;
  cursor: pointer;
  color: $color-blue;
  background-color: rgba($color-blue, 0.1);
  text-align: center;

  &:first-child {
    margin-right: 12px;
  }

  &__input {
    pointer-events: none;
    position: absolute;
    opacity: 0;
  }

  &._is-active {
    @include shadow-medium;
    color: $color-white;
    background-color: $color-blue;
  }
}
</style>
