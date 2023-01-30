<script lang="ts">
import { computed, defineComponent } from "vue";
import UiNotification from "@/components/UiNotification.vue";
import { useCommonStore } from "@/stores/common";

export default defineComponent({
  components: {
    UiNotification,
  },
  setup() {
    const commonStore = useCommonStore();

    return {
      notifications: computed(() => commonStore.notifications),
      closeNotification: commonStore.closeNotification,
    };
  },
});
</script>

<template>
  <transition-group class="notifications" name="list" tag="div">
    <UiNotification
      v-for="notification in notifications"
      :key="notification.id"
      class="notifications__item"
      :type="notification.type"
      :message="notification.message"
      @close="closeNotification(notification.id)"
    />
  </transition-group>
</template>

<style lang="scss" scoped>
@import "@/styles/zIndex.scss";

.notifications {
  position: fixed;
  z-index: z-index-notification();
  top: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  pointer-events: none;

  &__item {
    transition: all 0.3s ease;
    margin-bottom: 12px;
    pointer-events: auto;
    max-width: 90vw;
  }
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>
