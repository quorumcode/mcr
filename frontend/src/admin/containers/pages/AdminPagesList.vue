<script lang="ts">
import { computed, defineComponent } from "vue";
import AppCard from "@/components/AppCard.vue";
import { usePagesStore } from "@/stores/pages";
import { routesNames } from "@/routesNames";
import { Page } from "@/types/commonTypes";
import { useRouter } from "vue-router";
import UiButton from "@/components/UiButton.vue";
import IconPlus from "@/components/icons/IconPlus.vue";

export default defineComponent({
  components: { IconPlus, UiButton, AppCard },
  async setup() {
    const router = useRouter();
    const pagesStore = usePagesStore();

    const pages = computed(() => pagesStore.pages);

    const createPage = () => {
      router.push({ name: routesNames.adminDashboardEditPage });
    };

    return {
      routesNames,
      pages,
      getPageRoute: (name: string) => pagesStore.getPageRoute(name),
      createPage,
    };
  },
});
</script>

<template>
  <div>
    <AppCard class="list">
      <div v-if="pages.length" class="table">
        <div class="table__header">
          <div class="table__col">Title</div>
          <div class="table__col">Url</div>
          <div class="table__col">Category</div>
        </div>
        <RouterLink
          :to="{
            name: routesNames.adminDashboardEditPage,
            params: { id: page.id },
          }"
          class="table__row"
          v-for="page in pages"
          :key="page.id"
        >
          <div class="table__col">
            {{ page.title }}
          </div>
          <div class="table__col">
            <RouterLink :to="getPageRoute(page.name)" class="page-link">
              {{ getPageRoute(page.name).href }}
            </RouterLink>
          </div>
          <div class="table__col">
            {{ page.category || "-" }}
          </div>
        </RouterLink>
      </div>

      <div v-else>No pages</div>
    </AppCard>

    <div class="controls">
      <UiButton view="control" @click="createPage">
        <template #icon><IconPlus /></template>
        Add Page
      </UiButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.list {
  margin-bottom: 24px;
}

.controls {
  text-align: right;
}

.table {
  display: table;
  width: 100%;

  &__header {
    @include typography-main(14px, 600);
    display: table-row;
    color: $color-blue;
  }

  &__row {
    color: $color-black;
    text-decoration: none;
    display: table-row;
    border-radius: 12px;

    &:nth-child(odd) {
      background-color: $color-blue-06;
    }

    &:hover {
      background-color: $color-blue-10;
    }
  }

  &__col {
    display: table-cell;
    padding: 12px;
    vertical-align: top;

    &:first-child {
      border-top-left-radius: $rounding-medium;
      border-bottom-left-radius: $rounding-medium;
    }

    &:last-child {
      border-top-right-radius: $rounding-medium;
      border-bottom-right-radius: $rounding-medium;
    }
  }
}

.page-link {
  color: $color-blue;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
