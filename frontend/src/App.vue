<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { ClientOnly } from "vite-ssr";
import { useRouter, useRoute } from "vue-router";
import { routesNames } from "@/routesNames";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { provideResponsive } from "@/helpers/useResponsive";
import { provideAdminEventBus } from "@/admin/helpers/useAdminEventBus";
import { provideLiveChat } from "@/helpers/useLiveChat";
import AppNotifications from "@/containers/AppNotifications.vue";
import AppReviewModal from "@/containers/reviewModal/AppReviewModal.vue";
import AppNotificationModal from "@/containers/notificationModal/AppNotificationModal.vue";
import UiModal from "@/components/UiModal.vue";

export default defineComponent({
  components: {
    AppNotificationModal,
    AppReviewModal,
    UiModal,
    ClientOnly,
    AppNotifications,
  },
  setup() {
    provideResponsive();
    provideAdminEventBus();
    provideLiveChat();
    const commonStore = useCommonStore();
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    const hasActiveSubscription = computed(
      () => userStore.hasActiveSubscription
    );

    const DEFAULT_PAGE_TITLE =
      (import.meta.env.VITE_DEFAULT_PAGE_TITLE as string) ||
      "My Client Reviews";

    onMounted(() => {
      if (route?.meta?.title) {
        document.title = `${route.meta.title} | ${DEFAULT_PAGE_TITLE}`;
      } else {
        document.title = DEFAULT_PAGE_TITLE;
      }

      if (
        route?.meta?.requiresAuth &&
        !userStore.info?.id &&
        !route.query.confirmationToken
      ) {
        router.push({
          name: routesNames.login,
          query: { redirect: route.fullPath },
        });
        return;
      }

      const iAmCompanyOwner = userStore?.info?.company?._id === route.params.id;
      if (
        route.meta?.iAmCompanyOwner &&
        !(
          iAmCompanyOwner || userStore?.info?.permissions?.canEditAllCompanies
        ) &&
        !route.query.confirmationToken
      ) {
        router.push({
          name: routesNames.companyProfile,
          params: { id: route?.params?.id },
        });
        return;
      }

      if (route?.meta?.requiresSubscription && !hasActiveSubscription.value) {
        commonStore.showNotification(
          "warning",
          "Please purchase subscription to regain access to the platform"
        );
        router.push({
          name: routesNames.companyEditSubscription,
          params: { id: userStore.info?.company?._id },
        });
        return;
      }
    });

    router.afterEach(() => {
      if (route?.meta?.title) {
        document.title = `${route.meta.title} | ${DEFAULT_PAGE_TITLE}`;
      } else {
        document.title = DEFAULT_PAGE_TITLE;
      }

      window.scrollTo(0, 0);
    });

    return {
      isLoading: computed(() => commonStore.isLoading),
      isFirstLoadingFix: computed(() => commonStore.isFirstLoadingFix),
    };
  },
});
</script>

<template>
  <div>
    <div v-if="isFirstLoadingFix" class="first-loading">
      <div class="loader"></div>
    </div>
    <div v-show="!isFirstLoadingFix" class="app" style="visibility: hidden">
      <div v-if="isLoading" class="loader" />
      <ClientOnly>
        <teleport to="body">
          <AppReviewModal />
          <AppNotificationModal />
          <AppNotifications />
        </teleport>
      </ClientOnly>
      <RouterView v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </RouterView>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/zIndex.scss";

.first-loading {
  color: $color-black;
  background-color: $color-white;
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  overflow-x: hidden;
}

@keyframes loader {
  0% {
    transform: translateX(-50%) scaleX(0);
  }
  10% {
    transform: translateX(-50%) scaleX(0.1);
  }
  50% {
    transform: translateX(0) scaleX(0.5);
  }
  90% {
    transform: translateX(50%) scaleX(0.1);
  }
  100% {
    transform: translateX(50%) scaleX(0);
  }
}

.app {
  visibility: visible !important;
}

.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: $color-blue-20;
  overflow: hidden;
  z-index: z-index-overlay();

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $color-blue;
    animation: loader 2s linear infinite;
  }
}
</style>

<style lang="scss">
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

$scrollbar-track-color: transparent;
$scrollbar-thumb-color: $color-blue-40;
$scrollbar-thumb-hover-color: $color-blue-20;

@font-face {
  font-family: Poppins;
  src: url("@/assets/fonts/Poppins-Regular.ttf");
}

@font-face {
  font-family: Poppins;
  font-weight: 600;
  src: url("@/assets/fonts/Poppins-SemiBold.ttf");
}

@font-face {
  font-family: Poppins;
  font-weight: 700;
  src: url("@/assets/fonts/Poppins-Bold.ttf");
}

@font-face {
  font-family: NotoSans;
  src: url("@/assets/fonts/NotoSans-Regular.ttf");
}

@font-face {
  font-family: NotoSans;
  font-weight: 500;
  src: url("@/assets/fonts/NotoSans-Medium.ttf");
}

@font-face {
  font-family: NotoSans;
  font-weight: 600;
  src: url("@/assets/fonts/NotoSans-SemiBold.ttf");
}

@font-face {
  font-family: NotoSans;
  font-weight: 700;
  src: url("@/assets/fonts/NotoSans-Bold.ttf");
}

body {
  @include typography-main;
  margin: 0;
  padding: 0;
  color: $color-black;
}

* {
  scrollbar-width: thin;
  scrollbar-color: $scrollbar-thumb-color $scrollbar-track-color;
}

*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

*::-webkit-scrollbar-track {
  background: $scrollbar-track-color;
}

*::-webkit-scrollbar-thumb {
  background-color: $scrollbar-thumb-color;
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 6px;

  &:hover {
    background-color: $scrollbar-thumb-hover-color;
  }
}

*::-webkit-scrollbar-corner {
  background-color: $scrollbar-thumb-color;
  border: 2px solid transparent;
  background-clip: padding-box;
}
</style>
