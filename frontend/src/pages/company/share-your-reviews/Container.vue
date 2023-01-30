<script lang="ts">
import { computed, defineComponent } from "vue";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import AppShareYourReviews from "@/containers/AppShareYourReviews.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    AppCompanyProfileLayout,
    AppShareYourReviews,
  },
  setup() {
    const route = useRoute();
    const companyId = computed(() => route.params.id as string);
    return { companyId };
  },
});
</script>

<template>
  <AppCompanyProfileLayout :company-id="companyId">
    <template v-slot:title>Share Your Reviews Page</template>
    <AppShareYourReviews :company-id="companyId" />
  </AppCompanyProfileLayout>
</template>
