<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted } from "vue";
import "chartjs-adapter-date-fns";
import AppDashboardLayout from "@/containers/AppDashboardLayout.vue";
import { useCommonStore } from "@/stores/common";
import AdminTabs from "@/admin/conponents/AdminTabs.vue";
import { useAdminDashboardLayoutStore } from "@/admin/containers/dashboardLayout/store";
import { routesNames } from "@/routesNames";
import { useAdminEventBus } from "@/admin/helpers/useAdminEventBus";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/types/commonTypes";
import AdminReviewModal from "@/admin/containers/reviewModal/AdminReviewModal.vue";
import { useAdminReportedReviewsStore } from "@/admin/containers/reportedReviews/store";

export default defineComponent({
  components: {
    AdminTabs,
    AppDashboardLayout,
    AdminReviewModal,
  },
  async setup() {
    const store = useAdminDashboardLayoutStore();
    const commonStore = useCommonStore();
    const userStore = useUserStore();
    const reportedStore = useAdminReportedReviewsStore();
    const adminEventBus = useAdminEventBus();

    const handleUpdateCounters = () => {
      //store.fetchReportedReviewsCount();
      restartInterval();
      reportedStore.refreshReviewList();
    };

    const tabs = computed(() => {
      const result = [
        {
          route: { name: routesNames.adminDashboardMain },
          title: "Main",
          isExactActive: true,
        },
        {
          route: { name: routesNames.adminDashboardReportedReviews },
          title: "Reported reviews",
          counter: {
            value: reportedStore.serverReviewCount,
            type: reportedStore.serverReviewCount > 0 ? "danger" : "normal",
          },
        },
      ];
      if (userStore.info?.role === UserRole.manager) {
        result.push({
          route: { name: routesNames.adminDashboardPages },
          title: "Pages",
        });
      }
      return result;
    });

    let interval;
    const restartInterval = () => {
      clearInterval(interval);
      interval = setInterval(reportedStore.refreshReviewList, 10000);
    };

    onMounted(() => {
      adminEventBus.addUpdateCountersListener(handleUpdateCounters);
      restartInterval();
    });

    onBeforeUnmount(() => {
      adminEventBus.removeUpdateCountersListener(
        reportedStore.refreshReviewList
      );
      clearInterval(interval);
    });

    //await store.init();
    await reportedStore.refreshReviewList();

    return {
      tabs,
      mainNavigation: commonStore.getMainNavigation(true),
    };
  },
});
</script>

<template>
  <AppDashboardLayout title="Admin dashboard" :nav-links="mainNavigation">
    <AdminTabs class="tabs" :items="tabs" />
    <RouterView />
    <teleport to="body">
      <AdminReviewModal />
    </teleport>
  </AppDashboardLayout>
</template>

<style lang="scss" scoped>
.tabs {
  margin-bottom: 24px;
}
</style>
