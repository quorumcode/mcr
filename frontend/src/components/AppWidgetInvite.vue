<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import { useWidgetViewPageStore } from "@/pages/widget/view/store";
import AppWidgetLoadingBar from "@/components/AppWidgetLoadingBar.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiButton from "@/components/UiButton.vue";
import { getEmailValidator, getRequiredValidator } from "@/helpers/validation";

export default defineComponent({
  components: {
    AppWidgetLoadingBar,
    UiForm,
    UiFormField,
    UiFormTextInput: adaptForField(UiTextInput),
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
    cardBackgroud: {
      type: String,
      default: "white",
    },
    color: {
      type: String,
      default: "000000",
    },
    backgroudColor: {
      type: String,
      default: "FFFFFF",
    },
    companyId: {
      type: String,
      default: "",
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
  setup(props) {
    const isSending = ref(false);

    const form = createForm({
      email: {
        ref: ref(""),
        validators: [getRequiredValidator(), getEmailValidator()],
      },
    });

    const widgetViewPageStore = useWidgetViewPageStore();

    onMounted(async () => {
      if (props.reviewToken) {
        await widgetViewPageStore.fetchAddReviewWidgetData(props.reviewToken);
      }
    });

    const submit = async () => {
      isSending.value = true;
      try {
        await widgetViewPageStore.sendInvite(props.companyId, form);
      } finally {
        isSending.value = false;
      }
    };

    return {
      form,
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
        '_no-border': backgroudColor === 'transparent',
        '_is-editor-mode': isEditorMode,
      }"
      :style="`color: #${color}; background-color: #${backgroudColor}`"
    >
      <template v-if="companyName || companyNameFromToken">
        <h2 class="main__checkout-title">
          Thank you for using {{ companyName || companyNameFromToken }}!
        </h2>
        <span class="main__checkout-subtitle">
          We would like to invite you to leave a review of our services. Please
          leave your email and My Client Reviews will send you an invitation.
        </span>

        <UiForm :form="form">
          <UiFormField :field="form.fields.email" :show-error-space="true">
            <UiFormTextInput
              :field="form.fields.email"
              placeholder="Your Email"
              class="main__checkout-input"
            />
          </UiFormField>
          <UiButton class="main__checkout-button" type="submit" @click="submit">
            Leave a review
          </UiButton>
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
  padding: 60px 15%;

  &._is-editor-mode {
    height: 100%;
    padding: 58px 15%;
    pointer-events: none;
  }

  &._no-border {
    border-color: transparent;
  }
}

.main {
  margin-left: 24px;
  width: auto;

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
    }
  }
}
</style>
