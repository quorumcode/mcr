<script lang="ts">
import { defineComponent } from "vue";
import UiButton from "@/components/UiButton.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import IconSuitcase from "@/components/icons/IconSuitcase.vue";
import IconInfo from "@/components/icons/IconInfo.vue";
import IconCreditCard from "@/components/icons/IconCreditCard.vue";
import { routesNames } from "@/routesNames";
import AppSidebarNav from "@/components/AppSidebarNav.vue";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    AppSidebarNav,
    UiButton,
    IconArrowLeft,
  },
  props: {
    companyId: {
      type: String,
      required: true,
    },
    back: {
      type: [Boolean, Function],
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();

    const sidebarLinks = [
      {
        title: "Business Info",
        route: {
          name: routesNames.companyEditBusinessInfo,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconSuitcase,
      },
      {
        title: "Additional Info",
        route: {
          name: routesNames.companyEditAdditionalInfo,
          params: { id: props.companyId },
        },
        replace: true,
        icon: IconInfo,
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
    ];

    const handleBack = () => {
      if (typeof props.back === "function") {
        props.back();
      } else {
        router.back();
      }
    };

    return {
      sidebarLinks,
      handleBack,
    };
  },
});
</script>

<template>
  <div class="layout">
    <div class="layout__background"></div>
    <div class="layout__center">
      <header class="header">
        <UiButton
          view="control-secondary"
          class="header__back-link back-link"
          :class="{ _hidden: !back }"
          @click.prevent="handleBack"
        >
          <template v-slot:icon>
            <IconArrowLeft />
          </template>
          Back
        </UiButton>
        <h1 class="header__title">
          <slot name="title"></slot>
        </h1>
      </header>
      <main>
        <slot />
      </main>
      <aside class="sidebar">
        <AppSidebarNav
          class="sidebar__content"
          color="blue"
          :links="sidebarLinks"
        />
      </aside>
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

$sidebar-offset: 104px;

.layout {
  min-height: 100vh;
  display: flex;
  background-color: $color-blue;

  &__background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("@/assets/illustrations/background2.svg");
    background-position: top;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    mix-blend-mode: overlay;
  }

  &::before,
  &::after {
    content: "";
    flex-shrink: 1;
    flex-grow: 1;
  }

  &__center {
    flex-shrink: 1;
    flex-grow: 0;
    position: relative;
    z-index: z-index-content(1);
    width: 420px;
    padding-left: 194px;
    padding-right: 194px;
    background-color: $color-white;
    border-radius: $rounding-large;
    padding-top: 28px;
    padding-bottom: 80px;
    margin-left: $sidebar-offset;

    @media (max-width: 900px) {
      padding-left: 112px;
      padding-right: 32px;
    }
  }
}

.header {
  &__back-link {
    margin-bottom: 12px;
  }

  &__title {
    @include typography-header(32px, 700);
    margin: 0;
    color: $color-blue;
    margin-bottom: 24px;
  }
}

.back-link {
  &._hidden {
    visibility: hidden;
  }
}

.sidebar {
  width: 184px;
  box-sizing: border-box;
  position: absolute;
  left: -$sidebar-offset;
  top: 0;
  height: 100%;

  &__content {
    @include shadow-large;
    position: sticky;
    top: 54px;
    box-sizing: border-box;
    min-height: 377px;
    padding: 24px;
    background-color: $color-white;
    border-radius: $rounding-large;
  }
}
</style>
