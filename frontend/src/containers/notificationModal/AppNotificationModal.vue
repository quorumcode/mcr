<script lang="ts">
import { computed, defineComponent } from "vue";
import UiModal from "@/components/UiModal.vue";
import IconNotificationError from "@/components/icons/IconNotificationError.vue";
import UiButton from "@/components/UiButton.vue";
import { useNotificationModalStore } from "@/containers/notificationModal/store";
import IconNotificationSuccess from "@/components/icons/IconNotificationSuccess.vue";
import IconNotificationWarning from "@/components/icons/IconNotificationWarning.vue";

export default defineComponent({
  components: {
    IconNotificationWarning,
    IconNotificationSuccess,
    UiButton,
    IconNotificationError,
    UiModal,
  },
  setup() {
    const store = useNotificationModalStore();
    const modalConfig = computed(() => store.modalConfig);

    const close = () => {
      if (modalConfig.value?.closeOnClickOutside) {
        store.closeModal();
      }
    };

    return {
      modalConfig,
      close,
      isModalOpened: computed(() => store.isModalOpened),
      triggerPrimaryAction: store.triggerPrimaryAction,
      triggerSecondaryAction: store.triggerSecondaryAction,
    };
  },
});
</script>

<template>
  <UiModal v-if="isModalOpened" class="ui-error-modal" @close="close">
    <IconNotificationSuccess
      v-if="modalConfig?.type === 'success'"
      class="ui-error-modal__icon"
    />
    <IconNotificationWarning
      v-else-if="modalConfig?.type === 'warning'"
      class="ui-error-modal__icon"
    />
    <IconNotificationError
      v-else-if="modalConfig?.type === 'error'"
      class="ui-error-modal__icon"
    />
    <h3 v-if="modalConfig?.title" class="ui-error-modal__title">
      {{ modalConfig.title }}
    </h3>
    <p v-if="modalConfig?.message" class="ui-error-modal__message">
      {{ modalConfig.message }}
    </p>
    <div class="ui-error-modal__buttons">
      <UiButton
        v-if="modalConfig?.secondaryButton"
        class="ui-error-modal__button"
        view="secondary"
        @click="triggerSecondaryAction"
      >
        {{ modalConfig.secondaryButton.title }}
      </UiButton>
      <UiButton
        v-if="modalConfig?.primaryButton"
        class="ui-error-modal__button"
        @click="triggerPrimaryAction"
      >
        {{ modalConfig.primaryButton.title }}
      </UiButton>
    </div>
  </UiModal>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.ui-error-modal {
  &__icon {
    width: 60px;
    height: 60px;
    display: block;
    margin-bottom: 24px;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    color: $color-blue;
  }

  &__message {
    margin: 0;
    margin-bottom: 40px;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__button {
    min-width: 184px;

    &:not(:last-child) {
      margin-right: 24px;
    }
  }
}
</style>
