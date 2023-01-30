<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useWidgetViewPageStore } from "@/pages/widget/view/store";
import { WidgetType } from "@/types/commonTypes";
import AppWidget from "@/components/AppWidget.vue";
import AppWidgetInvite from "@/components/AppWidgetInvite.vue";
import AppWidgetAddReview from "@/components/AppWidgetAddReview.vue";

export default defineComponent({
  components: { AppWidget, AppWidgetInvite, AppWidgetAddReview },
  async setup() {
    const route = useRoute();
    const store = useWidgetViewPageStore();
    const companyId = route.params.companyId as string;
    const errorMessage = ref("");
    const reviewToken = route.params.reviewToken as string;
    const widgetParams = computed(() => ({
      type: route.query.widgetType as WidgetType,
      color: route.query.color as string,
      secondaryColor: route.query.secondaryColor as string,
      backgroudColor: route.query.backgroudColor as string,
      cardBackgroud: route.query.cardBackgroud as string,
    }));

    // Validate params
    watch(
      widgetParams,
      () => {
        if (!/^([0-9A-F]{3}){1,2}$/i.test(widgetParams.value.color)) {
          errorMessage.value = "Not valid 'color' param";
        }
        if (!Object.values(WidgetType).includes(widgetParams.value.type)) {
          errorMessage.value = "Not valid 'type' param";
        }
      },
      { immediate: true }
    );

    try {
      await store.fetchWidgetData(companyId, widgetParams.value.type);
    } catch (e) {
      console.error(e);
      errorMessage.value = "Data retrieval error";
    }

    const loadMore = async () => {
      await store.fetchMoreReviews(companyId, widgetParams.value.type);
    };

    return {
      errorMessage,
      widgetParams,
      data: computed(() => store.data),
      loadMore,
      isMoreReviewsLoading: computed(() => store.isMoreReviewsLoading),
      companyName: computed(() => store.tokenInfo?.company.name),
      tokenInfo: computed(() => store.tokenInfo),
      reviewToken,
      companyId,
    };
  },
});
</script>

<template>
  <div class="page" :class="{ page__compact: widgetParams.type === 'compact' }">
    <div v-if="errorMessage" class="page__error">{{ errorMessage }}</div>
    <AppWidgetInvite
      v-else-if="widgetParams.type === 'invite'"
      :card-backgroud="widgetParams.cardBackgroud"
      :color="widgetParams.color"
      :backgroud-color="widgetParams.backgroudColor"
      :review-token="reviewToken"
      :company-id="companyId"
    />
    <AppWidgetAddReview
      v-else-if="widgetParams.type === 'addReview'"
      :widget-width="widgetParams.width"
      :color="widgetParams.color"
      :backgroud-color="widgetParams.backgroudColor"
      :review-token="reviewToken"
    />
    <AppWidget
      v-else
      v-bind="widgetParams"
      :data="data"
      :card-backgroud="widgetParams.cardBackgroud"
      :color="widgetParams.color"
      :secondary-color="widgetParams.secondaryColor"
      :backgroud-color="widgetParams.backgroudColor"
      class="page__widget"
      :is-more-reviews-loading="isMoreReviewsLoading"
      @load-more="loadMore"
    />
  </div>
</template>

<style lang="scss">
html,
body {
  background: transparent;
}
</style>

<style lang="scss" scoped>
.page {
  width: 100vw;
  height: 100vh;

  &__error {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: 100%;
    transform: translate(-50%, -50%);
  }
  &__compact {
    display: flex;
    align-items: center;
  }
}
</style>
