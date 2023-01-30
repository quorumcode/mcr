<script lang="ts">
import { defineComponent } from "vue";
import UiBaseModal from "@/components/UiBaseModal.vue";
import IconCross from "@/components/icons/IconCross.vue";
import { useResponsive } from "@/helpers/useResponsive";

export default defineComponent({
  components: { IconCross, UiBaseModal },
  props: {
    shrinkToWindow: {
      type: Boolean,
      default: false,
    },
    showCloseBtn: {
      type: Boolean,
      default: false,
    },
    padding: {
      type: Number,
      default: 30,
    },
  },
  emits: {
    close: () => true,
  },
  setup() {
    const { isMobile } = useResponsive();

    return { isMobile };
  },
});
</script>

<template>
  <UiBaseModal
    :is-full-window="isMobile"
    :shrink-to-window="shrinkToWindow"
    @close="$emit('close')"
  >
    <div
      class="ui-modal__close"
      :class="{ '_show-close-btn': showCloseBtn }"
      @click="$emit('close')"
    >
      <IconCross />
    </div>
    <div class="ui-modal__content" :style="`padding: ${padding}px`">
      <slot />
    </div>
  </UiBaseModal>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";
@import "@/styles/zIndex.scss";
@import "@/styles/responsive.scss";

.ui-modal {
  &__content {
    @include shadow-large;
    position: relative;
    padding: 30px;
    box-sizing: border-box;
    min-height: 100%;
    background-color: $color-white;
    border-radius: $rounding-large;
  }

  &__close {
    cursor: pointer;
    position: absolute;
    top: 48px;
    right: 24px;
    z-index: z-index-overlay(1);

    &._show-close-btn {
      display: block;
      top: 8px;
      right: 10px;
    }
  }
}

@include responsive-media((md, xl)) {
  .ui-modal {
    &__close {
      display: none;
    }
  }
}

@include responsive-media((xs, sm)) {
  .ui-modal {
    &__content {
      min-height: calc(100% - 24px);
      border-radius: $rounding-large $rounding-large 0 0;
      margin-top: 24px;
      padding-top: 60px;
    }
    &__close._show-close-btn {
      top: 32px;
    }
  }
}
</style>
