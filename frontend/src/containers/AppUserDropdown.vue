<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import AppUserDropdown from "@/components/AppUserDropdown.vue";
import { useUserStore } from "@/stores/user";
import UiSwitch from "@/components/UiSwitch.vue";
import { routesNames } from "@/routesNames";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import { SubscriptionStatus } from "@/types/commonTypes";

export default defineComponent({
  components: { UiSwitch, AppUserDropdown },
  setup() {
    const userStore = useUserStore();
    const subscription = computed(() => userStore.info?.company?.subscription);
    const adminRoute = computed(() => {
      if (userStore.info?.permissions.hasAdminControls) {
        return {
          name: routesNames.adminDashboard,
        };
      }
      return undefined;
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

    return {
      adminRoute,
      subscriptionDaysLeft,
      userName: computed(() => userStore.info?.name),
      companyId: computed(() => userStore.info?.company?._id),
      // hasAdminControls: computed(
      //   () => userStore.info?.permissions.hasAdminControls
      // ),
      // isActiveAdminControls: toRef(userStore, "isActiveAdminControls"),
      // setIsActiveAdminControls: userStore.setIsActiveAdminControls,
    };
  },
});
</script>

<template>
  <AppUserDropdown
    :user-name="userName"
    :admin-route="adminRoute"
    :company-id="companyId"
    :subscription-days-left="subscriptionDaysLeft"
  >
    <!-- <template #dropdown-content-start v-if="hasAdminControls">
      <label class="admin-control">
        <span class="admin-control__label">Admin controls</span>
        <UiSwitch
          :model-value="isActiveAdminControls"
          @update:modelValue="setIsActiveAdminControls"
        />
      </label>
    </template> -->
  </AppUserDropdown>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.admin-control {
  @include typography-main(14px, 600);
  display: flex;
  align-items: center;
  color: $color-blue;
  padding: 12px;

  &__label {
    margin-right: 12px;
  }
}
</style>
