<script lang="ts">
import { defineComponent, PropType, Ref, ref } from "vue";
import IconUpload from "@/components/icons/IconUpload.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: { UiButton, IconUpload },
  props: {
    isDisabled: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Browse File",
    },
    view: {
      type: String as PropType<"button", "dropArea">,
      default: "button",
    },
    accept: {
      type: String,
      default: "",
    },
  },
  emits: {
    "update:modelValue": (payload: File) => payload,
  },
  setup(props, { emit }) {
    const inputRef = ref() as Ref<HTMLInputElement>;
    const dropAreaRef = ref() as Ref<HTMLElement>;
    const isDropAreaHighlighted = ref(false);

    const highlightDropArea = () => {
      isDropAreaHighlighted.value = true;
    };

    const unHighlightDropArea = () => {
      isDropAreaHighlighted.value = false;
    };

    const handleDrop = (e: DragEvent) => {
      unHighlightDropArea();
      const dragFile = e.dataTransfer?.files[0];
      if (dragFile) {
        emit("update:modelValue", dragFile);
      }
    };

    const handleFileChange = () => {
      const files = inputRef.value.files || [];
      emit("update:modelValue", files[0]);
    };

    const clickInput = () => {
      inputRef.value.click();
    };

    return {
      inputRef,
      dropAreaRef,
      highlightDropArea,
      unHighlightDropArea,
      isDropAreaHighlighted,
      handleDrop,
      handleFileChange,
      clickInput,
    };
  },
});
</script>

<template>
  <label class="ui-file-upload">
    <span
      v-if="view === 'dropArea'"
      class="drop-area"
      :class="{ '_is-highlighted': isDropAreaHighlighted }"
      ref="dropAreaRef"
      @dragenter.prevent.stop="highlightDropArea"
      @dragover.prevent.stop="highlightDropArea"
      @dragleave.prevent.stop="unHighlightDropArea"
      @drop.prevent.stop="handleDrop"
    >
      <span class="title">
        <IconUpload class="title__icon" />
        {{ title }}
      </span>
    </span>

    <UiButton
      v-else
      view="control"
      :is-disabled="isDisabled"
      @click="clickInput"
    >
      {{ title }}
    </UiButton>

    <input
      ref="inputRef"
      class="ui-file-upload__input"
      type="file"
      :disabled="isDisabled"
      :accept="accept"
      @change="handleFileChange"
    />
  </label>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.ui-file-upload {
  cursor: pointer;
  position: relative;

  &__input {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
}

.drop-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: $color-blue-06;
  border: 2px dashed $color-blue-40;
  border-radius: $rounding-medium;

  &._is-highlighted {
    border-color: $color-green;
    background: $color-green-10;
  }
}

.title {
  @include typography-main(16px, 600);
  pointer-events: none;
  display: flex;
  align-items: center;
  color: $color-blue;

  &__icon {
    margin-right: 12px;
  }
}
</style>
