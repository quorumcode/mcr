<script lang="ts">
import { defineComponent } from "vue";
import IconCheckboxChecked from "@/components/icons/IconCheckboxChecked.vue";
import IconCheckboxUnchecked from "@/components/icons/IconCheckboxUnchecked.vue";

export default defineComponent({
  components: { IconCheckboxUnchecked, IconCheckboxChecked },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    "update:modelValue": (payload: boolean) => true,
  },
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const target = event.currentTarget as HTMLInputElement;
      emit("update:modelValue", target.checked);
    };

    return {
      handleChange,
    };
  },
});
</script>

<template>
  <label
    class="checkbox"
    :class="{
      '_has-error': hasError,
      '_is-disabled': isDisabled,
    }"
  >
    <input
      class="checkbox__input"
      type="checkbox"
      :checked="modelValue"
      :disabled="isDisabled"
      @change="handleChange"
    />
    <span class="checkbox__icon">
      <IconCheckboxChecked v-if="modelValue" />
      <IconCheckboxUnchecked v-else />
    </span>
    <span v-if="$slots.default" class="checkbox__desc">
      <slot />
    </span>
  </label>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.checkbox {
  @include typography-main(12px);
  display: inline-flex;
  position: relative;
  align-items: center;

  &__icon {
    flex-shrink: 0;
    flex-grow: 0;
    color: $color-blue;
    line-height: 0;
  }

  &__desc {
    margin-left: 8px;
    flex-shrink: 1;
    flex-grow: 1;
  }

  &__input {
    position: absolute;
    opacity: 0;

    &:focus-visible + .checkbox__icon {
      outline: -webkit-focus-ring-color auto 5px;
    }
  }

  &._has-error {
    .checkbox__icon {
      color: $color-error;
    }
  }

  &._is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
