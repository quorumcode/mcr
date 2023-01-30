<script lang="ts">
import { defineComponent, PropType } from "vue";
import IconInfo from "@/components/icons/IconInfo.vue";
import IconSuitcase from "@/components/icons/IconSuitcase.vue";
import AppLogo from "@/components/AppLogo.vue";
import { NavigationLink } from "@/types/commonTypes";

export default defineComponent({
  components: {
    IconInfo,
    IconSuitcase,
    AppLogo,
  },
  props: {
    links: {
      type: Array as PropType<NavigationLink[]>,
      default: [],
    },
    color: {
      type: String as PropType<"blue", "white">,
      default: "blue",
    },
  },
});
</script>

<template>
  <div class="sidebar-nav" :class="`_color-${color}`">
    <router-link to="/" class="sidebar-nav__logo-link">
      <AppLogo class="sidebar-nav__logo" />
    </router-link>
    <ul class="sidebar-nav__links sidebar-links">
      <li v-for="link in links" :key="link.title" class="sidebar-links__item">
        <router-link
          :to="link.route"
          :replace="link.replace"
          class="link"
          :class="`_color-${color}`"
          active-class="_is-active"
        >
          <component v-if="link.icon" :is="link.icon" class="link__icon" />
          {{ link.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.sidebar-nav {
  &__logo {
    width: 84px;
    height: auto;
    color: $color-blue;
  }

  &__logo-link {
    display: block;
    line-height: 0;
  }

  &__links {
    padding: 0;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 2px solid $color-blue-06;
  }

  &._color-white {
    .sidebar-nav__logo {
      color: $color-white;
    }

    .sidebar-nav__links {
      border-color: rgba($color-white, 0.1);
    }
  }
}

.sidebar-links {
  list-style: none;

  &__item {
    margin-bottom: 12px;
  }
}

.link {
  @include typography-main(12px, 700);
  display: flex;
  align-items: center;
  padding: 12px;
  padding-right: 6px;
  color: $color-blue-60;
  border-radius: $rounding-medium;
  text-decoration: none;

  &__icon {
    margin-right: 4px;
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: $color-blue;
  }

  &._is-active {
    background-color: $color-blue-06;
    color: $color-blue;
  }

  &._color-white {
    color: rgba($color-white, 0.6);

    &:hover {
      color: $color-white;
    }

    &._is-active {
      background-color: rgba($color-white, 0.1);
      color: $color-white;
    }
  }
}
</style>
