<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    type: {
      type: String,
      default: "button",
    },
    view: {
      type: String as PropType<
        | "primary"
        | "primary-small"
        | "secondary"
        | "control"
        | "control-light"
        | "control-secondary"
        | "control-secondary-dashboard"
        | "control-secondary-danger"
        | "control-small"
        | "text"
      >,
      default: "primary",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: "button",
    },
    isEndIcon: {
      type: Boolean,
      default: false,
    },
    state: {
      type: String as PropType<"default" | "success">,
      default: "default",
    },
    iconMargin: {
      type: Number,
      default: null,
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
  <component
    :is="tag"
    class="button"
    :class="[
      {
        '_is-disabled': isDisabled,
        '_is-only-icon': isOnlyIcon,
        '_is-end-icon': isEndIcon,
      },
      `_view-${view}`,
      `_state-${state}`,
    ]"
    :type="tag === 'button' ? type : ''"
  >
    <span class="button__inner">
      <span
        v-if="$slots.icon"
        class="button__icon"
        :style="iconMargin ? `margin-right: ${iconMargin}px` : ''"
      >
        <slot name="icon" />
      </span>
      <span>
        <slot />
      </span>
    </span>
  </component>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.button {
  margin: 0;
  overflow: visible;
  font: inherit;
  outline: none;
  @include typography-main(16px, 600);

  box-sizing: border-box;
  display: inline-block;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
  text-align: center;
  border-radius: $rounding-medium;

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

  &._view-control-secondary-dashboard {
    padding: 8px 16px;
    color: $color-blue;
    background-color: rgba($color-blue, 0.06);

    &:active {
      background-color: rgba($color-blue, 0.1);
    }

    &._is-only-icon {
      padding: 4px;
      width: 24px;
      height: 24px;
      border-radius: 6px;

      .button__icon {
        margin-top: -1px;
      }
    }

    &._state-success {
      color: $color-green;
      background-color: $color-green-10;
    }

    &._is-disabled {
      opacity: 0.7;
    }
  }

  &._view-text {
    padding: 8px 16px 8px 0;
    color: $color-blue;
    background-color: transparent;

    &._is-only-icon {
      padding: 8px;
    }

    .button__icon {
      margin-right: 12px;
    }
  }

  &._is-disabled {
    color: #c7cae6;
    pointer-events: none;
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
    }

    &._is-only-icon {
      padding: 14px;
    }
  }

  &._send {
    @include shadow-large;
    min-height: 52px;
    padding: 13px 32px;
    margin-left: auto;
    display: block;
    margin-top: 40px;
    min-width: 200px;
    color: $color-black;
    background: $color-gradient-primary;

    &:active {
      background: $color-gradient-primary-active;
    }

    &._is-only-icon {
      padding: 14px;
    }
  }

  &._view-primary-small {
    @include shadow-large;
    min-height: 40px;
    padding: 8px 16px;
    color: $color-black;
    background: $color-gradient-primary;

    &:active {
      background: $color-gradient-primary-active;
    }

    &._is-only-icon {
      padding: 8px;
    }
  }

  &._view-secondary {
    min-height: 52px;
    padding: 13px 32px;
    color: $color-blue;
    background-color: rgba($color-blue, 0.06);

    &:active {
      background-color: rgba($color-blue, 0.1);
    }

    &._is-only-icon {
      padding: 14px;
    }
  }

  &._view-control {
    padding: 8px 16px;
    color: $color-white;
    background-color: $color-blue;

    &:active {
      background-color: $color-blue-60;
    }

    &._is-only-icon {
      padding: 8px;
    }

    &._state-success {
      color: $color-success;
      background-color: $color-white;
    }
  }

  &._view-control-light {
    padding: 8px 16px;
    color: $color-white;
    background-color: rgba($color-white, 0.1);

    &:active {
      background-color: rgba($color-white, 0.2);
    }

    &._is-only-icon {
      padding: 8px;
    }
  }

  &._view-control-secondary-danger {
    padding: 8px 16px;
    color: $color-red;
    background-color: rgba($color-red, 0.06);

    &:active {
      background-color: rgba($color-red, 0.1);
    }

    &._is-only-icon {
      padding: 8px;
    }
  }

  &._view-control-small {
    padding: 4px 8px;
    color: $color-blue;
    background-color: rgba($color-blue, 0.06);

    &:active {
      background-color: rgba($color-blue, 0.1);
    }
  }

  &._view-control-menu-item {
    padding: 12px 15px 12px 12px;
    color: $color-blue;
    background-color: transparent;

    &:hover {
      background-color: rgba($color-blue, 0.06);
    }

    &._is-only-icon {
      padding: 14px;
    }

    .button__inner {
      justify-content: start;
    }
  }

  &:focus-visible {
    outline: -webkit-focus-ring-color auto 5px;
  }
}
</style>
