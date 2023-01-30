<script lang="ts">
import { computed, defineComponent } from "vue";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import { useCompanySubscriptionPageStore } from "./store";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import UiButton from "@/components/UiButton.vue";
import { formatDate } from "@/helpers/formatDate";

export default defineComponent({
  components: {
    AppCompanyProfileLayout,
    IconArrowLeft,
    UiButton,
  },
  async setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useCompanySubscriptionPageStore();

    const companyId = computed(() => route.params.id as string);
    const iAmCompanyOwner = computed(() => store.iAmCompanyOwner);

    await store.init(companyId.value);

    return {
      companyId,
      router,
      iAmCompanyOwner,
      payments: computed(() => store.payments),
      formatDate: (date: Date) => formatDate(date),
    };
  },
});
</script>

<template>
  <AppCompanyProfileLayout :company-id="companyId">
    <template v-slot:title>Payment history</template>
    <UiButton
      view="text"
      class="header__back-link back-link"
      @click.prevent="router.back()"
    >
      <template v-slot:icon>
        <IconArrowLeft />
      </template>
      Back
    </UiButton>

    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Invoice total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in payments" :key="payment.id">
          <th>
            <a :href="payment.url" target="_blank">{{
              formatDate(payment.createdAt)
            }}</a>
          </th>
          <th>
            <a :href="payment.url" target="_blank"
              >Monthly Fee - Unlimited Usage</a
            >
          </th>
          <th class="invoice-total">
            <a :href="payment.url" target="_blank">A${{ payment.amount }}</a>
          </th>
          <th v-if="payment.status === 'succeeded'" class="status-success">
            <a :href="payment.url" target="_blank"> Paid </a>
          </th>
          <th v-else class="status-failed">
            <a :href="payment.url" target="_blank">Failed</a>
          </th>
        </tr>
      </tbody>
    </table>
  </AppCompanyProfileLayout>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.table {
  border-radius: $rounding-large;
  background-color: $color-white;
  padding: 24px;
  margin-top: 24px;
  width: 100%;
  text-align: left;

  thead {
    @include typography-main(10px, 600);
    color: $color-black-60;

    th {
      padding: 0 0 12px 0;
    }
  }

  tbody {
    color: $color-black;
    position: relative;

    a {
      text-decoration: none;
    }

    th {
      padding: 12px 0;
      a {
        @include typography-main(12px, 400);
        color: $color-black;
      }
    }

    th.invoice-total a {
      @include typography-main(12px, 600);
      color: $color-blue;
    }

    th.status-success a {
      color: $color-green;
    }

    th.status-failed a {
      color: $color-red;
    }

    tr:not(:first-child)::after {
      content: "";
      border-radius: $rounding-large;
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: $color-blue-06;
    }
  }
}
</style>
