<script lang="ts">
import { computed, defineComponent } from "vue";
import AppReview from "@/components/AppReview.vue";
import UiModal from "@/components/UiModal.vue";
import UiButton from "@/components/UiButton.vue";
import { useAdminReportedReviewsStore } from "@/admin/containers/reportedReviews/store";
import { useAdminEventBus } from "@/admin/helpers/useAdminEventBus";

export default defineComponent({
  components: {
    AppReview,
    UiModal,
    UiButton,
  },
  setup() {
    const store = useAdminReportedReviewsStore();
    const review = computed(() => store.review);
    const adminEventBus = useAdminEventBus();

    const companyName = computed(() => {
      return store.review?.company.name || store.review?.company.user?.email;
    });

    const denyReport = async (reviewId: string) => {
      await store.denyReport(reviewId);
      adminEventBus.triggerUpdateCounters();
    };

    const removeReview = async (reviewId: string) => {
      await store.removeReview(reviewId);
      adminEventBus.triggerUpdateCounters();
    };

    return {
      review,
      close: store.closeReview,
      companyName,
      denyReport,
      removeReview,
    };
  },
});
</script>

<template>
  <div>
    <UiModal v-if="review" @close="close" :show-close-btn="true">
      <div class="review-modal">
        <div>
          <span class="review-modal__label">Company: </span>
          <span class="review-modal__name">{{ companyName }}</span>
        </div>
        <div>
          <span class="review-modal__label">Report reason: </span>
          <span>{{ review.reportReason }}</span>
          <span v-if="review.isAnonymousOnlyReported" class="_anonymous-flag"
            >anonymous
          </span>
        </div>
        <AppReview
          class="review-modal__review"
          :rating-value="review.rate"
          :user-name="review.client.name"
          :date="review.createdAt"
          :message="review.message"
          :show-full-message="true"
          :company-name="companyName"
        />
        <div class="controls">
          <UiButton
            class="controls__item"
            view="control-secondary"
            @click="denyReport(review.id)"
          >
            Deny
          </UiButton>
          <UiButton
            class="controls__item"
            view="control-secondary-danger"
            @click="removeReview(review.id)"
          >
            Remove
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

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

  &__label {
    @include typography-main(14px, 600);
    color: $color-blue;
  }

  ._anonymous-flag {
    @include typography-main(10px);
    background-color: $color-black-20;
    border-radius: $rounding-medium;
    margin-left: 5px;
    padding: 1px 5px;
  }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &__item {
    &:not(:last-child) {
      margin-right: 24px;
    }
  }

  &__danger {
    color: $color-red;
  }
}
</style>
