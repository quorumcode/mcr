<script lang="ts">
import { defineComponent, PropType } from "vue";
import UiButton from "@/components/UiButton.vue";
import { RouteLocationRaw } from "vue-router";

interface Item {
  route: RouteLocationRaw;
  title: string;
  counter?: {
    value: number;
    type?: "normal" | "danger";
  };
  isExactActive?: false;
}

export default defineComponent({
  components: { UiButton },
  props: {
    items: {
      type: Array as PropType<Item[]>,
      default: () => [],
    },
  },
  setup() {
    const isItemActive = ({
      isExactActive,
      isActive,
      item,
    }: {
      isExactActive: boolean;
      isActive: boolean;
      item: Item;
    }) => {
      return item.isExactActive ? isExactActive : isActive;
    };

    return {
      isItemActive,
    };
  },
});
</script>

<template>
  <div class="admin-tabs">
    <RouterLink
      v-for="item in items"
      :key="item.value"
      custom
      :to="item.route"
      v-slot="{ isExactActive, isActive, navigate }"
    >
      <UiButton
        class="admin-tabs__item"
        :view="
          isItemActive({ isExactActive, isActive, item })
            ? 'control'
            : 'control-secondary'
        "
        :is-end-icon="true"
        @click="navigate"
      >
        {{ item.title }}
        <template #icon v-if="item.counter !== undefined">
          <div class="count" :class="`_type-${item.counter.type || 'normal'}`">
            {{ item.counter.value }}
          </div>
        </template>
      </UiButton>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";

.admin-tabs {
  display: flex;
  align-items: center;

  &__item {
    &:not(:last-child) {
      margin-right: 12px;
    }
  }
}

.count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  box-sizing: border-box;
  padding: 3px 6px;
  border-radius: $rounding-circle;

  &._type-normal {
    background-color: $color-blue-40;
    color: $color-white;
  }

  &._type-danger {
    background-color: $color-red;
    color: $color-white;
  }
}
</style>
