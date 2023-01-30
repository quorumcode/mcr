<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  Ref,
  ref,
} from "vue";

export default defineComponent({
  props: {
    placement: {
      type: String as PropType<"start" | "end" | "fill">,
      default: "start",
    },
    isOpened: {
      type: Boolean,
      default: undefined,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const rootRef = ref() as Ref<HTMLElement>;
    const triggerRef = ref() as Ref<HTMLElement>;
    const contentRef = ref() as Ref<HTMLElement>;
    const isOpenedPrivate = ref(false);

    const isOpenedComputed = computed(() => {
      return props.isOpened === undefined
        ? isOpenedPrivate.value
        : props.isOpened;
    });

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.value?.contains(event.target as Node)) {
        hide();
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleOutsideClick);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleOutsideClick);
    });

    const show = () => {
      isOpenedPrivate.value = true;
    };

    const hide = () => {
      isOpenedPrivate.value = false;
    };

    const toggle = () => {
      if (isOpenedPrivate.value) {
        hide();
      } else {
        show();
      }
    };

    return {
      rootRef,
      triggerRef,
      contentRef,
      isOpenedComputed,
      toggle,
      hide, // public
    };
  },
});
</script>

<template>
  <div
    class="ui-dropdown"
    ref="rootRef"
    :class="{ '_is-disabled': isDisabled }"
  >
    <div class="ui-dropdown__trigger" @click="toggle" ref="triggerRef">
      <slot name="trigger" :isOpened="isOpenedComputed" />
    </div>
    <div
      class="ui-dropdown__content"
      :class="[isOpenedComputed ? '_is-opened' : '', '_pos-' + placement]"
      ref="contentRef"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/zIndex.scss";

.ui-dropdown {
  position: relative;

  &__content {
    @include shadow-medium;
    background-color: $color-white;
    border-radius: $rounding-medium;
    z-index: z-index-popover();
    overflow-y: auto;
    position: absolute;
    left: 0;
    width: max-content;

    &._pos-end {
      left: unset;
      right: 0;
    }

    &._pos-fill {
      width: 100%;
    }

    &:not(._is-opened) {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  &._is-disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>
