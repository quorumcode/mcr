<script lang="ts">
import { defineComponent, PropType } from "vue";
import AppLogo from "@/components/AppLogo.vue";

type SectionsLinks = {
  [sectionTitle: string]: {
    [pageTitle: string]: string;
  };
};

export default defineComponent({
  components: { AppLogo },
  props: {
    sectionsLinks: {
      type: Object as PropType<SectionsLinks>,
      default: () => ({}),
    },
  },
});
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__item _logo">
      <AppLogo class="app-footer__logo" />
    </div>
    <section
      v-for="(links, sectionName, index) in sectionsLinks"
      :key="sectionName"
      class="app-footer__item section"
      :class="`_${index}`"
    >
      <h4 class="section__title">{{ sectionName }}</h4>
      <ul class="section__links">
        <li v-for="(url, name) in links" :key="name">
          <RouterLink :to="url" class="section__link" target="_blank">
            {{ name }}
          </RouterLink>
        </li>
      </ul>
    </section>
  </footer>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";

.app-footer {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 24px;
  color: $color-white;

  &__logo {
    width: 182px;
    height: auto;
  }
}

.section {
  &__title {
    @include typography-main(24px, 500);
    margin: 0;
    margin-bottom: 24px;
  }

  &__links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-gap: 12px;
  }

  &__link {
    @include typography-main(16px, 400);
    text-decoration: none;
    color: currentColor;
    opacity: 0.6;

    &:hover {
      color: currentColor;
      opacity: 1;
    }
  }
}

@include responsive-media(md) {
  .app-footer {
    grid-template-columns: repeat(3, 1fr);

    &__item {
      &._logo {
        grid-column: span 3;
      }
    }
  }
}

@include responsive-media((xs, sm)) {
  .app-footer {
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 60px;

    &__item {
      &._logo {
        grid-column: span 2;
      }
      &._1 {
        order: 3;
      }
    }

    &__logo {
      width: 102px;
    }
  }
}
</style>
