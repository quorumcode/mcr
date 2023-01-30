<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  onMounted,
  onBeforeUnmount,
  Ref,
} from "vue";
import UiDropdown from "@/components/UiDropdown.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import UiLink from "@/components/UiLink.vue";
import IconCross from "@/components/icons/IconCross.vue";
import UiBaseModal from "@/components/UiBaseModal.vue";
import UiButton from "@/components/UiButton.vue";
import IconArrowLeft from "@/components/icons/IconArrowLeft.vue";
import IconMagnifier from "@/components/icons/IconMagnifier.vue";
import AppCompanyLogo from "@/components/AppCompanyLogo.vue";

interface Option {
  id: string;
  title: string;
  image: string;
}

export default defineComponent({
  components: {
    AppCompanyLogo,
    IconMagnifier,
    IconArrowLeft,
    UiButton,
    UiBaseModal,
    IconCross,
    UiLink,
    AppLoadingSpinner,
    UiTextInput,
    UiDropdown,
  },
  emits: {
    "update:modelValue": (query: string) => typeof query === "string",
    select: (option: Option) => option,
    clear: () => true,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    /**
     * Строка с помощью которой были получены опшенсы,
     * нужно для корректного отображения когда у нас нет результатов
     * Если использовать modelValue, то при его изменении - сразу поменяется текст
     * для пустого результата, но запрос мы еще не сделали, что может ввести в заблуждение,
     * т.к. на самом деле результаты есть, но еще не пришли
     */
    foundOptionsByQuery: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: Array as PropType<Option[]>,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isWhite: {
      type: Boolean,
      default: false,
    },
    hasMagnifierIcon: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const dropdownRef = ref() as Ref<InstanceType<typeof UiDropdown>>;
    const modalInputRef = ref() as Ref<InstanceType<typeof UiTextInput>>;
    const isDropdownActive = ref(false);

    const isDropdownOpened = computed(() => {
      return isDropdownActive.value;
    });

    const handleOutsideClick = (event: MouseEvent) => {
      isDropdownActive.value = dropdownRef.value.$el.contains(
        event.target as Node
      );
    };

    onMounted(() => {
      document.addEventListener("click", handleOutsideClick);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleOutsideClick);
    });

    return {
      isDropdownOpened,
      dropdownRef,
      modalInputRef,
    };
  },
});
</script>

<template>
  <div>
    <UiDropdown
      :is-opened="isDropdownOpened"
      placement="fill"
      ref="dropdownRef"
      @click.capture="handleDropdownClick"
    >
      <template #trigger>
        <UiTextInput
          :model-value="modelValue"
          :is-white="isWhite"
          :placeholder="placeholder"
          @update:modelValue="$emit('update:modelValue', $event)"
        >
          <template #suffix>
            <AppLoadingSpinner v-if="isLoading" class="spinner" />
            <UiLink v-if="modelValue" @click.prevent="$emit('clear')">
              <IconCross />
            </UiLink>
            <IconMagnifier v-else-if="hasMagnifierIcon" />
          </template>
        </UiTextInput>
      </template>
      <template #content>
        <div
          class="option"
          v-for="option in options"
          :key="option.id"
          @click="$emit('select', option)"
        >
          <AppCompanyLogo
            :url="option.image"
            :size="40"
            class="option__image"
          />
          {{ option.title }}
        </div>
        <div v-if="foundOptionsByQuery && !options.length" class="no-result">
          <h3 class="no-result__title">
            No results were found for "{{ foundOptionsByQuery }}"
          </h3>
        </div>
      </template>
    </UiDropdown>
  </div>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.option {
  @include typography-main(14px, 600);
  color: $color-blue;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: $rounding-medium;
  padding: 12px;

  &__image {
    margin-right: 12px;
  }

  &:hover {
    background-color: $color-blue-06;
  }
}

.spinner {
  color: $color-blue;
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $color-blue;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 24px;
    flex-shrink: 0;
    flex-grow: 0;
  }

  &__close {
    margin-bottom: 24px;
  }

  &__result {
    flex-shrink: 1;
    flex-grow: 1;
    background-color: $color-white;
    border-radius: $rounding-large $rounding-large 0 0;
    overflow: auto;
  }

  &__option {
    padding-left: 24px;
    padding-right: 24px;

    &:nth-child(even) {
      background-color: $color-blue-06;
    }
  }
}

.no-result {
  padding: 24px;

  &__title {
    @include typography-main(16px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__image {
    text-align: center;

    & > * {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>
