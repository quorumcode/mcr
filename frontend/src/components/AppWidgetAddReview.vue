<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useCompanyAddReviewStore } from "@/pages/company/addReview/store";
import { useWidgetViewPageStore } from "@/pages/widget/view/store";
import { useUserStore } from "@/stores/user";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import AppWidgetLoadingBar from "@/components/AppWidgetLoadingBar.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiRatingInput from "@/components/UiRatingInput.vue";
import UiButton from "@/components/UiButton.vue";
import {
  getEmailValidator,
  getLengthValidator,
  getRequiredValidator,
  getPunctuationValidator,
  Validator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    AppWidgetLoadingBar,
    UiForm,
    UiFormField,
    UiTextarea: adaptForField(UiTextarea),
    UiTextInput: adaptForField(UiTextInput),
    UiRatingInput: adaptForField(UiRatingInput),
    UiButton,
  },
  props: {
    companyName: {
      type: String,
      default: "",
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "000000",
    },
    backgroudColor: {
      type: String,
      default: "FFFFFF",
    },
    widgetWidth: {
      type: Number,
      default: null,
    },
    reviewToken: {
      type: String,
      default: "",
    },
    isEditorMode: {
      type: Boolean,
      default: false,
    },
  },
  async setup(props) {
    const store = useCompanyAddReviewStore();
    const widgetViewPageStore = useWidgetViewPageStore();
    const userStore = useUserStore();
    const isSending = ref(false);

    const form = createForm({
      name: {
        ref: ref(""),
        validators: [
          new Validator((value) => {
            if (!value) {
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
            if (!value) {
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

    const submit = () => {
      isSending.value = true;
      try {
        store.submitWidget(
          form,
          userStore.userVisitorId,
          props.reviewToken,
          widgetViewPageStore.tokenInfo?.review?.id
        );
      } finally {
        isSending.value = false;
      }
    };

    onMounted(async () => {
      if (props.reviewToken) {
        await widgetViewPageStore.fetchAddReviewWidgetData(props.reviewToken);
      }
    });

    return {
      form,
      messageHighlightedIntervals: computed(
        () => store.messageHighlightedIntervals
      ),
      hideMessageHighlight: store.hideMessageHighlight,
      submit,
      companyNameFromToken: computed(
        () => widgetViewPageStore.tokenInfo?.company.name
      ),
      isSending,
    };
  },
});
</script>

<template>
  <div>
    <AppWidgetLoadingBar
      v-if="isSending || !(companyName || companyNameFromToken)"
    />
    <div
      class="app-widget"
      :class="{
        '_is-editor-mode': isEditorMode,
        '_no-border': backgroudColor === 'transparent',
      }"
      :style="`color: #${color}; background-color: #${backgroudColor}`"
    >
      <template v-if="companyName || companyNameFromToken">
        <h2 class="main__checkout-title">
          Thank you for using {{ companyName || companyNameFromToken }}!
        </h2>
        <span class="main__checkout-subtitle">
          We would like to invite you to leave a review of our services. Rate
          {{ companyName || companyNameFromToken }} out of 5
        </span>

        <UiForm :form="form" @submit="submit">
          <div class="main__rating">
            <UiFormField :field="form.fields.rate" :show-error-space="true">
              <UiRatingInput
                :field="form.fields.rate"
                :widget-width="widgetWidth"
                class="rating__input"
                place="widget-add-review"
              />
            </UiFormField>
          </div>
          <div class="main__fields fields">
            <UiFormField
              :field="form.fields.name"
              class="fields__item"
              :show-error-space="true"
            >
              <UiTextInput :field="form.fields.name" placeholder="Your name" />
            </UiFormField>
            <UiFormField
              :field="form.fields.email"
              class="fields__item"
              :show-error-space="true"
            >
              <UiTextInput :field="form.fields.email" placeholder="Your Email" />
            </UiFormField>
            <UiFormField
              :field="form.fields.message"
              class="fields__item"
              :show-error-space="true"
            >
              <UiTextarea
                :field="form.fields.message"
                placeholder="Describe your experience"
                :min-height="100"
                :max-height="100"
                :counter="{ max: 3000 }"
                :highlighted-intervals="messageHighlightedIntervals"
                @update:modelValue="hideMessageHighlight"
              />
            </UiFormField>
          </div>
          <div class="main__buttons">
            <UiButton
              :is-end-icon="true"
              type="submit"
              class="main__buttons-item"
              :is-disabled="form.isDisabled"
            >
              Post
            </UiButton>
          </div>
        </UiForm>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/typography.scss";

.app-widget {
  position: relative;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  background-color: transparent;
  border: 2px solid $color-blue-20;
  border-radius: $rounding-large;
  padding: 40px 15%;

  &._is-editor-mode {
    height: 100%;
    pointer-events: none;
  }

  &._no-border {
    border-color: transparent;
  }
}

.main {
  margin-left: 24px;
  width: auto;

  &__rating {
    margin-top: 12px;
  }

  &__fields {
    margin-top: 8px;
  }

  &__buttons {
    margin-top: 18px;

    &-item {
      width: 100%;
    }
  }

  &__code {
    margin-bottom: 40px;
  }

  &__buttons {
    text-align: right;
  }

  &__button {
    min-width: 168px;
  }

  &__checkout {
    &-title {
      @include typography-main(14px, 600);
      margin: 0;
    }

    &-subtitle {
      @include typography-main(14px);
    }

    &-input {
      margin-top: 12px;
    }

    &-button {
      display: block;
      width: 100%;
      margin-top: 24px;
    }
  }
}
</style>
