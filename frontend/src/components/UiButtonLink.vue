<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    view: {
      type: String as PropType<"primary">,
      default: "primary",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isEndIcon: {
      type: Boolean,
      default: false,
    },
    to: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const isOnlyIcon = computed(() => {
      return !!slots.icon && !slots.default;
    });

    return { isOnlyIcon };
  },
});
</script>

<template>
  <RouterLink
    class="button"
    :class="[
      {
        '_is-disabled': isDisabled,
        '_is-only-icon': isOnlyIcon,
        '_is-end-icon': isEndIcon,
      },
      `_view-${view}`,
    ]"
    :to="to"
  >
    <span class="button__icon">
      <slot name="icon" />
    </span>
    <slot />
  </RouterLink>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.button {
  @include typography-main(16px, 600);
  margin: 0;
  outline: none;
  overflow: visible;
  box-sizing: border-box;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
  text-align: center;
  border-radius: $rounding-medium;
  text-decoration: none;

  display: flex;
  justify-content: center;
  align-items: center;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    line-height: 0;
    margin-right: 8px;
  }

  &._is-only-icon {
    .button__icon {
      margin: 0;
    }
  }

  &._is-end-icon {
    .button__inner {
      flex-direction: row-reverse;
    }

    .button__icon {
      margin: 0;
      margin-left: 8px;
    }
  }

  &._view-primary {
    @include shadow-large;
    min-height: 52px;
    padding: 13px 32px;
    color: $color-black;
    background: $color-gradient-primary;

    &:hover {
      background: $color-gradient-primary-hover;
    }

    &:active {
      background: $color-gradient-primary-active;
    }

    &._is-disabled {
      opacity: 0.7;
      pointer-events: none;
    }

    &._is-only-icon {
      padding: 14px;
    }
  }

  &._view-control-secondary {
    padding: 8px 16px;
    color: $color-blue;
    background-color: rgba($color-blue, 0.06);

    &:active {
      background-color: rgba($color-blue, 0.1);
    }

    &._is-only-icon {
      padding: 8px;
    }

    &._state-success {
      color: $color-green;
      background-color: $color-green-10;
    }
  }

  &:focus-visible {
    outline: -webkit-focus-ring-color auto 5px;
  }
}
</style>
