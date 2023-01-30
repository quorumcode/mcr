<script lang="ts">
import { defineComponent, reactive, toRef } from "vue";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import {
  getLengthValidator,
  getRequiredValidator,
  getWhitespaceValidator,
} from "@/helpers/validation";
import UiModal from "@/components/UiModal.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiButton from "@/components/UiButton.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";

interface FieldsMap {
  otherReportText: string;
}

export default defineComponent({
  components: {
    UiModal,
    UiButton,
    UiForm,
    UiFormField,
    UiFormTextarea: adaptForField(UiTextarea),
    IconArrowRight,
    IconArrowLeft,
  },
  emits: {
    close: () => true,
    openConfirmReportModal: (reportReason: string) => reportReason,
    sendReport: (reportReason: string) => reportReason,
  },
  setup(props, { emit }) {
    const state = reactive({
      showReportListModal: true,
      showOtherModal: false,
      form: {
        otherReportText: "",
      } as FieldsMap,
    });

    const reportList = [
      "Language that will cause offense",
      "Content that is untrue in part or in whole",
      "Language that is sexist or racist",
      "Content is defamatory, pornographic, profane, obscene, threatening or political",
      "Promoting other businesses",
      "Not a review by our customer",
      "Contains personal information (names, addresses, phone etc...)",
      "Includes copyrighted material",
      "Content that is unlawful in Australia",
      "Includes content that can cause harm to the website or content",
      "Other",
    ];

    const form = createForm({
      otherReportText: {
        ref: toRef(state.form, "otherReportText"),
        validators: [
          getRequiredValidator(),
          getWhitespaceValidator(),
          getLengthValidator({ maxChars: 128 }),
        ],
      },
    });

    const openOtherModal = () => {
      state.showOtherModal = true;
      state.showReportListModal = false;
    };

    const backToReportList = () => {
      state.showReportListModal = true;
      state.showOtherModal = false;
    };

    const submitOtherReport = () => {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }
      state.showOtherModal = false;
      state.showReportListModal = true;
      emit("close");
      emit("sendReport", state.form.otherReportText);
    };

    const openConfirmModal = (reportReason: string) => {
      emit("openConfirmReportModal", reportReason);
      emit("close");

      state.showOtherModal = false;
      state.showReportListModal = false;
    };

    const closeModal = () => {
      emit("close");
    };

    return {
      reportList,
      state,
      openOtherModal,
      backToReportList,
      submitOtherReport,
      form,
      closeModal,
      openConfirmModal,
    };
  },
});
</script>

<template>
  <UiModal class="report-review" @close="closeModal" :show-close-btn="true">
    <div
      v-show="state.showReportListModal"
      class="report-review__content report-list"
    >
      <h3 class="report-review__title">Report Violation</h3>
      <div class="report-review__message">
        <div
          class="message-item"
          v-for="reportName in reportList"
          :key="reportName"
        >
          <template v-if="reportName !== 'Other'">
            <div class="message-item-text">
              <button @click="openConfirmModal(reportName)">
                {{ reportName }}
              </button>
            </div>
            <div class="message-item-btn">
              <button @click="openConfirmModal(reportName)">
                <IconArrowRight />
              </button>
            </div>
          </template>
          <template v-else>
            <div class="message-item-text">
              <button @click="openOtherModal">
                {{ reportName }}
              </button>
            </div>
            <div class="message-item-btn">
              <button @click="openOtherModal">
                <IconArrowRight />
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      v-show="state.showOtherModal"
      class="report-review__content report-other"
    >
      <UiButton
        view="text"
        class="back-button"
        @click.prevent="backToReportList"
      >
        <template v-slot:icon>
          <IconArrowLeft />
        </template>
        Back
      </UiButton>

      <h4 class="report-review__title">Other</h4>
      <div class="report-review__message">
        Describe the reason you flagged this review.
      </div>
      <UiForm :form="form" @submit="submitOtherReport">
        <UiFormField class="fields__item" :field="form.fields.otherReportText">
          <UiFormTextarea
            :field="form.fields.otherReportText"
            :counter="{ max: 800 }"
            :min-height="84"
            placeholder="Enter Text..."
          />
        </UiFormField>
        <div class="report-review__buttons">
          <UiButton type="submit" class="buttons__item" view="primary">
            <!-- :is-disabled="form.isDisabled" -->
            Report
          </UiButton>
        </div>
      </UiForm>
    </div>
  </UiModal>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/responsive.scss";

.report-review {
  &__content {
    min-width: 548px;
    padding: 10px;

    @include responsive-media((xs, sm)) {
      min-width: initial;
    }
  }

  &__icon {
    width: 60px;
    height: 60px;
    display: block;
    margin-bottom: 24px;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    margin-bottom: 24px;
    color: $color-blue;

    @at-root {
      h4#{&} {
        @include typography-main(16px, 600);
        margin: 40px 0 0;
      }
    }
  }

  &__message {
    @include typography-main(12px);
    margin: 0;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.message-item {
  @include typography-main(12px, 500);
  color: $color-blue;
  min-height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 10px;

  &:not(:last-child) {
    border-bottom: 2px solid rgba($color-black, 0.06);
  }

  &-btn {
    display: flex;
  }

  & button {
    background: transparent;
    border: none;
    color: $color-blue;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
}

.buttons__item {
  margin: 40px 0 0 auto;
  min-width: 184px;
}

.report-review__success-icon {
  margin-bottom: 24px;
  height: 74px;
}
</style>
