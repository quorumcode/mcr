<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { ReviewsSort, useDashboardReviewsPageStore } from "./store";
import AppCard from "@/components/AppCard.vue";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import AppReview from "@/components/AppReview.vue";
import UiButton from "@/components/UiButton.vue";
import UiButtonSelectDropdown from "@/components/UiButtonSelectDropdown.vue";
import IconChevronRight from "@/components/icons/IconChevronRight.vue";
import IconExpand from "@/components/icons/IconExpand.vue";
import { routesNames } from "@/routesNames";

const sortTitlesMap: Record<ReviewsSort, string> = {
  [ReviewsSort.recent]: "Recent",
  [ReviewsSort.unreplied]: "Unreplied First",
  [ReviewsSort.rate]: "By Rate",
};

export default defineComponent({
  components: {
    AppCard,
    AppContentWrapper,
    AppLoadingSpinner,
    AppReview,
    UiButton,
    UiButtonSelectDropdown,
    IconChevronRight,
    IconExpand,
  },
  async setup() {
    const store = useDashboardReviewsPageStore();
    const route = useRoute();
    const sort = computed(() => store.sort);
    const reviews = computed(() => store.reviews);
    const reviewsTotal = computed(() => store.reviewsTotal);
    const hasMore = computed(() => {
      return reviewsTotal.value > reviews.value.length;
    });

    const sortItems = computed(() => {
      return Object.keys(ReviewsSort).map((name) => ({
        value: name,
        title: sortTitlesMap[name],
      }));
    });

    const loadMore = async () => {
      await store.fetchReviews(true);
    };

    if (route.params.sort) {
      await store.changeSort(route.params.sort);
    } else {
      await store.fetch();
    }

    return {
      sort,
      sortItems,
      reviews,
      reviewsTotal,
      hasMore,
      isLoading: computed(() => store.isLoading),
      isExportCsvLoading: computed(() => store.isExportCsvLoading),
      changeSort: store.changeSort,
      loadMore,
      openReviewModal: store.openReviewModal,
      exportCsv: store.exportCsv,
      companyName: computed(() => store.companyName),
      routesNames,
    };
  },
});
</script>

<template>
  <div class="page">
    <AppContentWrapper>
      <section class="reviews">
        <header class="reviews__header reviews-header">
          <div class="reviews-header__title reviews-title">
            <h2 class="reviews-title__text">My Reviews</h2>
            <div class="reviews-title__count">({{ reviewsTotal }})</div>
            <IconChevronRight />
          </div>
          <div class="reviews-header__controls reviews-controls">
            <UiButton
              class="reviews-controls__item"
              view="control-secondary"
              :is-disabled="!reviewsTotal || isExportCsvLoading"
              @click="exportCsv"
            >
              <template #icon>
                <AppLoadingSpinner v-if="isExportCsvLoading" />
                <IconExpand v-else />
              </template>
              Export
            </UiButton>
            <div class="reviews-controls__item sort-control">
              <span class="sort-control__prefix">Sort by:</span>
              <UiButtonSelectDropdown
                :items="sortItems"
                :model-value="sort"
                :is-disabled="!reviewsTotal"
                @update:modelValue="changeSort"
              />
            </div>
          </div>
        </header>

        <template v-if="reviews.length">
          <div class="reviews__grid">
            <AppCard
              class="reviews__card"
              v-for="review in reviews"
              :key="review.id"
              @click="openReviewModal(review)"
            >
              <AppReview
                :rating-value="review.rate"
                :user-name="review.client.name"
                :company-name="companyName"
                :date="review.createdAt"
                :message="review.message"
                :reply-message="review.reply?.message"
                :i-am-company-owner="true"
              />
            </AppCard>
          </div>

          <div class="more-button" v-if="hasMore">
            <UiButton view="secondary" @click="loadMore">
              <template #icon v-if="isLoading">
                <AppLoadingSpinner />
              </template>
              Load More...
            </UiButton>
          </div>
        </template>

        <template v-else>
          <div class="result-stub">
            <img
              class="result-stub__image"
              src="@/assets/illustrations/image10.svg"
              alt=""
            />
            <p class="result-stub__desc">
              Here you'll be able to see all your reviews and reply.
            </p>
            <p class="result-stub__message">Let's start getting reviews!</p>
            <RouterLink :to="{ name: routesNames.dashboardGetReviews }">
              <UiButton class="result-stub__button">Get reviews!</UiButton>
            </RouterLink>
          </div>
        </template>
      </section>
    </AppContentWrapper>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";

.page {
  padding-bottom: 80px;
  margin-top: 40px;

  &__invite {
    margin-bottom: 40px;
  }
}

.reviews {
  &__header {
    margin-bottom: 24px;
  }

  &__grid {
    display: grid;
    grid-gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }

  &__card {
    height: 100%;
  }
}

.reviews-header {
  display: flex;
  align-items: center;

  @include responsive-media((xs, sm)) {
    flex-direction: column;
  }

  &__title {
    flex-shrink: 1;
    flex-grow: 1;
    margin-right: 24px;
  }

  &__controls {
    flex-shrink: 0;
    flex-grow: 0;

    @include responsive-media((xs, sm)) {
      margin-top: 20px;
    }
  }
}

.reviews-title {
  display: flex;
  align-items: center;
  color: $color-blue;

  &__text {
    @include typography-header(32px, 700);
    margin: 0;
    margin-right: 4px;
  }

  &__count {
    @include typography-main(24px, 600);
    margin-right: 4px;
  }
}

.reviews-controls {
  display: flex;
  align-items: center;

  &__item {
    &:not(:last-child) {
      margin-right: 24px;
    }
  }
}

.sort-control {
  display: flex;
  align-items: center;

  &__prefix {
    @include typography-main(14px);
    margin-right: 12px;
    color: $color-black-60;
  }
}

.more-button {
  margin-top: 80px;
  text-align: center;
}

.result-stub {
  margin: 0 auto;
  text-align: center;
  color: $color-blue;

  &__image {
    max-width: 100%;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__message {
    @include typography-main(24px, 700);
    margin: 0;
  }

  &__desc {
    @include typography-main(16px);
    margin: 0;
  }

  &__button {
    @include typography-main(20px, 600);
    margin-top: 20px;
  }
}
</style>
