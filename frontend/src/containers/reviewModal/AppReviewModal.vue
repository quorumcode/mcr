<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useReviewModalStore } from "@/containers/reviewModal/store";
import { useUserStore } from "@/stores/user";
import { useCommonStore } from "@/stores/common";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import { getLengthValidator } from "@/helpers/validation";
import AppReview from "@/components/AppReview.vue";
import AppReportReviewsModal from "@/containers/AppReportReviewsModal.vue";
import AppSuccessReportModal from "@/components/AppSuccessReportModal.vue";
import UiModal from "@/components/UiModal.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiButton from "@/components/UiButton.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";

export default defineComponent({
  components: {
    AppReview,
    AppReportReviewsModal,
    AppSuccessReportModal,
    UiModal,
    UiForm,
    UiFormField,
    UiTextarea: adaptForField(UiTextarea),
    UiButton,
    IconArrowRight,
  },
  setup() {
    const store = useReviewModalStore();
    const userStore = useUserStore();
    const review = computed(() => store.review);
    const commonStore = useCommonStore();

    const route = useRoute();
    const router = useRouter();
    const companyId = route.params?.id;
    if (companyId) {
      store.getCompanyName(route.params?.id);
    }

    const replyMessage = toRef(store, "replyMessage");
    const form = createForm({
      replyMessage: {
        ref: replyMessage,
        validators: [getLengthValidator({ maxChars: 3000 })],
      },
    });

    const VITE_FINGERPRINT_COUNTRY_CODES = import.meta.env
      .VITE_FINGERPRINT_COUNTRY_CODES as string;
    let countryCodesArr: string[] = [];
    if (VITE_FINGERPRINT_COUNTRY_CODES) {
      countryCodesArr = VITE_FINGERPRINT_COUNTRY_CODES.split(", ");
    }

    const openReportModal = async () => {
      const isMyCompany = review.value?.company.id === review.value?.company.id;
      commonStore.startLoading();
      await userStore.getFingerprintData();
      commonStore.stopLoading();
      if (
        countryCodesArr.includes(userStore.userLocation) ||
        isMyCompany ||
        typeof userStore.userLocation === "undefined"
      ) {
        store.openReportModal();
      } else {
        store.closeReview();
        router.push("/access-forbidden");
      }
    };

    return {
      form,
      iAmCompanyOwner: computed(() => store.iAmCompanyOwner),
      review,
      replyMessageChanged: computed(() => store.replyMessageChanged),
      close: store.closeReview,
      reply: store.reply,
      openConfirmReportModal: store.openConfirmReportModal,
      replyMessageHighlightedIntervals: computed(
        () => store.replyMessageHighlightedIntervals
      ),
      hideReplyMessageHighlight: store.hideReplyMessageHighlight,

      showReportModal: computed(() => store.showReportModal),
      openReportModal,
      closeReportModal: store.closeReportModal,
      showSuccessReportModal: computed(() => store.showSuccessReportModal),
      closeSuccessReportModal: store.closeSuccessReportModal,
      report: store.report,
      companyName: computed(() => store.companyName),
    };
  },
});
</script>

<template>
  <div>
    <UiModal v-if="review" @close="close" :show-close-btn="true">
      <div class="review-modal">
        <AppReview
          class="review-modal__review"
          :rating-value="review.rate"
          :user-name="review.client.name"
          :company-name="companyName"
          :date="review.createdAt"
          :message="review.message"
          :reply-message="iAmCompanyOwner ? '' : review.reply?.message"
          :show-full-message="true"
          :i-am-company-owner="iAmCompanyOwner"
        />
        <UiForm :form="form" @submit="reply(form)">
          <UiFormField
            v-if="iAmCompanyOwner"
            class="review-modal__field"
            :field="form.fields.replyMessage"
            :label="
              review.reply ? 'Edit Business Response' : 'Business Response'
            "
          >
            <UiTextarea
              placeholder="Company reply"
              :field="form.fields.replyMessage"
              :min-height="104"
              :counter="{ max: 3000 }"
              :highlighted-intervals="replyMessageHighlightedIntervals"
              @update:modelValue="hideReplyMessageHighlight"
            />
          </UiFormField>
          <div class="review-modal__controls controls">
            <UiButton
              class="controls__item"
              view="secondary"
              @click="openReportModal"
            >
              <span class="controls__danger">Report Abuse</span>
            </UiButton>
            <UiButton class="controls__item" view="secondary" @click="close">
              <template v-if="iAmCompanyOwner">Cancel</template>
              <template v-else>Close</template>
            </UiButton>
            <UiButton
              class="controls__item"
              v-if="iAmCompanyOwner"
              type="submit"
              :is-end-icon="true"
              :is-disabled="!replyMessageChanged || form.isDisabled"
            >
              <template #icon><IconArrowRight /></template>
              Post
            </UiButton>
          </div>
        </UiForm>
      </div>
    </UiModal>

    <teleport to="body">
      <AppReportReviewsModal
        v-if="showReportModal"
        @sendReport="report"
        @open-confirm-report-modal="openConfirmReportModal"
        @close="closeReportModal"
      />
    </teleport>

    <teleport to="body">
      <AppSuccessReportModal
        @close="closeSuccessReportModal"
        v-if="showSuccessReportModal"
      />
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/responsive.scss";

.review-modal {
  width: 580px;
  max-width: 100%;

  &__field {
    margin-top: 40px;
  }

  &__controls {
    margin-top: 40px;
    text-align: right;
  }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @include responsive-media((xs)) {
    flex-flow: column;
  }

  &__item {
    &:not(:last-child) {
      margin-right: 24px;
      @include responsive-media((xs)) {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  }

  &__danger {
    color: $color-red;
  }
}
</style>
