<script lang="ts">
import { defineComponent, PropType } from "vue";
import AppRating from "@/components/AppRating.vue";
import UiButton from "@/components/UiButton.vue";
import { RouteLocationRaw, useRouter } from "vue-router";
import AppCompanyLogo from "@/components/AppCompanyLogo.vue";
import { useResponsive } from "@/helpers/useResponsive";

export default defineComponent({
  components: {
    AppCompanyLogo,
    UiButton,
    AppRating,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      default: "",
    },
    ratingValue: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    profileUrl: {
      type: [String, Object] as PropType<string | RouteLocationRaw>,
      default: "",
    },
  },
  setup(props) {
    const router = useRouter();
    const { isMobile } = useResponsive();

    const handleClickOnCard = () => {
      if (!isMobile.value) {
        return;
      }
      router.push(props.profileUrl);
    };

    return { handleClickOnCard };
  },
});
</script>

<template>
  <article class="company-card" @click="handleClickOnCard">
    <div class="company-card__logo">
      <AppCompanyLogo :url="logoUrl" :size="52" />
    </div>
    <h3 class="company-card__title">{{ name }}</h3>
    <AppRating
      class="company-card__rating"
      :value="ratingValue"
      :reviews-count="reviewsCount"
    />
    <RouterLink v-if="profileUrl" :to="profileUrl" class="company-card__button">
      <UiButton view="control">View Profile</UiButton>
    </RouterLink>
  </article>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";
@import "@/styles/responsive.scss";

.company-card {
  @include shadow-large;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: $color-white;
  border-radius: $rounding-medium;
  text-decoration: none;
  color: $color-black;
  text-align: center;

  &__logo {
    text-align: center;
    margin-bottom: 8px;
    line-height: 0;
  }

  &__title {
    @include typography-main(16px, 600);
    margin: 0;
    margin-bottom: 8px;
    color: $color-blue;
    overflow-wrap: break-word;
  }

  &__rating {
    align-self: center;
    margin-bottom: auto;
  }

  &__button {
    display: block;
    margin-top: 24px;
    text-decoration: none;

    & > * {
      display: block;
      width: 100%;
    }
  }
}

@include responsive-media((xs, sm)) {
  .company-card {
    padding: 12px;
    cursor: pointer;

    &__title {
      @include typography-main(12px, 600);
    }

    &__button {
      display: none;
    }
  }
}
</style>
