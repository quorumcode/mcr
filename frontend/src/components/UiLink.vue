<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    href: {
      type: String,
      default: "#",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <a
    :class="[
      'link',
      {
        '_is-disabled': isDisabled,
      },
    ]"
    :href="href"
  >
    <span v-if="$slots.icon" class="link__icon">
      <slot name="icon" />
    </span>
    <span>
      <slot />
    </span>
  </a>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";

.link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  color: $color-blue;

  &__icon {
    line-height: 0;
    margin-right: 12px;
    margin-top: -2px;
  }

  &:hover {
    color: $color-black;
  }

  &._is-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
</style>
