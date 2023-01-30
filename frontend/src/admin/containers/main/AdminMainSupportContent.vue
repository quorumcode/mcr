<script lang="ts">
import { defineComponent } from "vue";
import "chartjs-adapter-date-fns";
import { usersChartConfig } from "@/admin/helpers/usersChartConfig";
import AdminChartCard from "@/admin/conponents/AdminChartCard.vue";
import { newUsersChartConfig } from "@/admin/helpers/newUsersChartConfig";
import { newReviewsChartConfig } from "@/admin/helpers/newReviewsChartConfig";
import { sentMailsChartConfig } from "@/admin/helpers/sentMailsChartConfig";
import AdminValue from "@/admin/conponents/AdminValue.vue";
import AppCard from "@/components/AppCard.vue";
import { paymentErrorsChartConfig } from "@/admin/helpers/paymentErrorsChartConfig";

export default defineComponent({
  components: {
    AppCard,
    AdminValue,
    AdminChartCard,
  },
  setup() {
    return {
      paymentErrorsChartConfig,
      usersChartConfig,
      newUsersChartConfig,
      newReviewsChartConfig,
      sentMailsChartConfig,
    };
  },
});
</script>

<template>
  <div class="grid">
    <AppCard>
      <div class="sub-grid">
        <AdminValue title="Open tickets" :value="2" />
        <AdminValue title="Unresolved complaints" :value="5" />
      </div>
    </AppCard>
    <AdminChartCard
      title="Payments errors"
      :config="paymentErrorsChartConfig"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.grid {
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
}

.sub-grid {
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
</style>
