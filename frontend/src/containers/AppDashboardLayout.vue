<script lang="ts">
import { defineComponent, PropType } from "vue";
import { routesNames } from "@/routesNames";
import AppSidebarNav from "@/components/AppSidebarNav.vue";
import AppFooter from "@/containers/AppFooter.vue";
import AppUserDropdown from "@/containers/AppUserDropdown.vue";
import { NavigationLink } from "@/types/commonTypes";

export default defineComponent({
  components: {
    AppUserDropdown,
    AppFooter,
    AppSidebarNav,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    navLinks: {
      type: Array as PropType<NavigationLink[]>,
      default: () => [],
    },
  },
  setup() {
    return {
      routesNames,
    };
  },
});
</script>

<template>
  <div class="layout">
    <aside class="layout__nav">
      <div class="nav">
        <AppSidebarNav color="white" :links="navLinks" />
      </div>
    </aside>

    <aside class="layout__sidebar" v-if="$slots.sidebar">
      <slot name="sidebar" />
    </aside>

    <div class="layout__body">
      <header class="layout__header header">
        <h1 class="header__title">{{ title }}</h1>
        <div class="header__user">
          <AppUserDropdown />
        </div>
      </header>
      <main>
        <slot />
      </main>
    </div>

    <footer class="layout__footer">
      <AppFooter />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/zIndex.scss";

.layout {
  display: grid;
  grid-template-columns: min-content min-content 1fr;
  grid-template-rows: auto min-content;
  grid-template-areas:
    "n s b"
    "f f f";
  min-height: 100vh;
  background-color: $color-blue-05;

  &__nav {
    grid-area: n;
    width: 164px;
    z-index: z-index-content(2);
    background-color: $color-white;
  }

  &__sidebar {
    grid-area: s;
    width: 340px;
    transition: margin-left 0.5s;
    @include shadow-large;
    padding: 40px 40px 40px 32px;
    box-sizing: border-box;
    background-color: $color-white;
    border-radius: 0 $rounding-large 0 0;
  }

  &__body {
    margin-top: 28px;
    margin-right: 52px;
    margin-bottom: 24px;
    margin-left: 40px;
    grid-area: b;
    z-index: z-index-content(2);
    min-height: 400px;
  }

  &__header {
    margin-bottom: 40px;
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

.nav {
  @include shadow-large;
  padding: 24px;
  box-sizing: border-box;
  border-radius: 0 $rounding-large 0 0;
  background-color: $color-blue;
  height: 100%;
  background-image: url("@/assets/illustrations/background3.svg");
  background-position: bottom -355px left; // 355 = footer height
  background-repeat: no-repeat;
  background-blend-mode: overlay;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $color-blue;

  &__title {
    @include typography-header(32px, 700);
    margin: 0;
  }
}
</style>
