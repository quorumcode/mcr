<script lang="ts">
import { useResponsive } from "@/helpers/useResponsive";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

export default defineComponent({
  emits: {
    close: () => true,
  },
  props: {
    isFullWindow: {
      type: Boolean,
      default: false,
    },
    shrinkToWindow: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>();
    const pageScroll = ref(0);
    const { isMobile } = useResponsive();

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.value?.contains(event.target as Node | null)) {
        emit("close");
      }
    };

    onMounted(() => {
      const app = document.getElementById("app");
      if (app) {
        if (isMobile.value) {
          pageScroll.value = parseInt(app.style.top) * -1 || window.scrollY;
          app.style.position = "fixed";
          app.style.top = `-${pageScroll.value}px`;
          document.body.style.overflowY = "scroll";
        } else {
          document.body.style.overflowY = "hidden";
          if (document.body.clientHeight > window.innerHeight) {
            document.body.style.marginRight = "10px";
          }
        }
      }
    });

    onBeforeUnmount(() => {
      if (document.querySelectorAll(".ui-base-modal").length === 1) {
        const app = document.getElementById("app");
        if (app) {
          document.body.style.overflowY = "";
          document.body.style.marginRight = "";
          if (isMobile.value) {
            app.style.position = "";
            app.style.top = "";
            window.scrollTo(0, pageScroll.value);
          }
        }
      }
    });

    return {
      containerRef,
      handleOutsideClick,
    };
  },
});
</script>

<template>
  <div
    class="ui-base-modal"
    :class="{
      '_is-full-window': isFullWindow,
      '_shrink-to-window': shrinkToWindow,
    }"
    @click="handleOutsideClick"
  >
    <div class="ui-base-modal__background"></div>
    <div ref="containerRef" class="ui-base-modal__container">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";
@import "@/styles/zIndex.scss";
@import "@/styles/responsive.scss";

.ui-base-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  z-index: z-index-overlay();
  overflow: auto;
  box-sizing: border-box;

  @include responsive-media((xs, sm)) {
    position: absolute;
  }

  &__background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba($color-black, 0.6);
  }

  &._is-full-window {
    .ui-base-modal__container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  &:not(._is-full-window) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 20px;

    .ui-base-modal__container {
      flex-shrink: 0;
      flex-grow: 0;
      position: relative;
      min-height: 0;
    }

    &::before {
      content: "";
      flex-shrink: 1;
      flex-grow: 1;
    }

    &::after {
      content: "";
      flex-shrink: 1;
      flex-grow: 2;
    }

    &._shrink-to-window {
      .ui-base-modal__container {
        flex-shrink: 1;
      }
    }
  }
}
</style>
