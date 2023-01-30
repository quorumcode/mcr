<script lang="ts">
import { computed, defineComponent } from "vue";
import { useDashboardStats } from "@/pages/dashboard/stats/store";
import {
  ReviewsSort,
  useDashboardReviewsPageStore,
} from "@/pages/dashboard/reviews/store";
import { routesNames } from "@/routesNames";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import AppChartPageVisits from "@/components/AppChartPageVisits.vue";
import AppChartReceivedReviews from "@/components/AppChartReceivedReviews.vue";
import AppRating from "@/components/AppRating.vue";
import AppReview from "@/components/AppReview.vue";
import UiButtonLink from "@/components/UiButtonLink.vue";
import IconReplied from "@/components/icons/IconReplied.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import { useUserStore } from "@/stores/user";

enum nameAssessment {
  excellent = "Excellent",
  good = "Good",
  okay = "Okay",
  poor = "Poor",
  terrible = "Terrible",
}

export default defineComponent({
  components: {
    AppContentWrapper,
    AppChartPageVisits,
    AppChartReceivedReviews,
    AppRating,
    AppReview,
    UiButtonLink,
    IconReplied,
    IconArrowRight,
  },
  async setup() {
    const store = useDashboardStats();
    store.fetch();

    const reviewStore = useDashboardReviewsPageStore();
    const userStore = useUserStore();
    const isTestCompany = userStore.info?.company?.isTest;

    const formatDifference = (date: Date) => {
      return formatDistanceToNowStrict(date, {
        unit: "day",
        roundingMethod: "floor",
      });
    };

    const openReviewModal = (review: any) => {
      reviewStore.openReviewModal(review, () => {
        store.fetch();
      });
    };

    return {
      formatDifference,
      subscriptionStatus: computed(() => store.subscriptionStatus),
      subscription: computed(() => store.subscription),
      nameAssessment,
      routesNames,
      dashboardData: computed(() => store.dashboardData),
      companyId: computed(() => store.companyId),
      companyName: computed(() => store.companyName),
      isLoading: computed(() => store.isLoading),
      openReviewModal,
      updatePeriod: store.updatePeriod,
      periodVisits: store.periodVisits,
      periodReviews: store.periodReviews,
      unrepliedSort: ReviewsSort.unreplied,
      isTestCompany,
    };
  },
});
</script>

<template>
  <div class="page">
    <AppContentWrapper v-if="isLoading" class="content-wrapper">
      <section class="stats">
        <header class="stats__header">
          <h1 class="stats__header-title">{{ companyName }}</h1>

          <div v-if="isTestCompany" class="stats__header-test">
            Test company
          </div>

          <div class="stats__header-status">
            <template v-if="subscriptionStatus === 'trialingCardConfirmed'">
              <IconReplied />
              Trial (Card Confirmed)
              <div class="stats__header-status-daysleft">
                {{ formatDifference(subscription.periodEndAt) }} left of free
                trial
              </div>
            </template>

            <template v-else-if="subscriptionStatus === 'trialing'">
              <IconReplied />
              Trial
              <div class="stats__header-status-daysleft">
                {{ formatDifference(subscription.periodEndAt) }} left of free
                trial
              </div>
            </template>

            <template v-else-if="subscriptionStatus === 'activeWillBeCanceled'">
              <IconReplied />
              Subscribed
              <div class="stats__header-status-daysleft">
                {{ formatDifference(subscription.willBeCanceledAt) }} of
                subscription left
              </div>
            </template>

            <template v-else-if="subscriptionStatus === 'active'">
              <IconReplied />
              Subscribed
              <div class="stats__header-status-daysleft">
                {{ formatDifference(subscription.periodEndAt) }} left
              </div>
            </template>
          </div>
        </header>

        <div v-if="dashboardData.reviewStats" class="stats__content-top">
          <div class="review-chart">
            <h2 class="review-chart__title">All-time Rating</h2>
            <div class="main__rating">
              <AppRating
                :adaptive="false"
                :value="dashboardData?.reviewStats?.rateAvg"
                :reviews-count="dashboardData?.reviewStats?.count"
                place="dashboard-stats"
              />
            </div>
            <div
              v-for="(name, prop) in nameAssessment"
              :key="name"
              class="review-chart__item"
            >
              <div class="review-chart__item-name">{{ name }}</div>
              <div class="review-chart__item-percent">
                {{
                  dashboardData.reviewStats[prop]
                    ? dashboardData.reviewStats[prop]
                    : "0"
                }}%
              </div>
              <div class="review-chart__item-chart">
                <div
                  class="review-chart__item-fill"
                  :class="prop"
                  :style="`width: ${
                    dashboardData.reviewStats[prop]
                      ? dashboardData.reviewStats[prop]
                      : '0'
                  }%`"
                />
                <div class="review-chart__item-value" />
              </div>
            </div>
          </div>
          <AppChartPageVisits
            :company-id="companyId"
            :chart-data="dashboardData.visitStats"
            :period-settings="periodVisits"
            @change="updatePeriod"
          />
          <AppChartReceivedReviews
            :chart-data="dashboardData.reviewSources"
            :period-settings="periodReviews"
            @change="updatePeriod"
          />
        </div>

        <div v-if="dashboardData.recentReviews" class="stats__content-bot">
          <div class="lastreview">
            <h2 class="lastreview__title">Recent reviews</h2>

            <template v-if="dashboardData.recentReviews.length">
              <div class="lastreview__grid">
                <div
                  class="lastreview__card"
                  v-for="review in dashboardData.recentReviews"
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
                    place="dashboard-stats-review"
                    :i-am-company-owner="true"
                  />
                </div>
              </div>
            </template>
            <div v-else class="lastreview__no-data">
              <img src="@/assets/illustrations/review-cloud.svg" alt="" />
              <span>There’s no reviews yet!</span>
            </div>
          </div>
          <div class="not-response">
            <h2 class="not-response__title">
              Reviews with no company response
            </h2>
            <div
              class="not-response__content"
              :class="{ '_no-data': !dashboardData.notResponsedCount }"
            >
              <span class="not-response__content-amount">
                {{
                  dashboardData.notResponsedCount
                    ? dashboardData.notResponsedCount
                    : 0
                }}
              </span>
              <span class="not-response__content-text">reviews</span>
            </div>

            <UiButtonLink
              :to="{
                name: routesNames.dashboardReviews,
                params: {
                  id: companyId,
                  sort: unrepliedSort,
                },
              }"
              type="primary"
              class="not-response__action-button"
              :is-disabled="!dashboardData.notResponsedCount"
            >
              <template #icon>
                <IconArrowRight />
              </template>
              Respond
            </UiButtonLink>
          </div>
        </div>
      </section>
    </AppContentWrapper>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";

.page {
  padding-bottom: 80px;
  margin-top: 40px;
}

.stats {
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    &-title {
      @include typography-header(32px, 700);
      color: $color-blue;
      align-items: center;
      margin: 0;
      margin-right: 24px;
    }

    &-test {
      @include typography-main(12px, 600);
      color: $color-yellow;
      background-color: $color-black-60;
      border-radius: $rounding-medium;
      padding: 4px 8px;
      margin-right: 12px;
    }

    &-status {
      display: flex;
      align-items: center;
      @include typography-main(14px, 600);
      color: $color-green;

      & svg {
        margin-right: 4px;
      }

      &-daysleft {
        border-radius: $rounding-medium;
        padding: 4px;
        color: $color-blue;
        background-color: $color-blue-006;
        @include typography-main(12px, 600);
        margin-left: 12px;
      }
    }

    @include responsive-media((xs, sm)) {
      flex-direction: column;
    }
  }

  &__content-top {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1.5fr;
    background-color: #f1f2f9;

    @include responsive-media((xs, md)) {
      grid-template-columns: 1fr;
    }
  }

  &__content-bot {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 360px;
    background-color: #f1f2f9;

    @include responsive-media((xs, md)) {
      grid-template-columns: 1fr;
    }
  }
}

.review-chart {
  @include shadow-x-large;
  background-color: $color-white;
  border-radius: $rounding-large;
  padding: 24px;
  max-width: 264px;
  box-sizing: border-box;

  @include responsive-media((xs, md)) {
    margin: 0 auto;
  }

  &__title {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    line-height: 24px;

    &:not(:last-child) {
      margin-bottom: 8px;
    }

    &-name {
      @include typography-main(14px, 700);
      color: $color-blue;
      min-width: 50%;
    }

    &-percent {
      @include typography-main(12px, 700);
      color: $color-blue;
      margin-left: auto;
      min-width: 50%;
      text-align: right;
    }

    &-chart {
      height: 16px;
      width: 168px;
      background-color: $color-black-10;
      position: relative;
      min-width: 100%;
    }

    &-fill {
      height: 100%;
    }

    &-value {
      @include typography-main(16px, 500);
      color: $color-blue;
      position: absolute;
      top: 0;
      right: 8px;
    }
  }
}

.lastreview {
  @include shadow-x-large;
  background-color: $color-white;
  border-radius: $rounding-large;
  display: flex;
  flex-direction: column;
  padding: 24px;
  margin-right: 24px;

  @include responsive-media((xs, md)) {
    margin-right: 0;
  }

  &__title {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__grid {
    margin-top: 24px;
    display: grid;
    grid-gap: 24px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__card {
    background-color: $color-blue-06;
    padding: 24px;
    border-radius: $rounding-large;
    cursor: pointer;
  }

  &__content-top {
    display: flex;
    position: relative;
    margin-top: 24px;
  }

  &__content-bot {
    display: flex;
    position: relative;
    margin-top: 24px;
  }

  &__no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-bottom: 56px;

    img {
      width: 226px;
      height: 152px;
      margin-top: 56px;
    }

    span {
      @include typography-main(20px, 700);
      color: $color-blue-60;
      margin-top: 12px;
    }
  }
}

.not-response {
  @include shadow-x-large;
  background-color: $color-white;
  border-radius: $rounding-large;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;

  @include responsive-media((xs, md)) {
    margin: 24px 20% 0;
  }

  &__title {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__content {
    color: $color-red;
    margin: 40px 0;

    &-text {
      @include typography-header(24px, 500);
    }

    &-amount {
      @include typography-header(72px, 700);
      margin-right: 5px;
    }

    &._no-data {
      color: $color-blue-20;
    }
  }

  &__action {
    margin-top: auto;

    &-button {
      width: 100%;
    }
  }
}

.excellent {
  background: $color-green;
}
.good {
  background: #a1d95a;
}
.okay {
  background: #ffda55;
}
.poor {
  background: #ffad33;
}
.terrible {
  background: $color-red;
}

.content-wrapper {
  max-width: 1128px;
}
</style>
