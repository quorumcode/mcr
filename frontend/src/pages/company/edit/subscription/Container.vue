<script lang="ts">
import { computed, defineComponent } from "vue";
import { useCommonStore } from "@/stores/common";
import { useRoute } from "vue-router";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import AppBusinessSubscription from "@/containers/AppBusinessSubscription.vue";

export default defineComponent({
  components: {
    AppCompanyProfileLayout,
    AppBusinessSubscription,
  },
  setup() {
    const commonStore = useCommonStore();
    const route = useRoute();
    const companyId = computed(() => route.params.id as string);

    const handleSubmit = (submit: Promise<void>) => {
      submit
        .then(() => {
          commonStore.showNotification(
            "success",
            "All changes have been saved successfully"
          );
        })
        .catch((e) => {
          console.error(e);
        });
    };

    return { companyId, handleSubmit };
  },
});
</script>

<template>
  <AppCompanyProfileLayout :company-id="companyId">
    <template v-slot:title>Subscription</template>
    <AppBusinessSubscription :company-id="companyId" @submit="handleSubmit" />
  </AppCompanyProfileLayout>
</template>
