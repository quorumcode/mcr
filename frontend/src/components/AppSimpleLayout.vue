<script lang="ts">
import { defineComponent } from "vue";
import AppLogo from "@/components/AppLogo.vue";
import AppCompanyLogo from "@/components/AppCompanyLogo.vue";

export default defineComponent({
  components: {
    AppLogo,
    AppCompanyLogo,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    companyLogoUrl: {
      type: String,
      default: "",
    },
  },
});
</script>

<template>
  <div class="layout">
    <div class="layout__background"></div>
    <div class="layout__center">
      <header class="header">
        <AppCompanyLogo
          v-if="companyLogoUrl"
          :url="companyLogoUrl"
          :size="52"
        />
        <RouterLink v-else to="/" class="header__logo-link">
          <AppLogo class="header__logo" />
        </RouterLink>
        <h1 v-if="title" class="header__title">{{ title }}</h1>
      </header>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/responsive.scss";

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
    width: 808px;
    padding: 20px 104px 60px;
    background-color: $color-white;
    border-radius: $rounding-large;
    box-sizing: border-box;
  }
}

.header {
  line-height: 0;
  margin-bottom: 12px;

  &__logo-link {
    display: inline-block;
  }

  &__logo {
    width: 70px;
    height: auto;
    color: $color-blue;
  }

  &__title {
    @include typography-header(32px, 700);
    color: $color-blue;
    margin: 0;
    margin-top: 40px;
  }
}

@include responsive-media((xs, sm)) {
  .layout {
    &__background,
    &::before,
    &::after {
      display: none;
    }

    &__center {
      border-radius: 0;
      padding: 8px 24px 40px;
    }
  }

  .header {
    &__title {
      @include typography-header(24px, 700);
    }
  }
}
</style>
