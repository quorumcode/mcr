<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref, watch } from "vue";
import UiButton from "@/components/UiButton.vue";
import IconPhoto from "@/components/icons/IconPhoto.vue";
import { getImage } from "@/helpers/getImage";

interface Transformation {
  maxWidth: number;
  maxHeight: number;
}

export default defineComponent({
  components: { IconPhoto, UiButton },
  props: {
    modelValue: {
      type: String,
      default: undefined,
    },
    // Link to an image that was uploaded earlier
    prevUrl: {
      type: String,
      default: "",
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    transformation: {
      type: Object as PropType<Transformation>,
      default: undefined,
    },
  },
  emits: {
    "update:modelValue": (payload: string) => payload,
  },
  setup(props, { emit }) {
    const inputRef = ref() as Ref<HTMLInputElement>;
    const dropAreaRef = ref() as Ref<HTMLElement>;
    const canvasRef = ref() as Ref<HTMLCanvasElement>;
    const uploadedObject = ref<{ file: File; image: HTMLImageElement }>();
    const isDropAreaHighlighted = ref(false);

    const hasFile = computed(() => !!uploadedObject.value);

    const processFile = async (file) => {
      try {
        const image = await getImage(window.URL.createObjectURL(file));
        uploadedObject.value = { file, image };
      } catch {
        uploadedObject.value = undefined;
      }
    };

    const handleFileChange = () => {
      processFile(inputRef.value.files[0]);
    };

    const deleteFile = () => {
      uploadedObject.value = undefined;
      emit("update:modelValue", "");
    };

    const hasBeenRemoved = computed(() => {
      return props.modelValue === "";
    });

    const highlightDropArea = () => {
      isDropAreaHighlighted.value = true;
    };

    const unHighlightDropArea = () => {
      isDropAreaHighlighted.value = false;
    };

    const handleDrop = (e: DragEvent) => {
      unHighlightDropArea();
      const dragFile = e.dataTransfer.files[0];
      if (dragFile) {
        processFile(dragFile);
      }
    };

    watch(uploadedObject, async () => {
      if (!uploadedObject.value) {
        return;
      }

      const image = uploadedObject.value?.image;

      let calculatedWidth = 0;
      let calculatedHeight = 0;

      if (props.transformation) {
        const xRate = props.transformation.maxWidth / image.width;
        const yRate = props.transformation.maxHeight / image.height;
        const minRate = Math.min(xRate, yRate);
        if (minRate >= 1) {
          calculatedWidth = props.transformation.maxWidth;
          calculatedHeight = props.transformation.maxHeight;
        } else {
          calculatedWidth = image.width * minRate;
          calculatedHeight = image.height * minRate;
        }
      }

      canvasRef.value.width = calculatedWidth;
      canvasRef.value.height = calculatedHeight;
      const ctx = canvasRef.value?.getContext("2d") as CanvasRenderingContext2D;
      ctx.drawImage(image, 0, 0, calculatedWidth, calculatedHeight);
      emit("update:modelValue", canvasRef.value?.toDataURL());
    });

    return {
      inputRef,
      dropAreaRef,
      canvasRef,
      handleFileChange,
      deleteFile,
      hasFile,
      isDropAreaHighlighted,
      highlightDropArea,
      unHighlightDropArea,
      handleDrop,
      hasBeenRemoved,
    };
  },
});
</script>

<template>
  <div
    class="upload"
    :class="{ 'is-highlighted': isDropAreaHighlighted }"
    ref="dropAreaRef"
    @dragenter.prevent.stop="highlightDropArea"
    @dragover.prevent.stop="highlightDropArea"
    @dragleave.prevent.stop="unHighlightDropArea"
    @drop.prevent.stop="handleDrop"
  >
    <canvas ref="canvasRef" class="upload__canvas" />
    <div class="upload__preview">
      <div class="preview">
        <div class="preview__wrapper">
          <img v-if="modelValue" :src="modelValue" class="preview__image" />
          <img
            v-else-if="prevUrl && !hasBeenRemoved"
            :src="prevUrl"
            class="preview__image"
          />
          <div v-else class="preview__stub">
            <IconPhoto />
          </div>
        </div>
      </div>
    </div>
    <div class="upload__buttons buttons">
      <UiButton
        v-if="(modelValue || prevUrl) && !hasBeenRemoved"
        class="buttons__item"
        view="control-secondary"
        @click="deleteFile"
      >
        Delete Logo
      </UiButton>
      <UiButton class="buttons__item upload-button" tag="label" view="control">
        Browse File
        <input
          ref="inputRef"
          class="upload-button__input"
          type="file"
          accept="image/*"
          @change="handleFileChange"
        />
      </UiButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.upload {
  display: flex;
  align-items: flex-end;

  &__canvas {
    display: none;
  }

  &__preview {
    max-width: 212px;
    width: 212px;
    margin-right: 24px;
  }

  &__buttons {
    width: 184px;
  }

  &.is-highlighted {
    .preview {
      border-color: $color-green;
      background: $color-green-10;
    }
  }
}

.preview {
  max-width: 212px;
  padding-bottom: 140px;
  position: relative;
  background-color: $color-blue-006;
  border: 2px dashed $color-blue-40;
  border-radius: $rounding-medium;
  overflow: hidden;

  &__wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__image {
    max-width: 100%;
    max-height: 100%;
  }

  &__stub {
    opacity: 0.4;
    line-height: 0;
    color: $color-blue;
  }
}

.buttons {
  &__item {
    display: block;
    width: 100%;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.upload-button {
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
</style>
