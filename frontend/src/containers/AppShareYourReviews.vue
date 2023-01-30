<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRouter } from "vue-router";
import { Company } from "@/types/commonTypes";
import { useAppConfig } from "@/appConfig";
import { routesNames } from "@/routesNames";
import { useUserStore } from "@/stores/user";
import AppQRCodeDownloader from "@/components/AppQRCodeDownloader.vue";
import AppUrlCopy from "@/components/AppUrlCopy.vue";

export default defineComponent({
  components: {
    AppQRCodeDownloader,
    AppUrlCopy,
  },
  props: {
    companyId: {
      type: String,
      required: true,
    },
  },
  async setup() {
    const userStore = useUserStore();
    const appConfig = useAppConfig();
    const router = useRouter();
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

    const companyPageUrl = computed(() => {
      if (company.value) {
        const path = router.resolve({
          name: routesNames.companyProfile,
          params: { id: company.value?._id },
        }).href;
        return `${appConfig.frontendExternalBaseUrl}${path}`;
      }
      return "";
    });

    return {
      companyAddReviewUrl,
      companyPageUrl,
    };
  },
});
</script>

<template>
  <div class="share-section">
    <h2 class="share-section__title">Share your Company Page</h2>
    <p class="share-section__description">
      Download and print out this QR code to let your customers read your
      reviews.
    </p>

    <AppQRCodeDownloader
      class="share-section__downloader"
      type="compact"
      :encoding-value="companyPageUrl"
      description="Read reviews QR code"
    />

    <h2 class="share-section__title">
      Share the QR code to let your customers leave a review
    </h2>
    <AppQRCodeDownloader
      class="share-section__downloader"
      type="compact"
      :encoding-value="companyAddReviewUrl"
      description="Leave a review QR code"
    />

    <h2 class="share-section__title">Share a link to your Company Page</h2>
    <p class="share-section__description">
      You can share your company reviews page this way to promote your business.
    </p>
    <AppUrlCopy
      class="share-section__downloader"
      :url="companyPageUrl"
      description="Copy Company Page URL"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.share-section {
  &__title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 40px 0 0;

    &:first-child {
      margin-top: 0;
    }
  }

  &__description {
    @include typography-main(12px);
    color: $color-black;
    margin: 0;
  }

  &__downloader {
    margin-top: 12px;
  }
}
</style>
