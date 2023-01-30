<script lang="ts">
import { defineComponent, PropType } from "vue";
import IconNotificationSuccess from "@/components/icons/IconNotificationSuccess.vue";
import IconNotificationError from "@/components/icons/IconNotificationError.vue";
import IconNotificationWarning from "@/components/icons/IconNotificationWarning.vue";
import IconCross from "@/components/icons/IconCross.vue";

export default defineComponent({
  components: {
    IconCross,
    IconNotificationSuccess,
    IconNotificationError,
    IconNotificationWarning,
  },
  props: {
    type: {
      type: String as PropType<"success" | "error" | "warning">,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  emits: {
    close: () => true,
  },
});
</script>

<template>
  <div class="notification" :class="`_type-${type}`">
    <div class="notification__icon">
      <IconNotificationSuccess v-if="type === 'success'" />
      <IconNotificationWarning v-else-if="type === 'warning'" />
      <IconNotificationError v-else />
    </div>
    <div class="notification__message">{{ message }}</div>
    <div class="notification__close" @click="$emit('close')">
      <IconCross />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.notification {
  @include typography-main(20px, 600);
  @include shadow-medium;
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: $color-white;
  border-radius: $rounding-medium;

  &__icon {
    flex-shrink: 0;
    flex-grow: 0;
    margin-right: 12px;
    line-height: 0;
  }

  &__message {
    flex-shrink: 1;
    flex-grow: 1;
    white-space: pre-wrap;
  }

  &__close {
    flex-shrink: 0;
    flex-grow: 0;
    margin-left: 40px;
    color: $color-black;
    cursor: pointer;
    line-height: 0;
  }

  &._type-success {
    color: $color-success;
  }

  &._type-error {
    color: $color-error;
  }

  &._type-warning {
    color: $color-warning;
  }
}
</style>
