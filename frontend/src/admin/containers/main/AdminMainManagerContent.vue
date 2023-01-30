<script lang="ts">
import { defineComponent } from "vue";
import "chartjs-adapter-date-fns";
import { usersChartConfig } from "@/admin/helpers/usersChartConfig";
import AdminChartCard from "@/admin/conponents/AdminChartCard.vue";
import { newUsersChartConfig } from "@/admin/helpers/newUsersChartConfig";
import { newReviewsChartConfig } from "@/admin/helpers/newReviewsChartConfig";
import { sentMailsChartConfig } from "@/admin/helpers/sentMailsChartConfig";
import AdminValue from "@/admin/conponents/AdminValue.vue";

export default defineComponent({
  components: {
    AdminValue,
    AdminChartCard,
  },
  setup() {
    return {
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
    <AdminChartCard title="Number of users" :config="usersChartConfig" />
    <AdminChartCard title="New users" :config="newUsersChartConfig">
      <AdminValue value="123" suffix="/ users per month" />
    </AdminChartCard>
    <AdminChartCard title="New reviews" :config="newReviewsChartConfig" />
    <AdminChartCard title="Sent mails" :config="sentMailsChartConfig">
      <AdminValue value="23" suffix="/ mails per month" />
    </AdminChartCard>
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
</style>
