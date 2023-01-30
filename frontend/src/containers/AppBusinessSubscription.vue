<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { SubscriptionStatus } from "@/types/commonTypes";
import { useAppConfig } from "@/appConfig";
import { useCompanySubscriptionPageStore } from "@/pages/company/edit/subscription/store";
import { usePaymentModalStore } from "@/containers/paymentModal/store";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/helpers/formatDate";
import { addDays } from "date-fns";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import AppPaymentModal from "@/containers/paymentModal/AppPaymentModal.vue";
import AppUserPaymentBlock from "@/containers/AppUserPaymentBlock.vue";
import UiButton from "@/components/UiButton.vue";
import UiModal from "@/components/UiModal.vue";
import IconReplied from "@/components/icons/IconReplied.vue";
import IconNotificationError from "@/components/icons/IconNotificationError.vue";
import IconNotificationWarning from "@/components/icons/IconNotificationWarning.vue";

export default defineComponent({
  components: {
    AppPaymentModal,
    AppUserPaymentBlock,
    UiModal,
    UiButton,
    IconReplied,
    IconNotificationError,
    IconNotificationWarning,
  },
  async setup() {
    const route = useRoute();
    const { billing } = useAppConfig();
    const store = useCompanySubscriptionPageStore();
    const userStore = useUserStore();
    const paymentStore = usePaymentModalStore();

    const companyId = computed(() => route.params.id as string);
    const iAmCompanyOwner = computed(() => store.iAmCompanyOwner);
    const subscription = computed(() => userStore.info?.company?.subscription);

    const canCancelSubscriptionImmediately = computed(
      () => userStore.info?.permissions.canCancelSubscriptions
    );

    const formatDifference = (date: Date) => {
      return formatDistanceToNowStrict(date, {
        unit: "day",
        roundingMethod: "floor",
      });
    };

    const delayedCancellationDate = computed(() => {
      if (!subscription.value?.periodEndAt) {
        return undefined;
      }
      return addDays(
        subscription.value?.periodEndAt,
        billing.daysAfterCancelingSubscription
      );
    });

    const subscriptionDaysLeft = computed(() => {
      if (
        !subscription.value ||
        ![SubscriptionStatus.trialing, SubscriptionStatus.canceled].includes(
          subscription.value.status
        )
      ) {
        return 0;
      }
      return formatDistanceToNowStrict(subscription.value.periodEndAt, {
        unit: "day",
        roundingMethod: "floor",
      });
    });

    const handleSubscribeSuccess = async () => {
      await Promise.all([userStore.fetchUserInfo(), store.fetchPayments()]);
    };

    await store.init(companyId.value);

    if (iAmCompanyOwner.value) {
      await store.initPayments(companyId.value);
      await paymentStore.init();
    }

    const cancelSubscription = async (immediately: boolean) => {
      await store.cancelSubscription(immediately);
    };

    return {
      daysAfterCancelingSubscription: billing.daysAfterCancelingSubscription,
      companyId,
      company: computed(() => store.company),
      subscription,
      SubscriptionStatus,
      formatDifference,
      isPaymentsLoading: computed(() => store.isPaymentsLoading),
      payments: computed(() => store.payments),
      hasActiveSubscription: computed(() => store.hasActiveSubscription),
      hasRealSubscription: computed(() => store.hasRealSubscription),
      formatDate: (date: Date) => formatDate(date),
      formatDateWithTime: (date: Date) => formatDate(date, { withTime: true }),
      handleSubscribeSuccess,
      isCancelSubscriptionModalOpened: computed(
        () => store.isCancelSubscriptionModalOpened
      ),
      openCancelSubscriptionModal: store.openCancelSubscriptionModal,
      closeCancelSubscriptionModal: store.closeCancelSubscriptionModal,
      isCancelSubscriptionImmediatelyModalOpened: computed(
        () => store.isCancelSubscriptionImmediatelyModalOpened
      ),
      openCancelSubscriptionImmediatelyModal:
        store.openCancelSubscriptionImmediatelyModal,
      closeCancelSubscriptionImmediatelyModal:
        store.closeCancelSubscriptionImmediatelyModal,
      cancelSubscription,
      delayedCancellationDate,
      iAmCompanyOwner,
      canCancelSubscriptionImmediately,
      subscriptionDaysLeft,

      openPaymentModal: store.openPaymentModal,
      closePaymentModal: store.closePaymentModal,
      isPaymentModalOpened: computed(() => store.isPaymentModalOpened),
      hasCardForm: computed(() => paymentStore.hasCardForm),
      userStore,
      subscriptionStatus: computed(() => userStore.subscriptionStatus),
      isSubscriptionProcessing: computed(
        () => userStore.isSubscriptionProcessing
      ),
    };
  },
});
</script>

<template>
  <div>
    <div class="card">
      <div class="card__top">
        <h2 class="card__top-title">My Subscription</h2>
        <template v-if="isSubscriptionProcessing">
          <div class="card__top-warning">
            <IconNotificationWarning />
            Processing
          </div>
        </template>

        <template v-else-if="subscriptionStatus === 'trialingCardConfirmed'">
          <div class="card__top-active">
            <IconReplied />
            Trial (Card Confirmed)
            <div class="card__top-daysleft">
              {{ formatDifference(subscription.periodEndAt) }} left of free
              trial
            </div>
          </div>
        </template>

        <template v-else-if="subscriptionStatus === 'trialing'">
          <div class="card__top-active">
            <IconReplied />
            Trial
            <div class="card__top-daysleft">
              {{ formatDifference(subscription.periodEndAt) }} left of free
              trial
            </div>
          </div>
        </template>

        <template v-else-if="subscriptionStatus === 'activeWillBeCanceled'">
          <div class="card__top-active">
            <IconReplied />
            Subscribed
            <div class="card__top-daysleft">
              {{ formatDifference(subscription.willBeCanceledAt) }} of
              subscription left
            </div>
          </div>
        </template>

        <template v-else-if="subscriptionStatus === 'active'">
          <div class="card__top-active">
            <IconReplied />
            Subscribed
            <div class="card__top-daysleft">
              {{ formatDifference(subscription.periodEndAt) }} left
            </div>
          </div>
        </template>

        <div v-else class="card__top-expired">
          <IconNotificationError />
          Expired
        </div>
      </div>
      <div class="card__amount">$99.00</div>
      <div class="card__list">
        <div class="card__list-item">
          <IconReplied />
          Monthly billing
        </div>
        <div class="card__list-item">
          <IconReplied />
          30 days notice to unsubscribe
        </div>
        <div class="card__list-item">
          <IconReplied />
          Unlimited usage
        </div>
      </div>
    </div>

    <template
      v-if="
        subscriptionStatus === 'trialing' ||
        subscriptionStatus === 'activeWillBeCanceled' ||
        subscriptionStatus === 'expired'
      "
    >
      <UiButton
        class="plan__button plan__button-subscribe"
        view="control"
        @click="openPaymentModal"
      >
        Subscribe
      </UiButton>
    </template>

    <template
      v-else-if="
        subscriptionStatus === 'trialingCardConfirmed' ||
        subscriptionStatus === 'active'
      "
    >
      <div class="unsubscribe">
        <h3 class="unsubscribe__title">Cancel Subscription</h3>
        <p class="unsubscribe__des">
          By cancelling your subscription, you are giving at least 30 days
          notice from today’s date. Another payment will be processed and your
          account will be suspended 30 days after the payment processing date.
          When you cancel your subscription, you will not be able to send out
          review invitations to your clients, accept reviews, respond to reviews
          or display your current reviews on your website. Your reviews will
          however still be available on your company profile.
        </p>
        <div class="plan__buttons">
          <div v-if="iAmCompanyOwner">
            <UiButton
              class="plan__button"
              view="control"
              @click="openCancelSubscriptionModal"
            >
              Cancel Subscription
            </UiButton>
          </div>
          <template v-if="canCancelSubscriptionImmediately">
            <UiButton
              class="plan__button"
              v-if="hasRealSubscription"
              view="control-secondary-danger"
              @click="openCancelSubscriptionImmediatelyModal"
            >
              Force Cancel Subscription
            </UiButton>
          </template>
        </div>
      </div>
    </template>
    <div v-else class="card__top-expired"></div>

    <UiModal
      v-if="isCancelSubscriptionModalOpened"
      class="cancel-subscription-modal"
      @close="closeCancelSubscriptionModal"
    >
      <div class="cancel-subscription-modal__content">
        <div class="cancel-subscription-modal__title">Cancel Subscription</div>
        <div class="cancel-subscription-modal__text text">
          <p class="text__block">
            Cancelling your subscription means you will not be able to invite
            reviews or display them on your website. Any clients that you have
            already invited to leave a review will still be able to do so, but
            their contributions will only appear once you’ve re-activated your
            subscription.
          </p>
          <p v-if="subscription?.status === SubscriptionStatus.trialing">
            Subscription will be canceled immediately, but the trial period will
            continue until {{ formatDate(subscription.periodEndAt) }}
          </p>
          <p v-else class="text__block">
            Cancelling today will see us charge your next payment on
            {{ formatDate(subscription.periodEndAt) }} and your account will
            remain active for the remainder of
            {{ daysAfterCancelingSubscription }} days after, until
            {{ formatDate(delayedCancellationDate) }}. You can always
            re-activate your subscription during or upon expiration of this
            period.
          </p>
        </div>
        <div class="cancel-subscription-modal__buttons">
          <UiButton
            class="cancel-subscription-modal__button"
            view="control-secondary"
            @click="closeCancelSubscriptionModal"
          >
            Go back
          </UiButton>
          <UiButton
            class="cancel-subscription-modal__button"
            view="control-secondary-danger"
            @click="cancelSubscription(false)"
          >
            Cancel my Subscription
          </UiButton>
        </div>
      </div>
    </UiModal>

    <UiModal
      v-if="isCancelSubscriptionImmediatelyModalOpened"
      class="cancel-subscription-modal"
      @close="closeCancelSubscriptionImmediatelyModal"
    >
      <div class="cancel-subscription-modal__content">
        <div class="cancel-subscription-modal__title">Cancel Subscription</div>
        <div class="cancel-subscription-modal__text text">
          This will cancel "{{ company.name }}" subscription immediately. Are
          you sure?
        </div>
        <div class="cancel-subscription-modal__buttons">
          <UiButton
            class="cancel-subscription-modal__button"
            view="control-secondary"
            @click="closeCancelSubscriptionImmediatelyModal"
          >
            Go back
          </UiButton>
          <UiButton
            class="cancel-subscription-modal__button"
            view="control-secondary-danger"
            @click="cancelSubscription(true, subscriptionStatus)"
          >
            Force cancel Subscription
          </UiButton>
        </div>
      </div>
    </UiModal>

    <AppUserPaymentBlock :company-id="companyId" />

    <teleport to="body">
      <AppPaymentModal
        style="margin-left: -100px"
        v-if="isPaymentModalOpened"
        @close="closePaymentModal"
        @subscribeSuccess="handleSubscribeSuccess"
      />
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";

.card {
  border-radius: $rounding-large;
  padding: 24px;
  background-color: $color-white;

  &__top {
    display: flex;
    align-items: center;

    &-title {
      @include typography-main(20px, 700);
      color: $color-blue;
      margin: 0 auto 0 0;
    }

    &-active {
      display: flex;
      align-items: center;
      @include typography-main(14px, 600);
      color: $color-green;

      & svg {
        margin-right: 4px;
      }
    }

    &-warning {
      display: flex;
      align-items: center;
      @include typography-main(14px, 600);
      color: $color-yellow;

      & svg {
        height: 24px;
        width: 24px;
        margin-right: 4px;
      }
    }

    &-expired {
      display: flex;
      align-items: center;
      @include typography-main(14px, 600);
      color: $color-red;

      & svg {
        margin-right: 4px;
        width: 24px;
        height: 24px;
      }
    }

    &-daysleft {
      border-radius: $rounding-medium;
      padding: 4px;
      color: $color-blue;
      background-color: $color-blue-006;
      @include typography-main(12px, 600);
      margin-left: 12px;
    }
  }

  &__amount {
    @include typography-main(16px, 700);
  }

  &__list-item {
    @include typography-main(12px);
    color: $color-black;
    margin-top: 12px;
    display: flex;
    align-items: center;

    & svg {
      margin-right: 4px;
    }
  }
}

.unsubscribe {
  margin-top: 24px;

  &__title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 0;
  }

  &__des {
    @include typography-main(12px);
    color: $color-black;
    margin: 0;
  }
}

.plan {
  margin-bottom: 40px;

  &__buttons {
    margin-top: 12px;
  }

  &__button {
    margin-bottom: 12px;
    padding: 12px 60px;
    min-width: 218px;
    min-height: 52px;

    &-subscribe {
      margin-top: 24px;
    }

    &:not(:last-child) {
      margin-right: 12px;
    }
  }
}

.cancel-subscription-modal {
  &__content {
    width: 450px;
    max-width: 100%;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    margin-bottom: 24px;
    color: $color-blue;
  }

  &__text {
    margin-bottom: 24px;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__button {
    &:not(:last-child) {
      margin-right: 24px;
    }
  }
}

.text {
  @include typography-main(16px);

  &__block {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
}
</style>
