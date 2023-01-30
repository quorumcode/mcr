<script lang="ts">
import { defineComponent, PropType } from "vue";
import UiTextInput from "@/components/UiTextInput.vue";

type Size = "medium" | "small";

export default defineComponent({
  components: { UiTextInput },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    size: {
      type: String as PropType<Size>,
      default: "medium",
    },
  },
  emits: {
    "update:modelValue": (payload: string) => typeof payload === "string",
  },
  setup(props, { emit }) {
    const handleInput = (value: string) => {
      emit("update:modelValue", value);
    };

    const handleInputFromPicker = (e: InputEvent) => {
      emit("update:modelValue", e.target.value.substring(1));
    };

    return { handleInput, handleInputFromPicker };
  },
});
</script>

<template>
  <div class="ui-color-picker">
    <UiTextInput
      :size="size"
      :model-value="modelValue"
      @update:modelValue="handleInput"
    />
    <label class="ui-color-picker__picker picker">
      <div v-if="modelValue === 'transparent'" class="preset-transparent">
        <div class="preset-transparent-border" />
        <div class="preset-transparent-top" />
        <div class="preset-transparent-bot" />
      </div>
      <span
        v-else
        class="picker__preview"
        :style="`color: #${modelValue}`"
        tabindex="0"
        @keydown.space.prevent="$refs['color-input'].click()"
      />

      <input
        ref="color-input"
        class="picker__input"
        type="color"
        tabindex="-1"
        @input="handleInputFromPicker"
      />
    </label>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.ui-color-picker {
  position: relative;

  &__picker {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 24px;
    transform: translateY(-50%);
  }
}

.picker {
  &__preview {
    display: block;
    width: 24px;
    height: 24px;
    background-color: currentColor;
    border: 2px solid rgba($color-black, 0.2);
    box-sizing: border-box;
    cursor: pointer;
    border-radius: $rounding-small;
    background-clip: border-box;
  }

  &__input {
    position: absolute;
    opacity: 0;
  }
}

.preset-transparent {
  overflow: hidden;
  position: relative;
  background-color: #fff;
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: $rounding-small;
  background-clip: border-box;

  &-border {
    border: 2px solid rgba(30, 43, 153, 0.1);
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: $rounding-small;
    z-index: 2;
  }

  &-top {
    background-color: #c4c4c4;
    width: 50%;
    height: 50%;
    z-index: 1;
  }

  &-bot {
    background-color: #c4c4c4;
    width: 50%;
    height: 50%;
    right: 0;
    bottom: 0;
    position: absolute;
    z-index: 1;
  }
}
</style>
