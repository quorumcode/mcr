<script lang="ts">
import { computed, defineComponent, PropType, ref, reactive } from "vue";
import IconMapPoint from "@/components/icons/IconMapPoint.vue";
import IconPhone from "@/components/icons/IconPhone.vue";
import IconSphere from "@/components/icons/IconSphere.vue";
import IconMail from "@/components/icons/IconMail.vue";
import { Company } from "@/types/commonTypes";
import UiButton from "@/components/UiButton.vue";
import IconDoubleArrow from "@/components/icons/IconDoubleArrow.vue";
import UiModal from "@/components/UiModal.vue";
import IconPen from "@/components/icons/IconPen.vue";
import { routesNames } from "@/routesNames";
import AppRating from "@/components/AppRating.vue";
import AppCompanyLogo from "@/components/AppCompanyLogo.vue";

export default defineComponent({
  components: {
    AppCompanyLogo,
    AppRating,
    IconPen,
    UiModal,
    IconDoubleArrow,
    UiButton,
    IconMail,
    IconSphere,
    IconPhone,
    IconMapPoint,
  },
  props: {
    company: {
      type: Object as PropType<Company>,
      required: true,
    },
    isEditingPossible: {
      type: Boolean,
    },
  },
  setup(props) {
    const isAboutModalOpened = ref(false);
    const showTooltip = ref(false);

    const addressString = computed(() => {
      if (!props.company.address) {
        return "";
      }
      const newZealand =
        props.company.address.administrativeDivision.toLowerCase().trim() ===
        "new zealand"
          ? "New Zealand"
          : "";

      const {
        route,
        streetNumber,
        town,
        state = "",
        // administrativeDivision,
        postalCode,
      } = props.company.address;
      return `${streetNumber} ${route} ${town} ${state} ${postalCode} ${newZealand}`;
    });

    const openAboutModal = () => {
      isAboutModalOpened.value = true;
    };
    const closeAboutModal = () => {
      isAboutModalOpened.value = false;
    };

    const formatSiteUrl = (siteUrl: string) => {
      const http = "http://";
      const https = "https://";

      let indexString = siteUrl.indexOf(http);
      if (indexString !== -1) {
        return siteUrl.slice(http.length + 1);
      }
      indexString = siteUrl.indexOf(https);
      if (indexString !== -1) {
        return siteUrl.slice(http.length + 1);
      }
      return siteUrl;
    };

    const siteUrlWithProtocol = (siteUrl: string) => {
      const http = "http://";
      const https = "https://";

      let indexString = siteUrl.indexOf(http);
      if (indexString !== -1) {
        return siteUrl;
      }
      indexString = siteUrl.indexOf(https);
      if (indexString !== -1) {
        return siteUrl;
      }
      return https + siteUrl;
    };

    return {
      routesNames,
      addressString,
      isAboutModalOpened,
      openAboutModal,
      closeAboutModal,
      formatSiteUrl,
      siteUrlWithProtocol,
      showTooltip,
    };
  },
});
</script>

<template>
  <section class="app-company-profile">
    <div class="app-company-profile__main main">
      <div class="main__logo">
        <AppCompanyLogo :url="company.logo" :size="112" rounding="large" />
      </div>
      <h1 hidden>{{ company.name }} Online Reviews</h1>
      <h3 class="main__title">{{ company.name }}</h3>
      <div v-if="company.isTest" class="main__test">Test company</div>
      <div class="main__address">
        <div class="element">
          <IconMapPoint class="element__icon" />
          {{ addressString }}
        </div>
      </div>
      <div class="main__rating">
        <AppRating
          :adaptive="false"
          :value="company.reviewsStats?.rateAvg"
          :reviews-count="company.reviewsStats?.count"
          place="company-page-card"
        />
      </div>
    </div>
    <div class="app-company-profile__contacts contacts">
      <div class="contacts__title">Contacts</div>
      <div class="contacts__data">
        <div v-if="company.contactPhone" class="element">
          <IconPhone class="element__icon" />
          <a :href="`tel:${company.contactPhone}`">
            {{ company.contactPhone }}
          </a>
        </div>
        <div
          v-if="company.webSite"
          class="element element-site"
          :class="{ '_is-have-site': company.webSite }"
        >
          <IconSphere class="element__icon" />
          <a
            @mouseover="showTooltip = true"
            @mouseleave="showTooltip = false"
            :href="siteUrlWithProtocol(company.webSite)"
            target="_blank"
          >
            {{ formatSiteUrl(company.webSite) }}
          </a>
          <div
            v-if="showTooltip && company.webSite.length > 30"
            class="site-tooltip"
          >
            {{ formatSiteUrl(company.webSite) }}
          </div>
        </div>
        <div v-if="company.emailForReviewNotifications" class="element">
          <IconMail class="element__icon" />
          <a :href="`mailto:${company.emailForReviewNotifications}`">
            {{ company.emailForReviewNotifications }}
          </a>
        </div>
      </div>
    </div>
    <div
      class="app-company-profile__section profile-section"
      v-if="company.about"
    >
      <div class="profile-section__header">
        <h2 class="profile-section__title">About</h2>
        <div>
          <UiButton view="control-secondary" @click="openAboutModal">
            <template v-slot:icon><IconDoubleArrow /></template>
          </UiButton>
        </div>
      </div>
      <p class="profile-section__text">
        {{ company.about }}
      </p>
    </div>

    <teleport to="body">
      <UiModal v-if="isAboutModalOpened" @close="closeAboutModal">
        <div class="about-modal">
          <div class="about-modal__header">
            <div class="about-modal__title">About</div>
            <router-link
              v-if="isEditingPossible"
              :to="{
                name: routesNames.companyEditBusinessInfo,
                params: { id: company._id },
              }"
            >
              <UiButton view="control-secondary">
                <template v-slot:icon><IconPen /></template>
              </UiButton>
            </router-link>
          </div>
          <p class="about-modal__text">
            {{ company.about }}
          </p>
          <div class="about-modal__buttons">
            <UiButton class="about-modal__button" @click="closeAboutModal">
              Close
            </UiButton>
          </div>
        </div>
      </UiModal>
    </teleport>
  </section>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.app-company-profile {
  color: $color-blue;

  &__main {
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 2px solid rgba(30, 43, 153, 0.06);
  }

  &__contacts {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.element {
  @include typography-main(12px);
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-bottom: 12px;
  }

  &__icon {
    width: 20px;
    min-width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  &-site {
    position: relative;
  }
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__logo {
    margin-bottom: 4px;
    text-align: center;
    line-height: 0;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    text-align: center;
    overflow-wrap: anywhere;
  }

  &__test {
    @include typography-main(12px, 600);
    color: $color-yellow;
    background-color: $color-black-60;
    border-radius: $rounding-medium;
    padding: 4px 8px;
  }

  &__address {
    margin-bottom: 12px;
  }
}

.contacts {
  &__title {
    @include typography-main(16px, 600);
    margin-bottom: 12px;
  }

  &__data {
    display: flex;
    flex-direction: column;

    a {
      @include typography-main(12px);
      color: $color-blue;
      text-decoration: none;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}

.profile-section {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    @include typography-main(16px, 600);
    margin: 0;
    margin-right: 12px;
    color: $color-blue;
  }

  &__text {
    @include typography-main(14px);
    margin: 0;
    color: $color-black-60;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }
}

.about-modal {
  max-width: 576px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    margin-right: 12px;
    color: $color-blue;
  }

  &__text {
    @include typography-main(14px);
    margin: 0;
    color: $color-black;
    margin-bottom: 40px;
  }

  &__buttons {
    text-align: right;
  }

  &__button {
    min-width: 184px;
  }
}

.site-tooltip {
  @include typography-main(10px);
  color: $color-blue;
  background-color: $color-white;
  border-radius: $rounding-medium;
  position: absolute;
  top: 20px;
  padding: 8px;
  box-shadow: 4px 4px 10px rgba($color-blue, 0.2);
  display: flex;
  width: max-content;
}
</style>
