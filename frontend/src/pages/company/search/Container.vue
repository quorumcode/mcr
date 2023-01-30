<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import AppStandardLayout from "@/containers/AppStandardLayout.vue";
import { useCompanySearchPageStore } from "./store";
import AppContentWrapper from "@/components/AppContentWrapper.vue";
import IconChevronRight from "@/components/icons/IconChevronRight.vue";
import AppCompanyCard from "@/components/AppCompanyCard.vue";
import AppSearchCompaniesForm from "@/containers/AppSearchCompaniesForm.vue";
import { useRoute, useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import UiButton from "@/components/UiButton.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import { useResponsive } from "@/helpers/useResponsive";

export default defineComponent({
  components: {
    AppLoadingSpinner,
    UiButton,
    AppSearchCompaniesForm,
    AppCompanyCard,
    IconChevronRight,
    AppContentWrapper,
    AppStandardLayout,
  },
  async setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useCompanySearchPageStore();
    const initialSearchValue = (route.query.query as string) || "";
    const query = ref(initialSearchValue);
    const { isMobile } = useResponsive();

    if (query.value) {
      await store.searchCompanies(query.value);
    }
    await store.fetchRecentlyAddedCompanies();

    const foundCompanies = computed(() => store.foundCompanies);
    const total = computed(() => store.total);
    const hasMore = computed(() => {
      return total.value > foundCompanies.value.length;
    });

    const handleSearch = (value: string) => {
      query.value = value;
      store.searchCompanies(value);
      router.replace({ query: { query: query.value } });
    };

    const loadMore = () => {
      store.searchCompanies(query.value, true);
    };

    return {
      routesNames,
      query,
      foundCompanies,
      total,
      hasMore,
      recentlyAddedCompanies: computed(() => store.recentlyAddedCompanies),
      isSearchLoading: computed(() => store.isSearchLoading),
      foundByQuery: computed(() => store.foundByQuery),
      handleSearch,
      loadMore,
      resetSearch: store.resetSearch,
      isMobile,
    };
  },
});
</script>

<template>
  <AppStandardLayout :back="isMobile">
    <div class="page">
      <section class="page__search search">
        <AppContentWrapper>
          <h3 class="search__title">Search for reviews on a company</h3>
          <p class="search__desc">
            Input part of the company name to look it up.
          </p>
          <AppSearchCompaniesForm
            class="search__form"
            :is-white="true"
            :initial-query="query"
            @submit="handleSearch"
            @clear="resetSearch"
          />
        </AppContentWrapper>
      </section>

      <section class="page__results">
        <AppContentWrapper>
          <template v-if="!foundByQuery">
            <div class="result-stub">
              <img
                class="result-stub__image"
                src="@/assets/illustrations/image8.svg"
                alt=""
              />
              <p class="result-stub__message">
                Start looking for companies that interest you!
              </p>
            </div>
          </template>

          <template v-else-if="!foundCompanies.length">
            <div class="section-header">
              <h2 class="section-header__title">
                No results were found for "{{ foundByQuery }}"
              </h2>
            </div>
            <div class="result-stub">
              <img
                class="result-stub__image _margin-top"
                src="@/assets/illustrations/image9.svg"
                alt=""
              />
            </div>
          </template>

          <template v-else>
            <div class="section-header">
              <h2 class="section-header__title">
                Search Results ”{{ foundByQuery }}”
              </h2>
              <span class="section-header__number">({{ total }})</span>
              <IconChevronRight />
            </div>
            <section class="grid">
              <AppCompanyCard
                v-for="company in foundCompanies"
                :key="company.id"
                :name="company.name"
                :logo-url="company.logo"
                :profile-url="{
                  name: routesNames.companyProfile,
                  params: { id: company.id },
                }"
                :rating-value="company.reviewsStats?.rateAvg"
                :reviews-count="company.reviewsStats?.count"
              />
            </section>
            <div class="more-button" v-if="hasMore">
              <UiButton view="secondary" @click="loadMore">
                <template #icon v-if="isSearchLoading">
                  <AppLoadingSpinner />
                </template>
                Load More...
              </UiButton>
            </div>
          </template>
        </AppContentWrapper>
      </section>

      <!-- <section class="page__recent recent">
        <AppContentWrapper>
          <div class="section-header">
            <h2 class="section-header__title">Recently Added Companies</h2>
            <IconChevronRight />
          </div>
          <section class="grid">
            <AppCompanyCard
              v-for="company in recentlyAddedCompanies"
              :key="company.id"
              :name="company.name"
              :logo-url="company.logo"
              :profile-url="{
                name: routesNames.companyProfile,
                params: { id: company.id },
              }"
              :rating-value="company.reviewsStats?.rateAvg"
              :reviews-count="company.reviewsStats?.count"
            />
          </section>
        </AppContentWrapper>
      </section> -->
    </div>
  </AppStandardLayout>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.page {
  &__search {
    position: relative;
    background-color: $color-blue-10;
    padding: 60px 0;

    // Background compensation for header roundings
    &::before {
      content: "";
      display: block;
      position: absolute;
      width: 100%;
      height: 100px;
      bottom: 100%;
      left: 0;
      background-color: $color-blue-10;
      z-index: -1;
    }
  }

  &__results {
    padding-top: 80px;
    padding-bottom: 120px;
  }

  &__recent {
    margin-bottom: 120px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  color: $color-blue;

  &__number {
    @include typography-main(24px, 600);
    margin-right: 4px;
  }

  &__title {
    @include typography-header(32px, 700);
    margin: 0;
    margin-right: 4px;
  }
}

.search {
  &__title {
    @include typography-main(24px, 700);
    margin: 0;
    color: $color-blue;
  }

  &__desc {
    @include typography-main(14px);
    margin: 0;
    margin-bottom: 24px;
    color: $color-black-60;
  }

  &__form {
    max-width: 700px;
  }
}

.result-stub {
  margin: 0 auto;
  text-align: center;
  color: $color-blue;

  &__image {
    max-width: 100%;

    &._margin-top {
      margin-top: 60px;
    }

    &:not(:last-child) {
      margin-bottom: 30px;
    }
  }

  &__message {
    @include typography-main(24px, 700);
    margin: 0;
  }
}

.grid {
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.more-button {
  margin-top: 80px;
  text-align: center;
}

@include responsive-media((xs, sm)) {
  .page {
    &__search {
      padding-top: 0;
      padding-bottom: 24px;
      border-radius: 0 0 $rounding-large $rounding-large;
    }

    &__results {
      padding-top: 60px;
      padding-bottom: 100px;
    }
  }

  .section-header {
    &__title {
      @include typography-main(24px, 700);
    }
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
  }

  .more-button {
    margin-top: 60px;
  }
}
</style>
