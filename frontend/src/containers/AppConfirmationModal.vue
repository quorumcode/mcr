<script lang="ts">
import { defineComponent } from "vue";
import UiModal from "@/components/UiModal.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: {
    UiModal,
    UiButton,
  },
  setup(props, { emit }) {
    const close = () => {
      emit("close");
    };
    const confirm = () => {
      emit("confirm");
    };
    return {
      close,
      confirm,
    };
  },
});
</script>

<template>
  <UiModal @close="close" :show-close-btn="true">
    <div class="confirm-modal">
      <div class="confirm-modal__header">Confirmation required</div>
      <div class="confirm-modal__text">
        <slot v-if="$slots.default" />
        <template v-else>Are you sure?</template>
      </div>
      <div class="confirm-modal__controls">
        <UiButton
          class="confirm-modal__confirm"
          view="primary"
          @click="confirm"
        >
          Confirm
        </UiButton>
        <UiButton class="confirm-modal__cancel" view="secondary" @click="close">
          Cancel
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.confirm-modal {
  &__header {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin-bottom: 12px;
  }

  &__text {
    @include typography-main(18px);
  }

  &__controls {
    margin-top: 40px;
    display: flex;
    justify-content: space-around;
  }
}
</style>
