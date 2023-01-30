<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import UiDropdown from "@/components/UiDropdown.vue";
import IconChevron from "@/components/icons/IconChevron.vue";
import UiButton from "@/components/UiButton.vue";
import IconCheck from "@/components/icons/IconCheck.vue";

interface Item {
  value: unknown;
  title: string;
}

export default defineComponent({
  components: { IconCheck, UiButton, IconChevron, UiDropdown },
  props: {
    modelValue: {
      required: true,
    },
    items: {
      type: Object as PropType<Item[]>,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    "update:modelValue": (value: unknown) => true,
  },
  setup(props, { emit }) {
    const dropdownRef = ref<InstanceType<typeof UiDropdown>>();
    const selectedItem = computed(() => {
      return props.items.find((item) => item.value === props.modelValue);
    });

    const selectItem = (value: unknown) => {
      emit("update:modelValue", value);
      dropdownRef.value?.hide();
    };

    return { dropdownRef, selectedItem, selectItem };
  },
});
</script>

<template>
  <div class="ui-button-select-dropdown">
    <UiDropdown
      placement="end"
      ref="dropdownRef"
      :is-disabled="isDisabled"
    >
      <template #trigger="{ isOpened }">
        <UiButton
          class="trigger"
          :class="{ '_is-opened': isOpened }"
          view="control-secondary"
          :is-end-icon="true"
        >
          <template #icon><IconChevron class="trigger__chevron" /></template>
          {{ selectedItem?.title }}
        </UiButton>
      </template>
      <template #content>
        <ul class="menu">
          <li
            class="item"
            :class="{ '_is-selected': modelValue === item.value }"
            v-for="item in items"
            :key="item.value"
            @click="selectItem(item.value)"
          >
            {{ item.title }}
            <IconCheck v-if="modelValue === item.value" class="item__icon" />
          </li>
        </ul>
      </template>
    </UiDropdown>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/typography.scss";

.trigger {
  &__chevron {
    transition: transform 0.2s;
  }

  &._is-opened {
    .trigger__chevron {
      transform: scaleY(-1);
    }
  }
}

.menu {
  @include typography-main(14px, 600);
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 14px 12px;
  border-radius: $rounding-medium;
  color: $color-blue;
  text-decoration: none;

  &:hover {
    background-color: $color-blue-06;
  }

  &._is-selected {
    background-color: $color-blue-06;
  }

  &__icon {
    margin-left: 12px;
  }
}
</style>
