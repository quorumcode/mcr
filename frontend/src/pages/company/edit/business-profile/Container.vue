<script lang="ts">
import { computed, defineComponent } from "vue";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import AppBusinessProfileForm from "@/containers/AppBusinessProfileForm.vue";
import { useCommonStore } from "@/stores/common";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    AppBusinessProfileForm,
    AppCompanyProfileLayout,
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
    <template v-slot:title>Business Profile</template>
    <AppBusinessProfileForm :company-id="companyId" @submit="handleSubmit" />
  </AppCompanyProfileLayout>
</template>
