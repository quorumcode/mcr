<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { useCommonStore } from "@/stores/common";
import { useUserDeleteStore } from "@/stores/userDelete";
import { useProfileFormStore } from "@/stores/profileForm";
import AppDeleteUserModal from "@/containers/AppDeleteUserModal.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: {
    AppDeleteUserModal,
    UiButton,
  },
  async setup() {
    const commonStore = useCommonStore();
    const store = useProfileFormStore();
    const userDeleteStore = useUserDeleteStore();
    const router = useRouter();

    let isDeleteUserModalOpened = ref(false);

    const deleteUser = async (userId: string) => {
      commonStore.startLoading();
      await userDeleteStore.deleteUser(userId);
      commonStore.showNotification("success", "The user was deleted");
      router.push({ name: routesNames.logout });
      isDeleteUserModalOpened.value = false;
      commonStore.stopLoading();
    };

    const openDeleteUserModel = () => {
      isDeleteUserModalOpened.value = true;
    };

    const closeDeleteUserModel = () => {
      isDeleteUserModalOpened.value = false;
    };

    return {
      userInfo: computed(() => store.userInfo),
      isDeleteUserModalOpened,
      deleteUser,
      openDeleteUserModel,
      closeDeleteUserModel,
    };
  },
});
</script>

<template>
  <div>
    <div class="content">
      <h2 class="content__title">Delete your account</h2>
      <span class="content__subtitle">
        By deleting your account, you are giving 30 days notice after your next
        monthly payment that you will no longer be able to send out review
        requests, receive any reviews, receive any reviews or display your
        reviews on your website or the My Client Reviews platform.
      </span>
    </div>
    <div class="buttons">
      <UiButton
        class="buttons__item-big buttons__item-delete"
        view="control-secondary-danger"
        @click="openDeleteUserModel"
      >
        Delete
      </UiButton>
    </div>

    <teleport to="body">
      <AppDeleteUserModal
        v-if="isDeleteUserModalOpened"
        @close="closeDeleteUserModel"
        @delete="deleteUser"
        :user-id="userInfo.id"
      />
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.buttons {
  display: flex;

  &__item {
    min-width: 184px;

    &:last-child {
      margin-left: auto;
    }
  }

  &__item-big {
    min-height: 52px;
    min-width: 168px;
    margin-left: auto;
  }

  &__item-change {
    margin-bottom: 16px;

    &._no-card {
      margin-left: initial;
    }
  }

  &__item-delete {
    margin: 24px 0 0;
    min-width: 184px;
  }
}

.content {
  &__title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 24px 0 0;
  }

  &__subtitle {
    @include typography-main(12px);
    color: $color-black;
  }
}
</style>
