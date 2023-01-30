<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import UiModal from "@/components/UiModal.vue";
import { useAdminBanModalStore } from "./store";
import IconNotificationWarning from "@/components/icons/IconNotificationWarning.vue";
import UiButton from "@/components/UiButton.vue";

enum ActionType {
  "ban" = "ban",
  "restore" = "restore",
}

export default defineComponent({
  components: { UiButton, IconNotificationWarning, UiModal },
  props: {
    actionType: {
      type: String as PropType<ActionType>,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
  },
  emits: {
    close: () => true,
    complete: () => true,
  },
  async setup(props, { emit }) {
    const store = useAdminBanModalStore();

    const action = async () => {
      if (props.actionType === ActionType.ban) {
        await store.ban();
      } else {
        await store.restore();
      }
      emit("complete");
      emit("close");
    };

    await store.fetchData(props.companyId);

    return {
      company: computed(() => store.company),
      userInfo: computed(() => store.userInfo),
      action,
    };
  },
});
</script>

<template>
  <UiModal class="ban-modal">
    <div class="ban-modal__content">
      <IconNotificationWarning class="ban-modal__icon" />
      <h3 class="ban-modal__title">
        <template v-if="actionType === 'ban'"> Ban user? </template>
        <template v-else> Restore user? </template>
      </h3>
      <ul class="ban-modal__message">
        <li>
          <template v-if="actionType === 'ban'">
            Company <strong>{{ company?.name }}</strong> will be removed
          </template>
          <template v-else>
            Company <strong>{{ company?.name }}</strong> will be restored
          </template>
        </li>
        <li>
          <template v-if="actionType === 'ban'">
            User <strong>{{ userInfo?.name }}</strong> (email:
            <strong>{{ userInfo?.email }}</strong
            >) will be banned.
          </template>
          <template v-else>
            User <strong>{{ userInfo?.name }}</strong> (email:
            <strong>{{ userInfo?.email }}</strong
            >) will be restored.
          </template>
        </li>
      </ul>
      <div class="ban-modal__buttons">
        <UiButton view="secondary" @click="$emit('close')">Cancel</UiButton>
        <UiButton @click="action">
          <template v-if="actionType === 'ban'">Ban</template>
          <template v-else>Restore</template>
        </UiButton>
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
