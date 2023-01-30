<script lang="ts">
import { computed, defineComponent } from "vue";
import { routesNames } from "@/routesNames";
import { Company } from "@/types/commonTypes";
import AppQRCodeDownloader from "@/components/AppQRCodeDownloader.vue";
import { useRouter } from "vue-router";
import { useAppConfig } from "@/appConfig";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: { AppQRCodeDownloader },
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
    <h2 class="qrcode__title">By QR Code</h2>
    <p class="qrcode__description">
      Generate QR code and print out at your business venue to invite customers
      to leave reviews.
    </p>
    <AppQRCodeDownloader
      class="qrcode__downloader"
      :encoding-value="companyAddReviewUrl"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.qrcode {
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
