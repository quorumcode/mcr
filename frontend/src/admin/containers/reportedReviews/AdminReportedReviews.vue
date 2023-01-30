<script lang="ts">
import { computed, defineComponent } from "vue";
import { useAdminReportedReviewsStore } from "./store";
import AppCard from "@/components/AppCard.vue";
import UiButton from "@/components/UiButton.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import { formatDate } from "@/helpers/formatDate";

export default defineComponent({
  components: { AppLoadingSpinner, UiButton, AppCard },
  async setup() {
    const store = useAdminReportedReviewsStore();

    const reviews = computed(() => store.reviews);
    const reviewsTotal = computed(() => store.reviewsTotal);
    const hasMore = computed(() => {
      return reviewsTotal.value > reviews.value.length;
    });
    const loadMore = async () => {
      await store.fetchReviews(true);
    };

    const openReviewModal = (review) => {
      store.openReviewModal(review);
    };

    const getCompanyName = (review) => {
      return review.company.name || review.company.user?.email;
    };

    if (!store.reviews) {
      await store.fetchReviews();
    }

    return {
      isLoading: computed(() => store.isLoading),
      reviews,
      hasMore,
      loadMore,
      formatDate: (date: Date) => formatDate(date, { withTime: true }),
      openReviewModal,
      getCompanyName,
    };
  },
});
</script>

<template>
  <div>
    <AppCard>
      <div v-if="reviews.length" class="table">
        <div class="table__header">
          <div class="table__col _info">Company</div>
          <div class="table__col _message">Review message</div>
          <div class="table__col _reason">Report reason</div>
        </div>
        <div
          class="table__row"
          v-for="review in reviews"
          :key="review.id"
          @click="openReviewModal(review)"
        >
          <div class="table__col _info info">
            <div class="info__name">{{ getCompanyName(review) }}</div>
            <div class="info__date">
              {{ formatDate(review.reportedAt) }}
            </div>
          </div>
          <div class="table__col _message">
            {{ review.message }}
          </div>
          <div class="table__col _reason">
            <span v-if="review.isAnonymousOnlyReported" class="_anonymous-flag">
              anonymous
            </span>
            <span>{{ review.reportReason }}</span>
          </div>
        </div>
      </div>

      <div v-else>No reported reviews</div>

      <div class="more-button" v-if="hasMore">
        <UiButton view="secondary" @click="loadMore">
          <template #icon v-if="isLoading">
            <AppLoadingSpinner />
          </template>
          Load More...
        </UiButton>
      </div>
    </AppCard>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.table {
  display: table;
  width: 100%;

  &__header {
    @include typography-main(14px, 600);
    display: table-row;
    color: $color-blue;
  }

  &__row {
    display: table-row;
    border-radius: 12px;

    &:nth-child(odd) {
      background-color: $color-blue-06;
    }

    &:hover {
      background-color: $color-blue-10;
    }

    ._message {
      @include typography-main(14px);
    }
  }

  &__col {
    display: table-cell;
    padding: 12px;
    vertical-align: top;

    &._info {
      white-space: nowrap;
      min-width: 200px;
    }

    &._message {
      width: 100%;
      min-width: 250px;
    }

    &._reason {
      display: flex;
      flex-direction: column;
      min-width: 250px;
    }

    &._controls {
      white-space: nowrap;
      text-align: right;
    }

    &:first-child {
      border-top-left-radius: $rounding-medium;
      border-bottom-left-radius: $rounding-medium;
    }

    &:last-child {
      border-top-right-radius: $rounding-medium;
      border-bottom-right-radius: $rounding-medium;
    }

    ._anonymous-flag {
      @include typography-main(10px);
      background-color: $color-black-20;
      border-radius: $rounding-medium;
      margin-right: auto;
      padding: 1px 5px;
    }
  }
}

.info {
  &__name {
    @include typography-main(16px, 700);
    color: $color-blue;
  }

  &__date {
    @include typography-main(12px);
    color: $color-blue-60;
  }
}

.more-button {
  text-align: center;
  margin-top: 24px;
}
</style>
