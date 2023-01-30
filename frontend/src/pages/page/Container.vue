<script lang="ts">
import { computed, defineComponent, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppHeader from "@/containers/AppHeader.vue";
import AppFooter from "@/containers/AppFooter.vue";
import { usePageStore } from "./store";
import UiText from "@/components/UiText.vue";

export default defineComponent({
  components: { UiText, AppHeader, AppContentWrapper, AppFooter },
  async setup() {
    const route = useRoute();
    const store = usePageStore();
    const pageName = computed(() => route.params.name);
    const DEFAULT_PAGE_TITLE =
      (import.meta.env.VITE_DEFAULT_PAGE_TITLE as string) ||
      "My Client Reviews";

    const setTitle = () => {
      window.document.title = `${store.page?.title} | ${DEFAULT_PAGE_TITLE}`;
    };

    watch(pageName, () => {
      if (!pageName.value) {
        return;
      }
      store.fetchPage(pageName.value).then(() => {
        setTitle();
      });
    });

    onMounted(() => {
      setTitle();
    });

    await store.fetchPage(pageName.value);

    return {
      page: computed(() => store.page),
    };
  },
});
</script>

<template>
  <div class="page">
    <section class="page__jumbotron jumbotron">
      <AppContentWrapper>
        <AppHeader class="jumbotron__header" />
        <div
          v-if="page && page.withHeaderImage"
          class="jumbotron__body jumbotron-body"
        >
          <div class="jumbotron-body__content">
            <h1 class="jumbotron-body__title">{{ page.title }}</h1>
            <p v-if="page.subtitle" class="jumbotron-body__description">
              {{ page.subtitle }}
            </p>
          </div>
          <div class="jumbotron-body__image">
            <img src="@/assets/illustrations/image11.svg" alt="" />
          </div>
        </div>
      </AppContentWrapper>
    </section>

    <section class="page__body">
      <AppContentWrapper>
        <UiText v-if="page" :body="page.body">
          <template v-if="!page.withHeaderImage">
            <h1>{{ page.title }}</h1>
            <p v-if="page.subtitle">{{ page.subtitle }}</p>
          </template>
        </UiText>
        <div v-else>Page not found</div>
      </AppContentWrapper>
    </section>

    <div class="page__footer">
      <AppContentWrapper>
        <AppFooter />
      </AppContentWrapper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";

.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__jumbotron {
    flex-shrink: 0;
    flex-grow: 0;
    max-height: 101px;
  }

  &__body {
    padding-top: 80px;
    padding-bottom: 120px;
    flex-shrink: 1;
    flex-grow: 1;
  }

  &__footer {
    flex-shrink: 0;
    flex-grow: 0;
    background-color: $color-blue;
    background-image: url("@/assets/illustrations/background3.svg");
    background-position: bottom left;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
    padding-top: 60px;
    padding-bottom: 60px;
  }
}

.jumbotron {
  position: relative;
  color: $color-white;
  background-color: $color-blue;
  background-image: url("@/assets/illustrations/background4.svg");
  background-position: top right;
  background-size: auto 100%;
  background-repeat: no-repeat;
  background-blend-mode: overlay;

  &__header {
    padding: 20px 0;
  }

  &__body {
    padding-top: 18px;

    @include responsive-media((xs, sm)) {
      padding-top: 0;
      padding-bottom: 54px;
    }
  }
}

.jumbotron-body {
  display: flex;
  align-items: center;

  @include responsive-media((xs, sm)) {
    flex-direction: column-reverse;
  }

  &__content {
    width: 60%;
    flex-shrink: 1;
    flex-grow: 1;

    @include responsive-media((xs, sm)) {
      width: auto;
    }
  }

  &__image {
    width: 22%;
    flex-shrink: 1;
    flex-grow: 1;
    margin-left: 40px;

    @include responsive-media((xs, sm)) {
      width: auto;
      margin-left: 0;
      margin-bottom: 24px;
    }

    & > img {
      max-width: 100%;
      height: auto;
    }
  }

  &__title {
    @include typography-header(40px, 700);
    margin: 0;
    margin-bottom: 12px;

    @include responsive-media((xs, sm)) {
      @include typography-header(32px, 700);
    }
  }

  &__description {
    @include typography-main(20px);
    margin-bottom: 60px;
    opacity: 0.6;
    max-width: 700px;

    @include responsive-media((xs, sm)) {
      @include typography-main(14px);
      max-width: 400px;
      margin-bottom: 40px;
    }
  }
}
</style>
