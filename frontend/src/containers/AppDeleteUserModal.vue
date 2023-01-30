<script lang="ts">
import { defineComponent } from "vue";
import UiModal from "@/components/UiModal.vue";
import IconNotificationWarning from "@/components/icons/IconNotificationWarning.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: { UiButton, IconNotificationWarning, UiModal },
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  emits: {
    close: () => true,
    delete: () => true,
  },
});
</script>

<template>
  <UiModal class="ban-modal">
    <div class="ban-modal__content">
      <IconNotificationWarning class="ban-modal__icon" />
      <h3 class="ban-modal__title">Delete your account?</h3>
      <div class="ban-modal__message">
        If you delete your account, your company review page won't be accessible
        to the public and your subscription will be cancelled.
      </div>
      <div class="ban-modal__buttons">
        <UiButton view="secondary" @click="$emit('close')">Cancel</UiButton>
        <UiButton @click="$emit('delete', userId)">Delete</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.ban-modal {
  &__content {
    min-width: 300px;
  }

  &__icon {
    width: 60px;
    height: 60px;
    display: block;
    margin-bottom: 24px;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    margin-bottom: 24px;
    color: $color-blue;
  }

  &__message {
    margin: 0;
    margin-bottom: 40px;
    max-width: 500px;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
