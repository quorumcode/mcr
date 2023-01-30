<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import AppUtilityLayout from "@/containers/AppUtilityLayout.vue";
import AppStepsProgress from "@/components/AppStepsProgress.vue";
import AppBusinessInfoForm from "@/containers/AppBusinessInfoForm.vue";

export default defineComponent({
  components: {
    AppStepsProgress,
    AppBusinessInfoForm,
    AppUtilityLayout,
  },
  setup() {
    const router = useRouter();

    const handleSubmit = (submit: Promise<void>) => {
      submit
        .then(() => {
          router.push({ name: routesNames.registrationAdditionalInfo });
        })
        .catch((e) => {
          console.error(e);
        });
    };

    return { handleSubmit };
  },
});
</script>

<template>
  <AppUtilityLayout :illustration-variant="2">
    <template v-slot:title>Business Information</template>

    <AppStepsProgress class="steps" :steps-count="2" :current-step="1" />
    <AppBusinessInfoForm submit-button-text="Next" @submit="handleSubmit" />
  </AppUtilityLayout>
</template>

<style lang="scss" scoped>
.steps {
  margin-bottom: 40px;
}
</style>
