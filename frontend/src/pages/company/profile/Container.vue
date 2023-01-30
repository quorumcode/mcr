<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  unref,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { useCompanyProfilePageStore } from "./store";
import { useUserStore } from "@/stores/user";
import { usePagesStore } from "@/stores/pages";
import { UserRole } from "@/types/commonTypes";
import AdminBanModal from "@/admin/containers/banModal/AdminBanModal.vue";
import AppStandardLayout from "@/containers/AppStandardLayout.vue";
import AppCompanyProfile from "@/components/AppCompanyProfile.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import AppReview from "@/components/AppReview.vue";
import AppCard from "@/components/AppCard.vue";
import AppReviewChart from "@/components/AppReviewChart.vue";
import AppAlertModal from "@/containers/alertModal/AppAlertModal.vue";
import AppConfirmationModal from "@/containers/AppConfirmationModal.vue";
import UiButton from "@/components/UiButton.vue";
import IconPen from "@/components/icons/IconPen.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import IconNotificationWarning from "@/components/icons/IconNotificationWarning.vue";
import IconEllipsis from "@/components/icons/IconEllipsis.vue";
import IconLock from "@/components/icons/IconLock.vue";
import IconPlus from "@/components/icons/IconPlus.vue";
import IconTrash from "@/components/icons/IconTrash.vue";
import IconEyeCrossed from "@/components/icons/IconEyeCrossed.vue";

export default defineComponent({
  components: {
    AdminBanModal,
    AppCard,
    AppReview,
    AppLoadingSpinner,
    AppCompanyProfile,
    AppStandardLayout,
    AppReviewChart,
    AppAlertModal,
    AppConfirmationModal,
    UiButton,
    IconPen,
    IconArrowLeft,
    IconNotificationWarning,
    IconEllipsis,
    IconLock,
    IconPlus,
    IconTrash,
    IconEyeCrossed,
  },
  props: {
    back: {
      type: [Boolean, Function],
      default: false,
    },
  },
  async setup(props) {
    const route = useRoute();
    const router = useRouter();
    const pagesStore = usePagesStore();
    const store = useCompanyProfilePageStore();
    const userStore = useUserStore();
    const isBanModalOpened = ref(false);
    const reviews = computed(() => store.reviews);
    const reviewsTotal = computed(() => store.reviewsTotal);

    const hasMore = computed(() => {
      return reviewsTotal.value > reviews.value.length;
    });

    const companyId = computed(() => route.params.id as string);
    const isMyCompany = computed(() => {
      return companyId.value === userStore.info?.company?._id;
    });

    onMounted(async () => {
      if (!isMyCompany.value) {
        await userStore.getFingerprintData();
        const isFromWidget = route?.query?.fromWidget ? true : false;
        if (userStore.userVisitorId) {
          await store.companyVisit(
            companyId.value,
            isFromWidget,
            userStore.userVisitorId
          );
        }
      }
    });

    const loadMore = async () => {
      await store.fetchReviews(companyId.value, true);
    };

    const handleBack = () => {
      if (typeof props.back === "function") {
        props.back();
      } else {
        router.back();
      }
    };
    const showBackBtn = pagesStore.isHaveHistory
      ? pagesStore.isHaveHistory
      : false;

    const isActiveAdminMenu = ref(false);
    const isAlertModalOpen = ref(false);
    const isConvertModalOpen = ref(false);
    const convertToTest = async () => {
      await store.convertToTest();
      isConvertModalOpen.value = false;
    };

    const controlsRef = ref<HTMLElement>(null);

    const handleClick = (ev: MouseEvent) => {
      if (!isActiveAdminMenu.value) {
        return;
      }
      const path = (ev.path || ev.composedPath()) as Array<HTMLElement>;
      if (path.findIndex((x) => x === controlsRef.value) === -1) {
        isActiveAdminMenu.value = false;
      }
    };

    const isActiveAdminControls = computed(
      () =>
        userStore.isActiveAdminControls &&
        userStore.info?.permissions.hasAdminControls
    );

    onMounted(() => {
      document.addEventListener("click", handleClick);
      const DEFAULT_PAGE_TITLE =
        (import.meta.env.VITE_DEFAULT_PAGE_TITLE as string) ||
        "My Client Reviews";
      window.document.title = `${store.company?.name} Online Reviews | ${DEFAULT_PAGE_TITLE}`;
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClick);
    });

    await store.fetch(companyId.value);
    if (route.hash) {
      await store.openReviewById(companyId.value, route.hash.substring(1));
    }

    return {
      routesNames,
      companyId,
      isMyCompany,
      isBanModalOpened,
      company: computed(() => store.company),
      permissions: computed(() => userStore.info?.permissions),
      isActiveAdminControls,
      reviews,
      hasMore,
      loadMore,
      isLoading: computed(() => store.isLoading),
      openReviewModal: store.openReviewModal,
      showBackBtn,
      handleBack,
      reviewStats: computed(() => store.reviewStats),
      isActiveAdminMenu,
      controlsRef,
      isAlertModalOpen,
      deleteAlert: store.deleteAlert,
      isConvertModalOpen,
      isUserManager: computed(() => userStore.info?.role === UserRole.manager),
      convertToTest,
    };
  },
});
</script>

<template>
  <AppStandardLayout>
    <div class="wrapper">
      <div class="controls" ref="controlsRef">
        <UiButton
          v-if="showBackBtn"
          view="control-secondary"
          class="back-button"
          @click.prevent="handleBack"
        >
          <template v-slot:icon>
            <IconArrowLeft />
          </template>
          Back
        </UiButton>
        <UiButton
          v-if="isActiveAdminControls"
          view="control-secondary"
          class="admin-controls-button"
          :class="{ '_is-active': isActiveAdminMenu }"
          @click.prevent="isActiveAdminMenu = !isActiveAdminMenu"
        >
          <template v-slot:icon>
            <IconEllipsis />
          </template>
        </UiButton>
        <div
          v-if="isActiveAdminMenu && isActiveAdminControls"
          class="admin-controls-menu"
        >
          <div class="admin-controls-menu__body">
            <RouterLink
              v-if="permissions?.canEditAllCompanies"
              :to="{
                name: routesNames.companyEdit,
                params: { id: companyId },
              }"
            >
              <UiButton view="control-menu-item" style="width: 100%">
                <template v-slot:icon><IconPen /></template>
                Edit User Info
              </UiButton>
            </RouterLink>
            <template v-if="permissions?.canBanUsers">
              <UiButton
                v-if="!company.isRemoved"
                view="control-menu-item"
                @click="isBanModalOpened = true"
              >
                <template v-slot:icon><IconLock /></template>
                Block User
              </UiButton>
            </template>
            <UiButton view="control-menu-item" @click="isAlertModalOpen = true">
              <template v-slot:icon><IconPlus /></template>
              <template v-if="!company.alert?.title">Add</template>
              <template v-else>Edit</template>
              Company Warning Message
            </UiButton>
            <template v-if="isUserManager">
              <UiButton
                view="control-menu-item"
                @click="isConvertModalOpen = true"
              >
                <template v-slot:icon><IconEyeCrossed /></template>
                Switch to Test Company
              </UiButton>
            </template>
          </div>
        </div>
      </div>
      <div class="page">
        <div class="page-left">
          <div class="page__profile profile">
            <template v-if="isActiveAdminControls">
              <div v-if="company.isRemoved" class="admin-info">
                <div>This company has been deleted</div>
                <UiButton
                  v-if="permissions?.canBanUsers"
                  class="admin-info__button"
                  view="control-secondary"
                  @click="isBanModalOpened = true"
                >
                  Restore
                </UiButton>
              </div>
              <div class="admin-controls"></div>
            </template>

            <AppCompanyProfile :company="company" />
          </div>
          <AppReviewChart :review-stats="reviewStats" class="page__chart" />
        </div>

        <section class="page__reviews reviews">
          <!-- <div v-if="company.alert" class="company-alert">
            <div class="company-alert__header">
              <IconNotificationWarning class="company-alert__icon" />
              <span>
                {{ company.alert?.title }}
              </span>
              <UiButton
                v-if="isActiveAdminControls"
                view="control-secondary"
                class="company-alert__edit"
                @click="isAlertModalOpen = true"
              >
                <template v-slot:icon><IconPen /></template>
              </UiButton>
              <UiButton
                v-if="isActiveAdminControls"
                view="control-secondary"
                @click="deleteAlert"
              >
                <template v-slot:icon><IconTrash /></template>
              </UiButton>
            </div>
            {{ company.alert.body }}
          </div> -->
          <template v-if="reviews.length">
            <div class="reviews__grid">
              <AppCard
                class="reviews__card"
                v-for="review in reviews"
                :key="review.id"
                @click="openReviewModal(review)"
              >
                <AppReview
                  :rating-value="review.rate"
                  :user-name="review.client.name"
                  :company-name="company.name"
                  :date="review.createdAt"
                  :message="review.message"
                  :reply-message="review.reply?.message"
                  :i-am-company-owner="isMyCompany"
                  :is-strong-value="false"
                  place="company-page-grid"
                />
              </AppCard>
            </div>

            <div class="more-button" v-if="hasMore">
              <UiButton view="secondary" @click="loadMore">
                <template #icon v-if="isLoading">
                  <AppLoadingSpinner />
                </template>
                Load More...
              </UiButton>
            </div>
          </template>

          <template v-else>
            <div class="result-stub">
              <img
                class="result-stub__image"
                src="@/assets/illustrations/image10.svg"
                alt=""
              />
              <p class="result-stub__message">There’s no reviews yet!</p>
            </div>
          </template>
        </section>
      </div>
    </div>
  </AppStandardLayout>
  <teleport to="body">
    <AdminBanModal
      v-if="isBanModalOpened"
      :action-type="company.isRemoved ? 'restore' : 'ban'"
      :company-id="companyId"
      @close="isBanModalOpened = false"
      @complete="fetch"
    />
  </teleport>
  <teleport to="body">
    <AppAlertModal
      v-if="isAlertModalOpen"
      :alert="company.alert"
      @close="isAlertModalOpen = false"
    />
  </teleport>
  <teleport to="body">
    <AppConfirmationModal
      v-if="isConvertModalOpen"
      @close="isConvertModalOpen = false"
      @confirm="convertToTest"
    >
      This action is irreversible, are you sure?
    </AppConfirmationModal>
  </teleport>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";
@import "@/styles/component.scss";

.controls {
  display: grid;
  grid-template-areas: "back . admin-button" ". . admin-menu";
  grid-template-rows: auto 0;
}

.back-button {
  grid-area: back;
  justify-self: start;
  margin-top: 20px;
}

.admin-controls-button {
  grid-area: admin-button;
  justify-self: end;
  border-radius: $rounding-circle;
  margin-top: 20px;

  &._is-active {
    background-color: rgba($color-blue, 0.1);
  }
}

.admin-controls-menu {
  justify-self: end;
  grid-area: admin-menu;
  z-index: 1;

  &__body {
    @include shadow-medium;
    background-color: $color-white;
    border-radius: $rounding-medium;
    display: flex;
    flex-direction: column;
  }
}

.page {
  display: flex;
  align-items: flex-start;
  padding-bottom: 120px;
  margin-top: 24px;

  &__profile {
    width: 312px;
    margin-right: 24px;
    flex-shrink: 0;
    flex-grow: 0;
    border: 2px solid rgba(30, 43, 153, 0.06);
  }

  &__chart {
    margin-top: 24px;
    width: 312px;
    box-sizing: border-box;
  }

  &__reviews {
    flex-shrink: 1;
    flex-grow: 1;
  }
}

.admin-info {
  background-color: $color-yellow-40;
  border-radius: $rounding-medium;
  padding: 12px;
  margin-bottom: 24px;

  &__button {
    margin-top: 8px;
  }
}

.company-alert {
  @include component-card;
  margin-bottom: 24px;
  &__header {
    @include typography-main(20px, 700);
    white-space: nowrap;
    color: $color-blue;
    min-height: 40px;
    display: flex;
    align-items: center;
    column-gap: 14px;
    margin-bottom: 10px;
  }
  &__icon {
    height: 36px;
    width: 36px;
  }
  &__edit {
    margin-left: auto;
  }
}

.reviews {
  &__grid {
    display: grid;
    grid-gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }

  &__card {
    height: 100%;
  }
}

.result-stub {
  margin: 0 auto;
  text-align: center;
  color: $color-blue;

  &__image {
    max-width: 100%;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__message {
    @include typography-main(24px, 700);
    margin: 0;
  }
}

.more-button {
  margin-top: 40px;
  text-align: center;
}

@include responsive-media((md, xl)) {
  .wrapper {
    @include component-content-wrapper;
  }

  .page {
    &__profile {
      padding: 24px;
      box-sizing: border-box;
      background-color: $color-blue-06;
      border-radius: $rounding-large;
    }
  }
}

@include responsive-media((xs, sm)) {
  .page {
    flex-direction: column;
    align-items: center;

    &__profile {
      background-color: $color-blue-06;
      padding: 24px;
      margin: 0;
      margin-bottom: 40px;
      width: 100%;
      box-sizing: border-box;
    }
    &__chart {
      margin: 0 auto 40px;
    }
    .company-alert {
      margin: 0 20px 24px;
    }
  }

  .wrapper {
    position: relative;

    // Background compensation for header roundings
    &::before {
      content: "";
      display: block;
      position: absolute;
      width: 100%;
      height: 100px;
      bottom: 100%;
      left: 0;
      background-color: $color-white;
      z-index: -1;
    }
  }
  .reviews__card {
    margin: 0 20px;
  }

  .controls {
    margin: 0 20px;
  }
}
</style>
