<script lang="ts">
import { computed, defineComponent } from "vue";
import { routesNames } from "@/routesNames";
import AppCompanyProfile from "@/components/AppCompanyProfile.vue";
import UiButton from "@/components/UiButton.vue";
import IconPen from "@/components/icons/IconPen.vue";
import { Company } from "@/types/commonTypes";
// import AppDashboardLayout from "@/containers/AppDashboardLayout.vue";
import AppStandardLayout from "@/containers/AppStandardLayout.vue";
import { useCommonStore } from "@/stores/common";
import AppQRCodeDownloader from "@/components/AppQRCodeDownloader.vue";
import { useRoute, useRouter } from "vue-router";
import { useAppConfig } from "@/appConfig";
import AppUrlCopy from "@/components/AppUrlCopy.vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: {
    AppUrlCopy,
    AppQRCodeDownloader,
    AppStandardLayout,
    IconPen,
    UiButton,
    AppCompanyProfile,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const commonStore = useCommonStore();
    const appConfig = useAppConfig();

    const company = computed<Company>(() => userStore.info?.company);
    const title = computed(() => route.meta.title || "");

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
      title,
      routesNames,
      company,
      mainNavigation: commonStore.getMainNavigation(true),
      companyPageUrl,
    };
  },
});
</script>

<template>
  <AppStandardLayout :nav-links="mainNavigation">
    <template v-if="company" #sidebar>
      <div class="profile ttt">
        <RouterLink
          class="profile__edit"
          :to="{
            name: routesNames.companyEdit,
            params: { id: company._id },
          }"
        >
          <UiButton view="control-secondary">
            <template v-slot:icon><IconPen /></template>
          </UiButton>
        </RouterLink>

        <AppCompanyProfile
          class="profile__info"
          :company="company"
          :is-editing-possible="true"
        />

        <div class="profile__section profile-section">
          <h4 class="profile-section__title">Share your Company Page</h4>
          <p class="profile-section__description">
            You can share your company page this way to promote your business.
          </p>
          <div class="profile__section profile-section">
            <AppQRCodeDownloader
              class="profile__share-block"
              :encoding-value="companyPageUrl"
              description="Share your Company Page"
            />
            <AppUrlCopy
              class="profile__share-block"
              :url="companyPageUrl"
              description="Copy Company Page URL"
            />
          </div>
        </div>

        <div class="profile__section profile-section">
          <h4 class="profile-section__title">Embed Reviews Into Your Site</h4>
          <p class="profile-section__description">
            Share a review snippet for your site and customize its appearance
          </p>
          <RouterLink
            :to="{
              name: routesNames.widgetEditor,
            }"
            custom
            v-slot="{ navigate }"
          >
            <UiButton class="widget-button" view="control" @click="navigate">
              Widget Editor
            </UiButton>
          </RouterLink>
        </div>
      </div>
    </template>

    <template #default>
      <RouterView />
    </template>
  </AppStandardLayout>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.profile {
  position: relative;

  &__edit {
    position: absolute;
    top: 0;
    right: 0;
  }

  &__info {
    margin-bottom: 40px;
  }

  &__section {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__share-block {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
}

.profile-section {
  &__title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 0;
  }

  &__description {
    @include typography-main(12px);
    margin: 0;
    margin-bottom: 12px;
  }
}

.widget-button {
  width: 100%;
}
</style>
