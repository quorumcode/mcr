<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import AppUserAccountForm from "@/containers/AppUserAccountForm.vue";
import AppUserPasswordForm from "@/containers/AppUserPasswordForm.vue";
import AppUserPaymentBlock from "@/containers/AppUserPaymentBlock.vue";
import AppUserDeleteBlock from "@/containers/AppUserDeleteBlock.vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useProfileFormStore } from "@/stores/profileForm";

export default defineComponent({
  components: {
    AppCompanyProfileLayout,
    AppUserAccountForm,
    AppUserPasswordForm,
    AppUserPaymentBlock,
    AppUserDeleteBlock,
  },
  async setup() {
    const route = useRoute();
    const userStore = useUserStore();
    const store = useProfileFormStore();
    const companyId = computed(() => route.params.id as string);
    const iAmCompanyOwner = computed(
      () => userStore?.info?.company?._id === companyId.value
    );
    onMounted(async () => {
      await store.init(
        companyId.value,
        route,
        userStore.info?.permissions?.canEditAllCompanies
      );
      await store.fetchData(companyId.value);
    });
    return {
      companyId,
      iAmCompanyOwner,
    };
  },
});
</script>

<template>
  <AppCompanyProfileLayout :company-id="companyId">
    <template v-slot:title>User Account</template>
    <AppUserAccountForm />
    <AppUserPasswordForm />
    <AppUserPaymentBlock :company-id="companyId" v-if="iAmCompanyOwner" />
    <AppUserDeleteBlock v-if="iAmCompanyOwner" />
  </AppCompanyProfileLayout>
</template>
