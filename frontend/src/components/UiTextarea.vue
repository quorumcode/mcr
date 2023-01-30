<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  ref,
  watch,
} from "vue";

interface Counter {
  max: number;
}

type HighlightInterval = [startChar: number, endChar: number];

export default defineComponent({
  props: {
    modelValue: {
      type: String,
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
    minHeight: {
      type: Number,
      default: 0,
    },
    maxHeight: {
      type: Number,
      default: 0,
    },
    counter: {
      type: Object as PropType<Counter>,
      default: undefined,
    },
    highlightedIntervals: {
      type: Array as PropType<HighlightInterval[]>,
      default: () => [],
    },
    isWhite: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
      default: "",
    },
  },
  emits: {
    "update:modelValue": (payload: string) => typeof payload === "string",
  },
  setup(props, { emit }) {
    const inputRef = ref<HTMLTextAreaElement>();
    const highlightRef = ref<HTMLElement>();
    const height = ref(props.minHeight);

    const focus = () => {
      inputRef.value?.focus();
    };

    const handleInput = (event: InputEvent) => {
      calculateHeight(inputRef.value);
      emit("update:modelValue", event.currentTarget?.value);
    };

    const calculateHeight = (ref: HTMLTextAreaElement | undefined) => {
      if (!ref) return;
      height.value = 0;
      nextTick(() => {
        const offsetsHeight = ref.offsetHeight - ref.clientHeight;
        let newHeight = offsetsHeight + ref.scrollHeight;
        newHeight = newHeight > props.minHeight ? newHeight : props.minHeight;
        newHeight =
          props.maxHeight && newHeight > props.maxHeight
            ? props.maxHeight
            : newHeight;
        height.value = newHeight;
      });
    };

    const charactersLeft = computed(() => {
      if (!props.counter) {
        return 0;
      }
      return props.counter.max - props.modelValue.length;
    });

    const highlightedHtml = computed(() => {
      const { html } = props.highlightedIntervals.reduce(
        (result, interval) => {
          const start = interval[0] + result.offset;
          const end = interval[1] + result.offset;
          const word = result.html.substring(start, end + 1);
          const replacement = `<mark>${word}</mark>`;
          result.offset += replacement.length - word.length;
          result.html = [
            result.html.slice(0, start),
            replacement,
            result.html.slice(end + 1),
          ].join("");
          return result;
        },
        { html: props.modelValue, offset: 0 }
      );
      return html;
    });

    const scrollHighlight = () => {
      if (highlightRef.value) {
        if (highlightRef.value.scrollHeight > highlightRef.value.offsetHeight) {
          //Fix for weird misaligned hightlight on android
          highlightRef.value.style.overflow = "scroll";
        }
        highlightRef.value.scrollTop = inputRef.value?.scrollTop || 0;
      } else {
        setTimeout(scrollHighlight, 100);
      }
    };

    watch(
      //hightlightRef doesn't work on addReview for some reason
      () => props.highlightedIntervals.length,
      () => {
        scrollHighlight();
      }
    );

    onMounted(() => {
      calculateHeight(inputRef.value);
      inputRef.value?.addEventListener("scroll", (ev) => {
        scrollHighlight();
      });
    });

    return {
      inputRef,
      highlightRef,
      focus,
      height,
      charactersLeft,
      handleInput,
      highlightedHtml,
    };
  },
});
</script>

<template>
  <div class="ui-textarea">
    <textarea
      ref="inputRef"
      class="ui-textarea__input"
      :class="{
        '_has-error': hasError,
        '_is-disabled': isDisabled,
        '_is-white': isWhite,
        '_is-review': place === 'review',
      }"
      :style="`height: ${height || 'auto'}px`"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      @input="handleInput"
    />
    <div
      v-if="highlightedIntervals.length"
      ref="highlightRef"
      class="ui-textarea__highlight"
      v-html="highlightedHtml"
    />
    <div
      v-if="counter"
      class="ui-textarea__counter"
      :class="{ '_has-error': charactersLeft < 0 }"
    >
      {{ charactersLeft }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/responsive.scss";

.ui-textarea {
  position: relative;

  &__input {
    @include typography-main(14px);
    display: block;
    box-sizing: border-box;
    border: 2px solid $color-blue-006;
    background-color: $color-blue-006;
    background-clip: padding-box;
    outline: none;
    min-height: 52px;
    padding: 14px 12px;
    transition: border-color 0.2s;
    border-radius: $rounding-medium;
    resize: none;
    width: 100%;
    min-width: 100%;
    max-width: 100%;

    &::placeholder {
      color: rgba($color-blue-60, 0.6);
    }

    &:hover::placeholder {
      color: rgba($color-blue, 1);
    }

    &:focus {
      border-color: $color-blue-20;
      background-color: $color-white;
    }

    &._has-error {
      border-color: $color-error-border;
      color: $color-error;

      &:not(:focus) {
        background-color: $color-error-background;
      }
    }

    &._is-disabled {
      pointer-events: none;
      opacity: 0.6;
    }

    &._is-white {
      background-color: $color-white;
      border-color: $color-white;
    }
  }

  &__highlight {
    @include typography-main(14px);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 14px 12px;
    box-sizing: border-box;
    border: 2px solid transparent;
    color: transparent;
    pointer-events: none;
    white-space: pre-line;
    overflow: auto;
    scrollbar-color: transparent transparent;

    :deep(mark) {
      background-color: $color-error;
      color: $color-white;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      color: transparent;
    }
  }

  &__counter {
    position: absolute;
    bottom: 12px;
    right: 12px;

    &._has-error {
      color: $color-error;
    }
  }

  &:not(:focus-within) {
    .ui-textarea__counter {
      color: rgba($color-blue-60, 0.6);

      &._has-error {
        color: $color-error;
      }
    }
  }
}

@include responsive-media((xs, sm)) {
  ._is-review {
    height: 180px !important;
  }
}
</style>
