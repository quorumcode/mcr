<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useCommonStore } from "@/stores/common";
import { useEmailTemplatesFormStore } from "@/containers/emailTemplatesForm/store";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import AppEmailTemplatesForm from "@/containers/emailTemplatesForm/AppEmailTemplatesForm.vue";

export default defineComponent({
  components: {
    AppCompanyProfileLayout,
    AppEmailTemplatesForm,
  },
  setup() {
    const route = useRoute();
    const companyId = computed(() => route.params.id as string);
    const commonStore = useCommonStore();
    const store = useEmailTemplatesFormStore();

    const saveTemplates = async () => {
      commonStore.startLoading();
      try {
        if (await store.saveTemplates()) {
          commonStore.showNotification("success", "Successfully saved");
        }
      } catch (e) {
        commonStore.showNotification("error", e.message);
      } finally {
        commonStore.stopLoading();
      }
    };

    return {
      companyId,
      saveTemplates,
    };
  },
});
</script>

<template>
  <AppCompanyProfileLayout :company-id="companyId">
    <template v-slot:title>Email Settings</template>
    <AppEmailTemplatesForm
      :is-profile-page="true"
      @saveTemplates="saveTemplates"
    />
  </AppCompanyProfileLayout>
</template>
