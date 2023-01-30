<script lang="ts">
import { defineComponent } from "vue";
import AppLogo from "@/components/AppLogo.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import UiLink from "@/components/UiLink.vue";
import Illustration1 from "@/components/illustrations/Illustration1.vue";
import Illustration2 from "@/components/illustrations/Illustration2.vue";
import Illustration3 from "@/components/illustrations/Illustration3.vue";
import Illustration4 from "@/components/illustrations/Illustration4.vue";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    Illustration4,
    Illustration3,
    Illustration1,
    Illustration2,
    UiLink,
    AppLogo,
    IconArrowLeft,
  },
  props: {
    back: {
      type: [Boolean, Function],
      default: false,
    },
    illustrationVariant: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const router = useRouter();

    const handleBack = () => {
      if (typeof props.back === "function") {
        props.back();
      } else {
        router.back();
      }
    };

    return {
      handleBack,
    };
  },
});
</script>

<template>
  <div class="layout">
    <aside class="layout__illustration illustration">
      <div class="illustration__background" />
      <div class="illustration__overflow">
        <router-link to="/" class="illustration__logo" tabindex="-1">
          <AppLogo />
        </router-link>
        <div v-if="illustrationVariant === 1" class="illustration__image _1">
          <Illustration1 />
        </div>
        <div v-if="illustrationVariant === 2" class="illustration__image _2">
          <Illustration2 />
        </div>
        <div v-if="illustrationVariant === 3" class="illustration__image _3">
          <Illustration3 />
        </div>
        <div v-if="illustrationVariant === 4" class="illustration__image _4">
          <Illustration4 />
        </div>
      </div>
      <div
        v-if="illustrationVariant === 1"
        class="illustration__waves _bottom"
      />
      <div
        v-if="[3, 4].includes(illustrationVariant)"
        class="illustration__waves _top"
      />
    </aside>
    <div class="layout__body">
      <div class="container">
        <header class="header">
          <UiLink
            class="header__back-link back-link"
            :class="{ _hidden: !back }"
            @click.prevent="handleBack"
          >
            <template v-slot:icon>
              <IconArrowLeft />
            </template>
            Back
          </UiLink>
          <h1 class="header__title">
            <slot name="title"></slot>
          </h1>
          <p v-if="$slots.description" class="header__description">
            <slot name="description"></slot>
          </p>
        </header>
        <main>
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/onMobile.scss";
@import "@/styles/zIndex.scss";

$aside-width: 540px;
$aside-width: 38%;

.layout {
  &__illustration {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: $aside-width;

    @include onMobile() {
      display: none;
    }
  }

  &__body {
    padding-left: $aside-width;
    padding-top: 44px;
    padding-bottom: 80px;
    min-height: 100vh;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    @include onMobile() {
      padding-left: 0;
    }
  }
}

.container {
  width: 420px;
  margin: 0 auto;
  padding-left: 32px;
  padding-right: 32px;

  @include onMobile {
    max-width: 420px;
    width: 100%;
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
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 40px;
    }
  }

  &__description {
    @include typography-main(12px);
    margin-bottom: 60px;
  }
}

.back-link {
  @include typography-main(16px, 600);

  &._hidden {
    visibility: hidden;
  }
}

.illustration {
  background-color: $color-blue;
  padding-bottom: 140px;
  box-sizing: border-box;

  &__overflow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__logo {
    margin-top: 80px;
    margin-bottom: 40px;
    margin-left: 108px;
    z-index: z-index-content(1);
    flex-shrink: 0;
    flex-grow: 0;
    color: $color-white;
  }

  &__image {
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 92px;
    flex-shrink: 0;
    flex-grow: 0;

    &._1 {
      margin-left: 92px;
    }

    &._3 {
      margin-left: 56px;
    }

    &._4 {
      margin-left: 112px;
    }
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("@/assets/illustrations/background1.svg");
    background-position: top left;
    background-repeat: no-repeat;
    background-size: cover;
    mix-blend-mode: overlay;
    z-index: -1;
    overflow: hidden;
  }

  &__waves {
    pointer-events: none;
    position: absolute;
    bottom: -22px;
    right: -230px;
    width: 381px;
    height: 283px;
    background: url("@/assets/illustrations/waves.svg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    &._top {
      top: 15px;
      right: -180px;
    }

    &._bottom {
      bottom: -22px;
      right: -230px;
    }
  }
}
</style>
