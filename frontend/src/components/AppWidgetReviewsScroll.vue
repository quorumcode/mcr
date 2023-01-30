<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { WidgetData } from "@/types/commonTypes";
import AppWidgetReviewNew from "@/components/AppWidgetReviewNew.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: { AppWidgetReviewNew, AppLoadingSpinner, UiButton },
  props: {
    data: {
      type: Object as PropType<WidgetData>,
      required: true,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
    isMoreReviewsLoading: {
      type: Boolean,
      default: false,
    },
    cardBackgroud: {
      type: String,
      default: "white",
    },
    backgroudColor: {
      type: String,
      default: "FFFFFF",
    },
  },
  emits: {
    loadMore: () => true,
  },
  async setup(props) {
    const hasMore = computed(() => {
      return props.data?.reviews.length < props.data.reviewsStats.filteredCount;
    });
    return {
      hasMore,
    };
  },
});
</script>

<template>
  <div>
    <div v-for="review in data.reviews" :key="review.id">
      <AppWidgetReviewNew
        class="app-widget-reviews-scrolling__review"
        :class="`ttt review-background-${cardBackgroud}`"
        :company-id="data.companyId"
        :id="review.id"
        :user-name="review.client.name"
        :rating-value="review.rate"
        :message="review.message"
        :date="review.createdAt"
        :card-backgroud="cardBackgroud"
        :backgroud-color="backgroudColor"
        :reply="review.reply"
        :is-mobile="isMobile"
      />
    </div>

    <div class="more-button" v-if="hasMore">
      <UiButton
        view="secondary"
        @click="$emit('loadMore')"
        :is-disabled="isMoreReviewsLoading"
      >
        <template #icon v-if="isMoreReviewsLoading">
          <AppLoadingSpinner />
        </template>
        Load More...
      </UiButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-widget-reviews-scrolling {
  &__review {
    height: 100%;
  }
}

.more-button {
  display: flex;
  justify-content: center;
}

.review-background-white {
  background-color: #fff;
}

.review-background-black {
  background-color: #000;
}

.review-background-transparent {
  background-color: rgba(30, 43, 153, 0.2);
}
</style>
