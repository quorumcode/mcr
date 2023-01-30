<script lang="ts">
import { computed, defineComponent } from "vue";
import { routesNames } from "@/routesNames";
import { Company } from "@/types/commonTypes";
import { useRouter } from "vue-router";
import { useAppConfig } from "@/appConfig";
import { useUserStore } from "@/stores/user";
import AppUrlCopy from "@/components/AppUrlCopy.vue";

export default defineComponent({
  components: { AppUrlCopy },
  emits: {},
  async setup() {
    const router = useRouter();
    const appConfig = useAppConfig();
    const userStore = useUserStore();

    const company = computed<Company>(() => userStore.info?.company);

    const companyAddReviewUrl = computed(() => {
      if (company.value && company.value?.reviewToken) {
        const path = router.resolve({
          name: routesNames.companyAddReview,
          params: { token: company.value?.reviewToken },
        }).href;
        return `${appConfig.frontendExternalBaseUrl}${path}`;
      }
      return "";
    });

    return { companyAddReviewUrl };
  },
});
</script>

<template>
  <div>
    <h2 class="urlcopy__title">By URL</h2>
    <p class="urlcopy__description">
      The link below allows your clients to go direct to your review form. You
      can copy and share the link with your clients.
    </p>
    <AppUrlCopy class="urlcopy__downloader" :url="companyAddReviewUrl" />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.urlcopy {
  display: flex;

  &__title {
    @include typography-main(16px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__description {
    @include typography-main(14px);
    color: $color-black;
    margin: 4px 0 0;
  }

  &__downloader {
    margin-top: 40px;
  }
}
</style>
