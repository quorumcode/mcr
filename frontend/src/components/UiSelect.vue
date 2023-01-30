<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ClientOnly } from "vite-ssr";
import Multiselect from "@vueform/multiselect";

interface Option {
  value: string;
  label: string;
}

export default defineComponent({
  inheritAttrs: false,
  components: {
    Multiselect,
    ClientOnly,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<Option[]>,
      required: true,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  emits: {
    "update:modelValue": (payload: string[]) => payload,
  },
});
</script>

<template>
  <ClientOnly>
    <Multiselect
      class="select"
      :class="{
        '_has-error': hasError,
        '_is-disabled': isDisabled,
      }"
      mode="single"
      :searchable="true"
      :placeholder="placeholder"
      :options="options"
      :modelValue="modelValue"
      :disabled="isDisabled"
      v-bind="$attrs"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </ClientOnly>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.select {
  :deep(.multiselect-input) {
    border: 2px solid $color-blue-06;
    background-color: $color-blue-06;
    background-clip: padding-box;
    color: $color-black;
    outline: none;
    min-height: 52px;
    padding: 0 8px;
    transition: border-color 0.2s;
    border-radius: $rounding-medium;

    &:focus-within {
      border-color: $color-blue-20;
      background-color: $color-white;
    }
  }

  :deep(.multiselect-search) {
    input {
      @include typography-main;
      background: none;
      border: 0;
      outline: none;
    }
  }

  :deep(.multiselect-placeholder) {
    color: rgba($color-blue-60, 0.6);
  }

  :deep(.multiselect-clear) {
    display: none;
  }

  :deep(.multiselect-caret) {
    display: none;
  }

  :deep(.multiselect-options) {
    @include shadow-medium;
    border: none;
    border-radius: $rounding-medium;
  }

  :deep(.multiselect-option) {
    @include typography-main;
    border-radius: $rounding-medium;
    padding: 14px 12px;

    &:hover,
    &.is-pointed {
      background: $color-blue-06;
    }

    &.is-selected {
      background: $color-blue;
    }
  }

  :deep(.multiselect-no-options) {
    color: $color-blue;
  }

  :deep(.multiselect-no-results) {
    color: $color-blue;
  }

  &._is-disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  &._has-error {
    :deep(.multiselect-input) {
      border-color: $color-error-border;
      color: $color-error;

      &:not(:focus-within) {
        background-color: $color-error-background;
      }
    }
  }
}
</style>
