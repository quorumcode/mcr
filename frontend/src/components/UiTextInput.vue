<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  Ref,
  ref,
  toRef,
  watch,
} from "vue";
import IMask from "imask";

type Size = "medium" | "small";

export default defineComponent({
  props: {
    modelValue: {
      type: [String, Number],
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
    mask: {
      type: Object,
      default: undefined,
    },
    maskCardDateRange: {
      type: Boolean,
      default: false,
    },
    maskNumberRange: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
    type: {
      type: String,
      default: "text" as PropType<"text" | "password" | "number">,
    },
    isWhite: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<Size>,
      default: "medium",
    },
    place: {
      type: String,
      default: "",
    },
    isFocus: {
      type: Boolean,
      default: false,
    },
    disableAutocomplete: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    "update:modelValue": (payload: string) => typeof payload === "string",
    "blur:modelValue": (payload: string) => typeof payload === "string",
    showMaskToolip: () => true,
    hideMaskToolip: () => true,
    mounted: (ref: HTMLInputElement) => ref,
  },
  setup(props, { emit, slots }) {
    const inputRef = ref() as Ref<HTMLInputElement>;
    const maskedValue = ref("");
    let mask: IMask;

    const value = computed(() => {
      if (mask) {
        return maskedValue.value;
      }
      return props.modelValue;
    });

    const isNumber = props.type === "number";

    const handleAccept = () => {
      maskedValue.value = mask.value;
      emit("update:modelValue", mask.unmaskedValue);
    };

    const handleInput = (event: InputEvent) => {
      const element = event.currentTarget as HTMLInputElement;
      let value = element.value;

      if (props.maskNumberRange.length) {
        if (mask) {
          if (
            +value < props.maskNumberRange[0] ||
            +value > props.maskNumberRange[1]
          ) {
            emit("showMaskToolip");
            return;
          } else {
            emit("hideMaskToolip");
          }
        }
      }

      if (mask) {
        return;
      }

      if (
        isNumber &&
        props.modelValue < 10 &&
        event.inputType.startsWith("delete")
      ) {
        element.value = "";
        value = "";
      } else if (isNumber && !+value) {
        element.value = props.modelValue;
        return;
      }
      emit("update:modelValue", value);
    };

    const handleBlur = (event: InputEvent) => {
      const element = event.currentTarget as HTMLInputElement;
      const value = element.value;
      emit("blur:modelValue", value);
    };

    const focus = () => {
      inputRef.value?.focus();
    };

    const hasPrefix = computed(() => !!slots.prefix);
    const hasSuffix = computed(() => !!slots.suffix);

    onMounted(() => {
      if (props.mask) {
        if (props.maskCardDateRange) {
          mask = IMask(inputRef.value, {
            mask: "MM / YY",
            blocks: {
              YY: {
                mask: "00",
              },
              MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12,
              },
            },
          });
        }
        if (props.maskNumberRange.length) {
          mask = IMask(inputRef.value, {
            mask: Number,
            min: props.maskNumberRange[0],
            max: props.maskNumberRange[1],
          });
        } else {
          mask = IMask(inputRef.value, props.mask);
        }
        mask.on("accept", handleAccept);
      }
      if (props.isFocus) {
        focus();
      }
      emit("mounted", inputRef.value);
    });

    onBeforeUnmount(() => {
      if (mask) {
        mask.destroy();
      }
    });

    watch(toRef(props, "modelValue"), (value) => {
      if (mask) {
        mask.unmaskedValue = value;
      }
    });

    return {
      value,
      inputRef,
      hasPrefix,
      hasSuffix,
      handleAccept,
      handleInput,
      handleBlur,
      focus,
    };
  },
});
</script>

<template>
  <div
    class="text-input"
    :class="[
      {
        '_has-error': hasError,
        '_is-disabled': isDisabled,
        '_is-white': isWhite,
        '_is-by-bcc': place === 'byBCC',
      },
      `_size-${size}`,
    ]"
  >
    <div v-if="hasPrefix" class="text-input__part _prefix">
      <slot name="prefix" />
    </div>
    <input
      ref="inputRef"
      class="text-input__input"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="isDisabled"
      @input="handleInput"
      @blur="handleBlur"
      :autocomplete="disableAutocomplete ? 'new-password' : ''"
    />
    <div v-if="hasSuffix" class="text-input__part _suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.text-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid $color-blue-006;
  background-color: $color-blue-006;
  background-clip: padding-box;
  color: $color-black;
  outline: none;
  height: 48px;
  padding: 0 12px;
  transition: border-color 0.2s;
  border-radius: $rounding-medium;

  &__part {
    color: $color-blue-40;
    line-height: 0;
    flex-shrink: 0;
    flex-grow: 0;

    &._prefix {
      margin-right: 8px;
    }

    &._suffix {
      margin-left: 8px;
    }
  }

  &__input {
    @include typography-main(14px);
    box-sizing: border-box;
    background: none;
    border: 0;
    outline: none;
    height: 100%;
    width: 100%;
    flex-shrink: 1;
    flex-grow: 1;

    &::placeholder {
      color: rgba($color-blue-60, 0.6);
    }

    &:hover::placeholder {
      color: rgba($color-blue, 1);
    }

    &[type="number"] {
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  }

  &._is-white {
    background-color: $color-white;
    border-color: $color-white;
  }

  &:focus-within {
    border-color: $color-blue-20;
    background-color: $color-white;
  }

  &._has-error {
    border-color: $color-error-border;

    .text-input__input {
      color: $color-error;
    }

    &:not(:focus-within) {
      background-color: $color-error-background;
    }
  }

  &._is-disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  &._size-small {
    height: 36px;

    .text-input__input {
      @include typography-main(14px);
    }
  }

  &._is-by-bcc {
    input {
      text-align: center;
      color: $color-blue;
    }

    &._is-disabled input {
      color: $color-blue-40;
    }
  }
}
</style>
