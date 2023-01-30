<script lang="ts">
import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCompanyAddReviewStore } from "@/pages/company/addReview/store";
import { useUserStore } from "@/stores/user";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import AppSimpleLayout from "@/components/AppSimpleLayout.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiRatingInput from "@/components/UiRatingInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiButton from "@/components/UiButton.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import {
  getEmailValidator,
  getLengthValidator,
  getRequiredValidator,
  getPunctuationValidator,
  Validator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiForm,
    UiFormField,
    IconArrowRight,
    UiButton,
    UiTextarea: adaptForField(UiTextarea),
    UiTextInput: adaptForField(UiTextInput),
    UiRatingInput: adaptForField(UiRatingInput),
    AppSimpleLayout,
  },
  async setup() {
    const store = useCompanyAddReviewStore();
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const clientName = computed(() => store.tokenInfo?.client?.name || "");
    const hasClient = computed(() => !!store.tokenInfo?.client);
    const recentReview = computed(() => store.tokenInfo?.review);

    const form = createForm({
      name: {
        ref: ref(""),
        validators: [
          new Validator((value) => {
            if (!clientName.value && !value) {
              return "Do not leave this field blank";
            }
          }).stop(),
          getLengthValidator({ minChars: 2, maxChars: 128 }),
          getPunctuationValidator(),
        ],
      },
      email: {
        ref: ref(""),
        validators: [
          new Validator((value) => {
            if (!hasClient.value && !value) {
              return "Please provide a valid value";
            }
          }).stop(),
          getEmailValidator(),
        ],
      },
      rate: {
        ref: ref(0),
        validators: [getRequiredValidator("Input a rating")],
      },
      message: {
        ref: ref(""),
        validators: [
          getRequiredValidator(`Don't leave the review blank`),
          getLengthValidator({ maxChars: 3000 }),
          getPunctuationValidator(),
        ],
      },
    });

    const VITE_FINGERPRINT_COUNTRY_CODES = import.meta.env
      .VITE_FINGERPRINT_COUNTRY_CODES as string;
    let countryCodesArr = [] as any[];
    if (VITE_FINGERPRINT_COUNTRY_CODES) {
      countryCodesArr = VITE_FINGERPRINT_COUNTRY_CODES.split(", ");
    }

    const showContent = ref(false);

    onMounted(async () => {
      await userStore.getFingerprintData();
      if (!countryCodesArr.includes(userStore.userLocation)) {
        router.push("/access-forbidden");
      }
      await store.init(route);
      form.fields.name.setValue(clientName.value);
      if (recentReview.value?.message) {
        form.fields.rate.setValue(recentReview.value?.rate || 0);
        form.fields.message.setValue(recentReview.value.message);
        form.setDisabled(true);
      }
      showContent.value = true;
    });

    const submit = () => {
      store.submit(form, userStore.userVisitorId);
    };

    return {
      form,
      clientName,
      hasClient,
      companyName: computed(() => store.tokenInfo?.company.name),
      companyLogoUrl: computed(() => store.tokenInfo?.company.logoUrl),
      submit,
      isError: computed(() => store.isError),
      messageHighlightedIntervals: computed(
        () => store.messageHighlightedIntervals
      ),
      hideMessageHighlight: store.hideMessageHighlight,
      showContent,
    };
  },
});
</script>

<template>
  <AppSimpleLayout
    title="How Was Your Experience?"
    :company-logo-url="companyLogoUrl"
    v-if="showContent"
  >
    <div v-if="!isError" class="page">
      <div class="page__message">
        <p class="page__client-name" v-if="clientName">Hi {{ clientName }}</p>
        <p>
          Please help us improve our customer satisfaction by writing a quick
          review, following the
          <a href="/page/review-guidelines" target="_blank"
            >Helpful Tips For Posting a Review</a
          >
          guide in your feedback.
        </p>
      </div>
      <UiForm :form="form" @submit="submit">
        <div class="page__rating rating">
          <UiFormField
            :field="form.fields.rate"
            :label="`Rate ${companyName} out of 5`"
          >
            <UiRatingInput :field="form.fields.rate" class="rating__input" />
          </UiFormField>
        </div>
        <div class="page__fields fields">
          <UiFormField
            v-if="!clientName"
            :field="form.fields.name"
            class="fields__item"
            label="Your name"
          >
            <UiTextInput
              :field="form.fields.name"
              placeholder="Enter your name"
            />
          </UiFormField>
          <UiFormField
            v-if="!hasClient"
            :field="form.fields.email"
            class="fields__item"
            label="Enter Email"
          >
            <UiTextInput
              :field="form.fields.email"
              placeholder="Enter your email"
            />
          </UiFormField>
          <UiFormField
            :field="form.fields.message"
            class="fields__item"
            label="Write a short review"
          >
            <UiTextarea
              :field="form.fields.message"
              placeholder="Describe your experience here. Be honest and constructive."
              place="review"
              :min-height="286"
              :counter="{ max: 3000 }"
              :highlighted-intervals="messageHighlightedIntervals"
              @update:modelValue="hideMessageHighlight"
            />
          </UiFormField>
        </div>
        <div class="page__buttons">
          <UiButton
            :is-end-icon="true"
            type="submit"
            class="btn-post"
            :is-disabled="form.isDisabled"
          >
            <template #icon><IconArrowRight /></template>
            Post
          </UiButton>
        </div>
      </UiForm>
    </div>
  </AppSimpleLayout>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";

.page {
  &__message {
    @include typography-main(14px, 600);
    margin-bottom: 40px;

    & a {
      color: $color-blue;
    }
  }

  &__rating {
    margin-bottom: 40px;
  }

  &__fields {
    margin-bottom: 40px;
  }

  &__buttons {
    text-align: right;
  }

  &__client-name {
    margin-top: 12px;
  }
}

.rating {
  &__input {
    margin-top: 24px;
  }
}

.fields {
  &__item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.btn-post {
  min-width: 184px;
}

@include responsive-media((xs, sm)) {
  .page {
    &__message {
      margin-bottom: 28px;
    }
  }

  .btn-post {
    min-width: 100%;
  }
}
</style>
