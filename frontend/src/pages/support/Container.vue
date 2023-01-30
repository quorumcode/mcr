<script lang="ts">
import { defineComponent } from "vue";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppHeader from "@/containers/AppHeader.vue";
import AppFooter from "@/containers/AppFooter.vue";
import { useRouter } from "vue-router";
import UiButton from "@/components/UiButton.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";

export default defineComponent({
  components: {
    AppContentWrapper,
    AppHeader,
    AppFooter,
    UiButton,
    IconArrowLeft,
  },
  setup() {
    const VITE_HELPDESK_LICENSE_ID = import.meta.env
      .VITE_HELPDESK_LICENSE_ID as string;
    const VITE_HELPDESK_CONTACT_FORM_ID = import.meta.env
      .VITE_HELPDESK_CONTACT_FORM_ID as string;

    const router = useRouter();

    const back = () => {
      router.back();
    };

    return {
      VITE_HELPDESK_LICENSE_ID,
      VITE_HELPDESK_CONTACT_FORM_ID,
      back,
    };
  },
});
</script>

<template>
  <div class="page">
    <section class="page__jumbotron jumbotron">
      <AppContentWrapper>
        <AppHeader class="jumbotron__header" />
      </AppContentWrapper>
    </section>
    <section class="page__body">
      <AppContentWrapper>
        <UiButton
          view="control-secondary"
          class="page__back-link"
          @click.prevent="back"
        >
          <template v-slot:icon>
            <IconArrowLeft />
          </template>
          Back
        </UiButton>
        <iframe
          v-if="VITE_HELPDESK_LICENSE_ID && VITE_HELPDESK_CONTACT_FORM_ID"
          sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
          width="100%"
          height="660px"
          style="border: 0; overflow: hidden; overflow-x: auto"
          :src="`https://forms.helpdesk.com?licenseID=${VITE_HELPDESK_LICENSE_ID}=&contactFormID=${VITE_HELPDESK_CONTACT_FORM_ID}`"
        >
          Your browser does not allow embedded content.
        </iframe>
        <span v-else>Error: helpdesk data keys not found</span>
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
    padding-top: 30px;
    padding-bottom: 120px;
    flex-shrink: 1;
    flex-grow: 1;
  }

  &__back-link {
    margin-bottom: 10px;
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
</style>
