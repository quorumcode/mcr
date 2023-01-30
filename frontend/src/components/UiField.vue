<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    label: {
      type: String,
      default: "",
    },
    errors: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    tag: {
      type: String,
      default: "label",
    },
    showErrorsText: {
      type: Boolean,
      default: true,
    },
    showErrorSpace: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
      default: "",
    },
  },
  setup(props, { slots }) {
    const hasError = computed(() => props.errors.length);
    const hasDescription = computed(() => !!slots.description);
    const hasHeader = computed(() => hasDescription.value || !!props.label);

    return { hasError, hasHeader, hasDescription };
  },
});
</script>

<template>
  <component :is="tag" class="field" :class="{ '_has-error': hasError }">
    <span v-if="hasHeader" class="field__header">
      <span v-if="label" class="field__label">{{ label }}</span>
      <span v-if="hasDescription" class="field__description">
        <slot name="description" />
      </span>
    </span>
    <span class="field__input">
      <slot />
    </span>
    <span
      v-if="(hasError && showErrorsText) || showErrorSpace"
      class="field__errors errors"
      :class="{
        '_is-show-space': showErrorSpace,
        '_is-reminder-delay': place === 'reminderDelay',
      }"
    >
      <span class="errors__item" v-for="error in errors" :key="error">
        {{ error }}
      </span>
    </span>
  </component>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.field {
  display: block;

  &__label {
    @include typography-main(16px, 600);
    display: block;
    color: $color-blue;
  }

  &__errors {
    display: block;
    margin-top: 4px;
    min-height: 19.2px;

    &._is-show-space {
      margin: 0 0 4px;
    }

    &._is-reminder-delay {
      position: absolute;
      width: 300px;
      text-align: center;
      left: 82px;
    }
  }

  &__description {
    @include typography-main(14px);
    display: block;
  }

  &__header {
    display: block;
    margin-bottom: 4px;
  }

  &._has-error {
    .field__label {
      color: $color-red;
    }
  }
}

.errors {
  @include typography-main(12px);
  color: $color-red;

  &__item {
    display: block;
  }
}
</style>
