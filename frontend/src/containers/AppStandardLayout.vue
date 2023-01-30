<script lang="ts">
import { computed, defineComponent } from "vue";
import AppHeader from "@/containers/AppHeader.vue";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppFooter from "@/containers/AppFooter.vue";
import UiLink from "@/components/UiLink.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import UiButton from "@/components/UiButton.vue";
import { useRouter } from "vue-router";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: {
    UiButton,
    IconArrowLeft,
    UiLink,
    AppFooter,
    AppContentWrapper,
    AppHeader,
  },
  props: {
    back: {
      type: [Boolean, Function],
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();
    const commonStore = useCommonStore();
    const userStore = useUserStore();

    const handleBack = () => {
      if (typeof props.back === "function") {
        props.back();
      } else {
        router.back();
      }
    };

    return {
      isLogged: computed(() => userStore.isLogged),
      mainNavigation: commonStore.getMainNavigation(),
      handleBack,
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
    <div class="layout__body">
      <AppContentWrapper>
        <UiButton
          v-if="back"
          view="control-secondary"
          class="back-button"
          @click.prevent="handleBack"
        >
          <template v-slot:icon>
            <IconArrowLeft />
          </template>
          Back
        </UiButton>
      </AppContentWrapper>
      <slot />
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
@import "@/styles/zIndex.scss";

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $color-blue-05;

  &__header {
    position: relative;
    flex-shrink: 0;
    flex-grow: 0;
    padding: 20px 0;
    background-color: $color-blue;
    border-radius: 0 0 $rounding-large $rounding-large;
    z-index: z-index-content(1);
  }

  &__body {
    flex-shrink: 1;
    flex-grow: 1;
    z-index: z-index-content();
  }

  &__footer {
    flex-shrink: 0;
    flex-grow: 0;
    position: relative;
    background-color: $color-blue;
    background-image: url("@/assets/illustrations/background3.svg");
    background-position: bottom left;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
    padding-top: 60px;
    padding-bottom: 60px;
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

.back-button {
  margin: 24px 0;
}
</style>
