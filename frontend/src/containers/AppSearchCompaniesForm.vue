<script lang="ts">
import { computed, defineComponent, ref, toRef } from "vue";
import { useSearchCompaniesFormStore } from "@/stores/searchCompaniesForm";
import UiSearchInput from "@/components/UiSearchInput.vue";
import UiButton from "@/components/UiButton.vue";
import IconMagnifier from "@/components/icons/IconMagnifier.vue";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { ClientOnly } from "vite-ssr";
import { throttle } from "@/helpers/throttle";
import { useResponsive } from "@/helpers/useResponsive";

export default defineComponent({
  components: { ClientOnly, IconMagnifier, UiButton, UiSearchInput },
  emits: {
    submit: (query: string) => typeof query === "string",
    clear: () => true,
  },
  props: {
    initialQuery: {
      type: String,
      default: "",
    },
    isWhite: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const searchCompaniesFormStore = useSearchCompaniesFormStore();
    const modelValue = ref(props.initialQuery);
    const isLoading = toRef(searchCompaniesFormStore, "isLoading");
    const { isMobile } = useResponsive();

    const handleSelect = (
      option: typeof searchCompaniesFormStore.options[0]
    ) => {
      router.push({
        name: routesNames.companyProfile,
        params: { id: option.id },
      });
    };

    const throttledFetchOptions = throttle(
      searchCompaniesFormStore.fetchOptions,
      { timeout: 300, debounce: true }
    );

    const handleInput = (value: string) => {
      modelValue.value = value;
      isLoading.value = true; // Set loading manually because fetch is throttled
      throttledFetchOptions(value);
    };

    const clear = () => {
      modelValue.value = "";
      searchCompaniesFormStore.options = [];
      emit("clear");
    };

    return {
      modelValue,
      isLoading,
      isMobile,
      options: computed(() => searchCompaniesFormStore.options),
      foundByQuery: computed(() => searchCompaniesFormStore.foundByQuery),
      handleSelect,
      handleInput,
      clear,
    };
  },
});
</script>

<template>
  <form
    class="app-search-companies-form"
    @submit.prevent="$emit('submit', modelValue)"
  >
    <ClientOnly>
      <UiSearchInput
        class="app-search-companies-form__input"
        placeholder="Type Company name…"
        :options="options"
        :model-value="modelValue"
        :is-white="isWhite"
        :is-loading="isLoading"
        :found-options-by-query="foundByQuery"
        @clear="clear"
        @update:modelValue="handleInput"
        @select="handleSelect"
      />
    </ClientOnly>
    <UiButton
      v-if="isMobile"
      class="app-search-companies-form__button"
      type="submit"
    >
      <template #icon>
        <IconMagnifier />
      </template>
    </UiButton>
    <UiButton v-else class="app-search-companies-form__button" type="submit">
      <template #icon>
        <IconMagnifier />
      </template>
      Search
    </UiButton>
  </form>
</template>

<style lang="scss" scoped>
@import "@/styles/responsive.scss";

.app-search-companies-form {
  display: flex;
  align-items: center;

  &__input {
    flex-shrink: 1;
    flex-grow: 1;
    margin-right: 24px;

    @include responsive-media((xs, sm)) {
      margin-right: 10px;
    }
  }

  &__button {
    flex-shrink: 0;
    flex-grow: 0;
  }
}
</style>
