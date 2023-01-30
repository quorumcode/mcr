<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { routesNames } from "@/routesNames";
import { useUserStore } from "@/stores/user";
import { usePaymentModalStore } from "@/containers/paymentModal/store";
import format from "date-fns/format";
import AppPaymentModal from "@/containers/paymentModal/AppPaymentModal.vue";
import AppCreditCardIcon from "@/components/AppCreditCardIcon.vue";
import UiButton from "@/components/UiButton.vue";
import UiButtonLink from "@/components/UiButtonLink.vue";

export default defineComponent({
  components: {
    AppPaymentModal,
    AppCreditCardIcon,
    UiButton,
    UiButtonLink,
  },
  props: {
    companyId: {
      type: String,
      required: true,
    },
  },
  async setup() {
    const userStore = useUserStore();
    const paymentStore = usePaymentModalStore();
    let isPaymentModalOpened = ref(false);

    const handleSubscribeSuccess = async () => {
      await Promise.all([
        userStore.fetchUserInfo(),
        paymentStore.fetchPayments(),
      ]);
    };

    const formattedDate = (month: string, year: string) => {
      if (!year || !month) {
        return "";
      }
      const date: Date = new Date(+year, +month - 1);
      return format(date, "MM/yy");
    };

    const openPaymentModal = () => {
      isPaymentModalOpened.value = true;
    };

    const closePaymentModal = () => {
      isPaymentModalOpened.value = false;
    };

    await paymentStore.init();

    return {
      routesNames,
      openPaymentModal,
      closePaymentModal,
      isPaymentModalOpened,
      savedCard: computed(() => paymentStore.savedCard),
      savedCardName: computed(() => paymentStore.savedCardName),
      formattedDate,
      hasCardForm: computed(() => paymentStore.hasCardForm),
      handleSubscribeSuccess,
    };
  },
});
</script>

<template>
  <div>
    <div class="content">
      <h2 class="content__title">Payment Method</h2>
      <span class="content__subtitle">
        Change and update the credit card on file
      </span>
      <div v-if="savedCard" class="payment__card">
        <div class="payment__card-top">
          <div class="payment__card-name">
            <span>
              {{
                savedCard.type === "amex" ? "American Express" : savedCard.type
              }}
              ({{ savedCard.lastDigits }})
            </span>
            <div
              class="payment__card-logo"
              :class="`payment__card-logo-${savedCard.type}`"
            >
              <AppCreditCardIcon :type="savedCard.type" />
            </div>
          </div>

          <UiButtonLink
            class="buttons__item payment__card-link"
            view="control-secondary"
            :to="{
              name: routesNames.companyPaymentHistory,
              params: { id: companyId },
            }"
          >
            Show payment history
          </UiButtonLink>
        </div>
        <div
          v-if="savedCardName"
          class="payment__card-text payment__card-text-name"
        >
          {{ savedCardName }}
        </div>
        <div class="payment__card-text">
          Expires: {{ formattedDate(savedCard.month, savedCard.year) }}
        </div>
      </div>
    </div>
    <div class="buttons">
      <UiButton
        @click="openPaymentModal"
        class="buttons__item-big buttons__item-change"
        :class="{ '_no-card': !savedCardName }"
        view="control"
      >
        <template v-if="savedCardName">Change card</template>
        <template v-else>Add a card</template>
      </UiButton>
    </div>

    <teleport to="body">
      <AppPaymentModal
        v-if="isPaymentModalOpened"
        @close="closePaymentModal"
        @subscribeSuccess="handleSubscribeSuccess"
      />
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

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

.payment {
  &__card {
    border-radius: $rounding-large;
    background-color: $color-white;
    padding: 24px;
    margin: 12px 0 24px;

    &-name {
      @include typography-main(16px, 600);
      color: $color-black;
      display: flex;
      align-items: center;
      text-transform: capitalize;
    }

    &-text {
      @include typography-main(12px);
      color: $color-black;
      margin-top: 4px;

      &-name {
        text-transform: uppercase;
      }
    }

    &-top {
      display: flex;
      align-items: center;
    }
    &-logo {
      background-color: $color-blue-06;
      margin-left: 12px;
      height: 24px;
      width: 36px;
      max-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;

      &-mastercard svg {
        height: 14px;
        width: 22px;
      }
    }

    &-link {
      margin-left: auto;
    }
  }

  &__master-card {
    width: 22px;
  }
}
</style>
