<script lang="ts">
import { computed, defineComponent } from "vue";
import { routesNames } from "@/routesNames";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import AppHeader from "@/containers/AppHeader.vue";
import AppSidebarProfile from "@/components/AppSidebarProfile.vue";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppFooter from "@/containers/AppFooter.vue";
import UiLink from "@/components/UiLink.vue";
import UiButton from "@/components/UiButton.vue";
import IconUser from "@/components/icons/IconUser.vue";
import IconBusiness from "@/components/icons/IconBusiness.vue";
import IconCreditCard from "@/components/icons/IconCreditCard.vue";
import IconDashboard from "@/components/icons/IconDashboard.vue";
import IconShare from "@/components/icons/IconShare.vue";
import IconMail from "@/components/icons/IconMail.vue";

export default defineComponent({
  components: {
    UiButton,
    UiLink,
    AppFooter,
    AppContentWrapper,
    AppHeader,
    AppSidebarProfile,
  },
  props: {
    companyId: {
      type: String,
      default: "",
    },
    bodySizeClass: {
      type: String,
      default: "_small",
    },
  },
  setup(props) {
    const commonStore = useCommonStore();
    const userStore = useUserStore();

    const sidebarLinks = [
      {
        title: "User Account",
        route: {
          name: routesNames.companyEditUserAccount,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconUser,
      },
      {
        title: "Business Profile",
        route: {
          name: routesNames.companyEditBusinessProfile,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconBusiness,
      },
      {
        title: "Subscription",
        route: {
          name: routesNames.companyEditSubscription,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconCreditCard,
      },
      {
        title: "Embed Reviews into Your Site",
        route: {
          name: routesNames.widgetEditor,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconDashboard,
      },
      {
        title: "Share Your Reviews Page",
        route: {
          name: routesNames.companyShareYourReviews,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconShare,
      },
      {
        title: "Email Settings",
        route: {
          name: routesNames.companyEditEmailTemplates,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconMail,
      },
    ];

    return {
      isLogged: computed(() => userStore.isLogged),
      mainNavigation: commonStore.getMainNavigation(),
      sidebarLinks,
    };
  },
});
</script>

<template>
  <div class="layout">
    <div class="layout__header">
      <AppContentWrapper>
        <AppHeader view="minimal">
          <template v-if="isLogged" #menu>
            <ul class="header-menu">
              <li
                class="header-menu__item"
                v-for="link in mainNavigation"
                :key="link.title"
              >
                <RouterLink
                  class="header-menu__link menu-link"
                  :to="link.route"
                  active-class="_is-active"
                >
                  <component
                    v-if="link.icon"
                    :is="link.icon"
                    class="menu-link__icon"
                  />
                  {{ link.title }}
                </RouterLink>
              </li>
            </ul>
          </template>
        </AppHeader>
      </AppContentWrapper>
    </div>
    <div class="layout__sidebar">
      <div class="layout__sidebar-wrap">
        <AppSidebarProfile :links="sidebarLinks" />
      </div>
    </div>
    <div :class="`layout__body ${bodySizeClass}`">
      <AppContentWrapper>
        <h1 class="layout__body-title"><slot name="title"></slot></h1>
        <slot />
      </AppContentWrapper>
    </div>
    <div class="layout__footer">
      <AppContentWrapper>
        <AppFooter />
      </AppContentWrapper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/onMobile.scss";
@import "@/styles/zIndex.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/responsive.scss";

.layout {
  display: grid;
  grid-template-columns: 300px 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    "n n n"
    "s b b"
    "f f f";
  min-height: 100vh;
  background-color: #f1f2f9;

  &__header {
    grid-area: n;
    background-color: $color-blue;
    border-radius: 0 0 $rounding-large $rounding-large;
    padding: 20px 0;
    z-index: z-index-content(1);
    width: 100%;
    max-height: 88px;
  }

  &__sidebar {
    grid-area: s;
    width: 216px;
    transition: margin-left 0.5s;
    margin-top: 40px;
    box-sizing: border-box;
    justify-self: center;

    &-wrap {
      @include shadow-x-large;
      padding: 24px;
      background-color: $color-white;
      border-radius: $rounding-large;
    }
  }

  &__body {
    margin-top: 40px;
    margin-bottom: 120px;
    grid-area: b;
    min-height: 400px;

    &._small {
      max-width: 672px;
    }

    &._medium {
      max-width: 938px;
    }

    &-title {
      @include typography-header(32px, 700);
      color: $color-blue;
      margin: 0 0 24px;
    }
  }

  &__footer {
    position: relative;
    grid-area: f;
    background-color: $color-blue;
    padding: 60px 108px;
    z-index: z-index-content(1);
    background-image: url("@/assets/illustrations/background3.svg");
    background-position: bottom left;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
  }
}

.header-menu {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;

  @include responsive-media((xs, md)) {
    display: none;
  }

  &__item {
    &:not(:last-child) {
      margin-right: 40px;
    }
  }
}

.menu-link {
  @include typography-main(12px, 700);
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: $rounding-medium;
  text-decoration: none;
  color: rgba($color-white, 0.6);

  &:hover {
    color: $color-white;
  }

  &__icon {
    margin-right: 4px;
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: $color-white;
  }

  &._is-active {
    background-color: rgba($color-white, 0.1);
    color: $color-white;
  }
}
</style>
