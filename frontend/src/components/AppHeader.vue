<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { routesNames } from "@/routesNames";
import AppLogo from "./AppLogo.vue";
import AppUserDropdown from "@/containers/AppUserDropdown.vue";
import { useResponsive } from "@/helpers/useResponsive";

export default defineComponent({
  components: { AppUserDropdown, AppLogo },
  props: {
    view: {
      type: String as PropType<"default" | "minimal">,
      default: "default",
    },
    isUserLogged: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { currentInterval } = useResponsive();
    const registerButtonView = computed(() => {
      if (["xs", "sm"].includes(currentInterval.value)) {
        return "primary-small";
      }
      return "primary";
    });

    return { registerButtonView, routesNames };
  },
});
</script>

<template>
  <header class="app-header" :class="`_view-${view}`">
    <RouterLink to="/" class="app-header__logo">
      <AppLogo />
    </RouterLink>
    <div class="app-header__menu" v-if="$slots.menu">
      <slot name="menu"></slot>
    </div>
    <div class="app-header__profile">
      <template v-if="isUserLogged">
        <AppUserDropdown />
      </template>
      <template v-else>
        <RouterLink
          class="app-header__login link"
          :to="{ name: routesNames.login }"
        >
          <span class="on-desktop">Business Login</span>
          <span class="on-mobile">Login</span>
        </RouterLink>
        <RouterLink
          class="app-header__register link"
          :to="{ name: routesNames.registration }"
        >
          <UiButton :view="registerButtonView">Register</UiButton>
        </RouterLink>
      </template>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/responsive.scss";
@import "@/styles/typography.scss";

.app-header {
  display: flex;
  align-items: center;
  color: $color-white;

  &__logo {
    color: #fff;
    margin-right: 20px;
    line-height: 0;
    flex-shrink: 0;
    flex-grow: 0;

    & > * {
      max-width: 100%;
      height: auto;
    }
  }

  &__profile {
    margin-left: auto;
  }

  &__login {
    color: $color-white;
    margin-right: 20px;
  }

  &__register {
    text-decoration: none;
  }

  &._view-minimal {
    .app-header__logo {
      width: 83px;
      height: 48px;
    }
  }
}

.link {
  display: inline-block;
  padding: 10px 20px;
  text-decoration: none;
  color: $color-white;
  border-radius: $rounding-medium;
  transition: background-color 0.2s;

  &:hover {
    color: $color-white;
    background-color: rgba($color-white, 0.06);
  }
}

@include responsive-media((md, xl)) {
  .on-mobile {
    display: none;
  }
}

@include responsive-media((xs, sm)) {
  .app-header {
    @include typography-main(14px);

    &__logo {
      width: 67px;

      & > * {
        max-width: 100%;
        height: auto;
      }
    }

    &__login {
      margin-right: 6px;
    }

    &._view-minimal {
      .app-header__logo {
        width: 67px;
        height: 40px;
      }
    }
  }

  .link {
    padding: 6px;
  }

  .on-desktop {
    display: none;
  }
}
</style>
