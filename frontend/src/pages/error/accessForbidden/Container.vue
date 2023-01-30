<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import UiButtonLink from "@/components/UiButtonLink.vue";

export default defineComponent({
  components: {
    UiButtonLink,
  },
  async setup() {
    const router = useRouter();

    return {
      router,
    };
  },
});
</script>

<template>
  <div class="access-forbidden">
    <img
      class="access-forbidden__image"
      src="@/assets/illustrations/error-page.svg"
      alt=""
    />
    <section class="content">
      <h2 class="access-forbidden__title">Access forbidden</h2>
      <p>You are not allowed to access this page.</p>
      <p>Only residents of Australlia and New Zealand</p>
      <p>can leave reviews on myclientreviews.com.au.</p>
      <UiButtonLink
        view="primary"
        class="access-forbidden__button"
        @click="router.push('/')"
      >
        Go to Home Page
      </UiButtonLink>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";

.access-forbidden {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  min-height: 100vh;
  background-color: $color-blue;

  &__image {
    margin-top: 115px;
    position: relative;
    left: -42px;
    width: 742px;
    height: 453px;

    @include responsive-media((xs, sm)) {
      width: 100%;
      height: auto;
    }
  }

  &__title {
    @include typography-main(24px, 700);
    color: $color-white;
    margin: 0;
  }

  p {
    @include typography-main(14px);
    color: $color-white;
    margin: 0;
  }

  &__button {
    margin: 30px 0;
    padding: 0 35px !important;
  }
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: -100px;
  z-index: 1;

  @include responsive-media((xs, sm)) {
    margin: 0;
    padding: 0 10%;
    text-align: center;
  }
}
</style>
