<script lang="ts">
import { defineComponent, ref } from "vue";
import UiModal from "@/components/UiModal.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: {
    UiModal,
    UiButton,
  },
  emits: {
    close: () => true,
  },
  setup(props, { emit }) {
    const closeModal = () => {
      setTimeout(() => emit("close"), 0);
    };

    const modalContent = ref(null);

    const handleOutsideClick = (event: MouseEvent) => {
      if (!modalContent.value?.contains(event.target)) {
        emit("close");
      }
    };

    return {
      closeModal,
      modalContent,
      handleOutsideClick,
    };
  },
});
</script>

<template>
  <div @click="handleOutsideClick">
    <UiModal class="report-review" :padding="0">
      <div class="report-review__content report-success" ref="modalContent">
        <img
          class="report-review__success-icon"
          src="/src/assets/illustrations/success.svg"
          alt=""
        />
        <h3 class="report-review__title">Thank you!</h3>
        <div class="report-review__message">
          The violation report was successfully sent.
        </div>
        <div class="report-review__buttons">
          <UiButton
            type="button"
            @click="closeModal"
            class="report-review__buttons-item"
            view="primary"
          >
            Close
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/responsive.scss";

.report-review {
  &__content {
    min-width: 548px;
    padding: 40px;

    @include responsive-media((xs, sm)) {
      min-width: initial;
    }
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    margin-bottom: 24px;
    color: $color-blue;
  }

  &__message {
    @include typography-main(12px);
    margin: 0;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-item {
      margin: 40px 0 0 auto;
      min-width: 184px;
    }
  }

  &__success-icon {
    margin-bottom: 24px;
    height: 74px;
  }
}
</style>
