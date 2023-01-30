<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
} from "vue";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { useHomePageStore } from "@/pages/home/store";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import AppHeader from "@/containers/AppHeader.vue";
import AppSearchCompaniesForm from "@/containers/AppSearchCompaniesForm.vue";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppFooter from "@/containers/AppFooter.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiButton from "@/components/UiButton.vue";
import UiHorizontalScroller from "@/components/UiHorizontalScroller.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import {
  getEmailValidator,
  getLengthValidator,
  getRequiredValidator,
  getWhitespaceValidator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    AppContentWrapper,
    AppHeader,
    AppSearchCompaniesForm,
    AppFooter,
    UiForm,
    UiFormField,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormTextarea: adaptForField(UiTextarea),
    UiHorizontalScroller,
    UiButton,
    IconArrowRight,
  },
  async setup() {
    const router = useRouter();
    const scrollerRef = ref<HTMLElement>();
    const scrollSectionPayload = ref({ current: 0, total: 0 });
    const scrollButtonsPress = ref({ left: false, right: false });
    const store = useHomePageStore();
    let animationFrameId = 0;

    const form = createForm({
      email: {
        ref: toRef(store.form, "email"),
        validators: [getEmailValidator(), getRequiredValidator()],
      },
      body: {
        ref: toRef(store.form, "body"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 3600, formName: "contactForm" }),
          getWhitespaceValidator(),
        ],
      },
    });

    const submitContactForm = () => {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }
      store.submitContactForm(form);
    };

    const headerLinks = [
      "For Businesses",
      "What Makes Us Different",
      "Contact Us",
    ];

    const scrollToAnchor = (id: string) => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      window.scrollTo({
        top: window.pageYOffset + rect.top,
        left: 0,
        behavior: "smooth",
      });
    };

    const scrollRight = () => {
      scrollerRef.value.scrollTo(scrollSectionPayload.value.current + 5);
    };

    const scrollLeft = () => {
      scrollerRef.value.scrollTo(scrollSectionPayload.value.current - 5);
    };

    const resetScrollButtonsPress = () => {
      scrollButtonsPress.value = { left: false, right: false };
    };

    const animationFrameCallback = () => {
      if (scrollButtonsPress.value.left) {
        scrollLeft();
      } else if (scrollButtonsPress.value.right) {
        scrollRight();
      }
      animationFrameId = window.requestAnimationFrame(animationFrameCallback);
    };

    const goToSearch = (query: string) => {
      router.push({ name: routesNames.companySearch, query: { query } });
    };

    onMounted(() => {
      animationFrameId = window.requestAnimationFrame(animationFrameCallback);
      document.addEventListener("mouseup", resetScrollButtonsPress);
    });

    onBeforeUnmount(() => {
      window.cancelAnimationFrame(animationFrameId);
      document.removeEventListener("mouseup", resetScrollButtonsPress);
    });

    await store.fetchRecentlyAddedCompanies();

    return {
      headerLinks,
      routesNames,
      scrollerRef,
      scrollSectionPayload,
      scrollButtonsPress,
      scrollToAnchor,
      goToSearch,
      recentlyAddedCompanies: computed(() => store.recentlyAddedCompanies),
      form,
      submitContactForm,
    };
  },
});
</script>

<template>
  <div class="page">
    <section class="page__jumbotron jumbotron">
      <AppContentWrapper>
        <AppHeader class="jumbotron__header">
          <template #menu>
            <ul class="header-menu">
              <li
                class="header-menu__item"
                v-for="name in headerLinks"
                :key="name"
              >
                <a
                  class="header-menu__link"
                  @click.prevent="scrollToAnchor(name)"
                >
                  {{ name }}
                </a>
              </li>
            </ul>
          </template>
        </AppHeader>
        <div class="jumbotron__body jumbotron-body">
          <div class="jumbotron-body__content">
            <h1 class="jumbotron-body__title">Genuine Reviews You Can Trust</h1>
            <p class="jumbotron-body__description">
              We are serious about ensuring reviews hosted here are genuine. We
              use smart technology to prevent fake reviews.
            </p>
            <form class="jumbotron-body__form">
              <div class="jumbotron-body__pre-form">
                Search for reviews on a company
              </div>
              <AppSearchCompaniesForm
                :is-white="true"
                class="jumbotron-form"
                @submit="goToSearch"
              />
            </form>
          </div>
          <div class="jumbotron-body__image">
            <img src="@/assets/illustrations/image7.svg" alt="Logo" />
          </div>
        </div>
      </AppContentWrapper>
    </section>

    <AppContentWrapper>
      <section class="promo" id="For Businesses">
        <div class="promo__image">
          <img src="@/assets/illustrations/image5.svg" alt="Goods" />
        </div>
        <div class="promo__content">
          <h2 class="promo__title">For Businesses</h2>
          <div>
            <p class="promo__text _small">
              Are you concerned about receiving fake adverse reviews from
              competitors or individuals who have not been your customers?
            </p>
            <p class="promo__text">
              So are we! Unlike other leading review websites, only your
              verified customers can post a review on My Client Reviews.
            </p>
          </div>
          <RouterLink
            class="promo__button"
            :to="{ name: routesNames.registration }"
          >
            <UiButton>Sign Up for a Free Trial!</UiButton>
          </RouterLink>
        </div>
      </section>
    </AppContentWrapper>

    <section class="section" id="What Makes Us Different">
      <AppContentWrapper>
        <h2 class="section__title">What Makes Us Different</h2>
      </AppContentWrapper>
      <AppContentWrapper>
        <ul class="cards">
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon1.svg"
                alt="Checkmark in a circle"
              />
              <h3 class="card__title">Reviews limited to genuine customers</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon2.svg"
                alt="Checkmark on paper"
              />
              <h3 class="card__title">No lock in contracts - month to month</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon3.svg"
                alt="Infinity bubble"
              />
              <h3 class="card__title">Receive unlimited reviews</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon12.svg"
                alt="Gift"
              />
              <h3 class="card__title">3 month unlimited free trial</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon5.svg"
                alt="Star bubble"
              />
              <h3 class="card__title">Display reviews on your website</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon6.svg"
                alt="Infinity square"
              />
              <h3 class="card__title">Unlimited QR code initiated reviews</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon7.svg"
                alt="Notepad with pencil"
              />
              <h3 class="card__title">Edit review invitation templates</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon4.svg"
                alt="Export"
              />
              <h3 class="card__title">Export reviews if you decide to leave</h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon9.svg"
                alt="Small business"
              />
              <h3 class="card__title">
                Focussed on Small to Medium Businesses
              </h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon10.svg"
                alt="Checkmark bubble"
              />
              <h3 class="card__title">
                Use of smart tech to stop fake reviews
              </h3>
            </article>
          </li>
          <li class="cards__item">
            <article class="card _color-white">
              <img
                class="card__icon"
                src="@/assets/illustrations/icon11.svg"
                alt="Lifebuoy"
              />
              <h3 class="card__title">
                Australian Based Phone and Email Support
              </h3>
            </article>
          </li>
        </ul>
      </AppContentWrapper>
    </section>

    <AppContentWrapper>
      <section class="promo">
        <div class="promo__image">
          <img
            src="@/assets/illustrations/image6.svg"
            alt="Open for business"
          />
        </div>
        <div class="promo__content">
          <h2 class="promo__title">$99 Per Month!</h2>
          <div>
            <p class="promo__text _disable-adaptive">
              Free three months trial<br />
              <span class="promo__additional"
                >(No payment details required)</span
              >
            </p>
          </div>
          <RouterLink
            class="promo__button _disable-adaptive"
            :to="{ name: routesNames.registration }"
          >
            <UiButton>Join Now</UiButton>
          </RouterLink>
        </div>
      </section>
    </AppContentWrapper>

    <div class="end" id="Contact Us">
      <UiForm :form="form" class="form">
        <AppContentWrapper>
          <form class="contact-form end__form">
            <h3 class="contact-form__title">Contact Us</h3>
            <div class="contact-form__fields">
              <div class="contact-form__field">
                <UiFormField
                  :field="form.fields.email"
                  label="Email"
                  class="fields__item"
                >
                  <UiFormTextInput
                    :field="form.fields.email"
                    placeholder="Enter email..."
                  />
                </UiFormField>
              </div>
              <div class="contact-form__field">
                <UiFormField
                  :field="form.fields.body"
                  label=""
                  class="fields__item"
                >
                  <UiFormTextarea
                    :field="form.fields.body"
                    :min-height="100"
                    placeholder="Enter Text..."
                  />
                </UiFormField>
              </div>
            </div>
            <div class="contact-form__buttons">
              <UiButton
                :is-end-icon="true"
                @click="submitContactForm"
                class="contact-form__button"
              >
                <template #icon><IconArrowRight /></template>
                Send
              </UiButton>
            </div>
          </form>
          <AppFooter />
        </AppContentWrapper>
      </UiForm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/zIndex.scss";
@import "@/styles/grid.scss";
@import "@/styles/responsive.scss";

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
    max-height: 101px;
  }

  &__body {
    padding-top: 45px;
    padding-bottom: 83px;

    @include responsive-media((xs, sm)) {
      padding-top: 0;
      padding-bottom: 54px;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-30%, -53%);
    width: 385px;
    height: 277px;
    background: url("@/assets/illustrations/waves.svg") center no-repeat;
    background-size: contain;
    pointer-events: none;

    @include responsive-media((md, lg)) {
      width: 264px;
      height: 190px;
    }

    @include responsive-media((xs, sm)) {
      width: 188px;
      height: 135px;
      left: 100%;
      transform: translate(-100%, -40%);
    }
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

  &__link {
    cursor: pointer;
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
    width: 40%;
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

  &__form {
    width: 100%;
    max-width: 700px;
  }

  &__pre-form {
    opacity: 0.6;
    margin-bottom: 4px;
  }
}

.promo {
  padding: 180px 0;
  display: flex;
  align-items: center;
  color: $color-blue;

  @include responsive-media((xs, sm)) {
    flex-direction: column-reverse;
    align-items: stretch;
    padding: 94px 0;
  }

  &__image {
    flex-shrink: 1;
    flex-grow: 1;
    margin-right: 56px;

    @include responsive-media((xs, sm)) {
      margin-right: 0;
    }

    & > img {
      width: 100%;
      height: auto;
    }
  }

  &__content {
    width: 500px;
    flex-shrink: 0;
    flex-grow: 0;

    @include responsive-media((xs, sm)) {
      width: auto;
      margin-bottom: 24px;
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

  &__text {
    @include typography-main(24px, 600);

    &:not(:last-child) {
      margin-bottom: 24px;

      @include responsive-media((xs, sm)) {
        margin-bottom: 12px;
      }
    }

    &._small {
      @include typography-main(20px, 400);
      color: $color-black;

      @include responsive-media((xs, sm)) {
        @include typography-main(14px, 400);
      }
    }

    &:not(._disable-adaptive) {
      @include responsive-media((xs, sm)) {
        @include typography-main(16px, 600);
      }
    }
  }

  &__additional {
    @include typography-main(20px, 600);
    color: $color-black-60;
  }

  &__button {
    display: block;
    margin-top: 60px;

    &:not(._disable-adaptive) {
      @include responsive-media((xs, sm)) {
        display: none;
      }
    }
  }
}

.section {
  background-color: $color-blue-06;
  padding: 100px 0 70px;

  @include responsive-media((xs, sm)) {
    padding: 60px 0 30px;
  }

  &__title {
    @include typography-header(40px, 700);
    color: $color-blue;
    margin: 0;
    margin-bottom: 60px;
  }
}

.cards {
  @include grid(24px, 60px);
  padding: 0;
  list-style: none;
  justify-content: center;
  padding-bottom: 30px;
  align-items: stretch;

  &__item {
    width: 16.6%;

    @include responsive-media((xs, md)) {
      width: 50%;
      max-width: 260px;
      text-align: center;
    }
  }
}

.card {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;

  @include responsive-media((xs, md)) {
    padding: 18px;
  }

  &__icon {
    width: 76px;
    height: auto;
    margin-bottom: 12px;
  }

  &__title {
    @include typography-main(16px, 600);
    margin: 0;
  }

  &._color-white {
    @include shadow-large;
    background-color: $color-white;
    border-radius: $rounding-medium;
    color: $color-blue;
  }

  &._color-yellow {
    background: linear-gradient(
      322.3deg,
      rgba(244, 209, 86, 0.4) -9.69%,
      rgba(244, 209, 86, 0.1) 88.73%
    );
    border-radius: $rounding-large;
  }

  &._color-blue {
    background: linear-gradient(
      322.3deg,
      rgba(30, 43, 153, 0.04) -9.69%,
      rgba(7, 33, 255, 0.1) 88.73%
    );
    border-radius: $rounding-large;
  }

  &._color-green {
    background: linear-gradient(
      322.3deg,
      rgba(30, 153, 57, 0.04) -9.69%,
      rgba(69, 159, 38, 0.1) 88.73%
    );
    border-radius: $rounding-large;
  }

  &._color-red {
    background: linear-gradient(
      322.3deg,
      rgba(241, 177, 4, 0.08) -9.69%,
      rgba(255, 110, 0, 0.1) 88.73%
    );
    border-radius: $rounding-large;
  }
}

.scroll-section {
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
  }

  &__title {
    @include typography-header(40px, 700);
    flex-shrink: 1;
    flex-grow: 1;
    color: $color-blue;
    margin: 0;
    margin-right: 20px;
  }

  &__buttons {
    flex-shrink: 0;
    flex-grow: 0;

    @include responsive-media((xs, sm)) {
      display: none;
    }

    & > *:not(:last-child) {
      margin-right: 44px;
    }
  }

  &__cards {
    display: inline-flex;
    flex-wrap: nowrap;
    padding: 20px 0 30px;

    & > * {
      width: 184px;
      margin-right: 24px;
      flex-shrink: 0;
      flex-grow: 0;
    }
  }
}

.scroll-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 60px;
  height: 60px;
  border-radius: $rounding-circle;
  color: $color-blue;
  background-color: $color-blue-10;
  cursor: pointer;

  &._is-disabled {
    opacity: 0.5;
  }

  &:hover {
    background-color: $color-blue-20;
  }
}

.company-card {
  padding: 24px 12px 12px;
  background-color: $color-white;
  border-radius: $rounding-medium;
  text-decoration: none;
  color: $color-black;
  text-align: center;

  &__logo {
    line-height: 0;
    margin-bottom: 12px;
  }

  &__title {
    @include typography-main(14px, 600);
  }

  &:hover {
    @include shadow-large;
  }
}

.end {
  position: relative;
  background-color: $color-blue;
  background-image: url("@/assets/illustrations/background3.svg");
  background-position: bottom left;
  background-repeat: no-repeat;
  background-blend-mode: overlay;
  padding-top: 80px;
  padding-bottom: 60px;
  margin-top: 280px;

  @include responsive-media((xs, sm)) {
    margin-top: 100px;
  }

  &__form {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 140px;
  }

  &::after {
    content: "";
    position: absolute;
    top: -106px;
    right: 7%;
    width: 385px;
    height: 277px;
    background: url("@/assets/illustrations/waves.svg") center no-repeat;
    background-size: contain;
    pointer-events: none;

    @include responsive-media((xs, sm)) {
      width: 240px;
      height: 172px;
      top: -70px;
    }
  }
}

.contact-form {
  background-color: $color-white;
  border-radius: $rounding-large;
  padding: 40px 104px;

  @include responsive-media((xs, sm)) {
    padding: 40px;
  }

  &__title {
    @include typography-header(40px, 700);
    color: $color-blue;
    margin: 0;
    margin-bottom: 36px;
  }

  &__buttons {
    text-align: right;
  }

  &__button {
    min-width: 148px;
  }

  &__field {
    .fields__item {
      margin-bottom: 36px;

      &._has-error {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
