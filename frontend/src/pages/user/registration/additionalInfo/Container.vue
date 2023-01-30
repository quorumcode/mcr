<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { useUserStore } from "@/stores/user";
import AppUtilityLayout from "@/containers/AppUtilityLayout.vue";
import AppStepsProgress from "@/components/AppStepsProgress.vue";
import AppAdditionalInfoForm from "@/containers/AppAdditionalInfoForm.vue";

export default defineComponent({
  components: {
    AppAdditionalInfoForm,
    AppStepsProgress,
    AppUtilityLayout,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const companyId = computed(() => userStore.info?.company?._id);

    const goToNextPage = () => {
      router.push({ name: routesNames.dashboard });
    };

    const handleSubmit = (submit: Promise<void>) => {
      submit
        .then(() => {
          router.push({ name: routesNames.registrationAdditionalInfo });
        })
        .catch((e) => {
          console.error(e);
        });
    };

    return {
      companyId,
      goToNextPage,
      handleSubmit,
    };
  },
});
</script>

<template>
  <AppUtilityLayout :illustration-variant="2" :back="true">
    <template v-slot:title>Additional Information</template>

    <AppStepsProgress class="steps" :steps-count="2" :current-step="2" />
    <AppAdditionalInfoForm
      submit-button-text="Next"
      :company-id="companyId"
      @skip="goToNextPage"
      @submit="goToNextPage"
    />
  </AppUtilityLayout>
</template>

<style lang="scss" scoped>
.steps {
  margin-bottom: 40px;
}
</style>
