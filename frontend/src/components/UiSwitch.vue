<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    "update:modelValue": (value: boolean) => typeof value === "boolean",
  },
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const target = event.currentTarget as HTMLInputElement;
      emit("update:modelValue", target.checked);
    };

    return { handleChange };
  },
});
</script>

<template>
  <label
    class="switch"
    :class="{
      _active: modelValue,
      '_dark-mode': darkMode,
    }"
  >
    <input
      class="input"
      type="checkbox"
      :checked="modelValue"
      @change="handleChange"
    />
  </label>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/shadow.scss";

.switch {
  display: inline-block;
  position: relative;
  width: 52px;
  height: 32px;
  background-color: $color-blue-06;
  border-radius: 999px;
  border: 2px solid $color-blue-10;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;

  &:after {
    @include shadow-small;
    content: "";
    width: 24px;
    height: 24px;
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 999px;
    background-color: $color-white;
    transition: transform 0.2s;
  }

  &._active {
    background-color: $color-yellow-40;
    border-color: $color-yellow-60;

    &:after {
      background: $color-gradient-primary;
      transform: translateX(20px);
    }
  }

  &._is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &._dark-mode {
    background-color: $color-yellow-40;
    border-color: $color-yellow-60;

    &:after {
      background: $color-gradient-primary;
    }

    &._active {
      background-color: $color-blue-20;
      border-color: rgba($color-blue-40, 0.5);

      &:after {
        background: $color-blue;
        transform: translateX(20px);
      }
    }
  }
}

.input {
  position: absolute;
  opacity: 0;
}
</style>
