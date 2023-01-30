<script lang="ts">
import { defineComponent, reactive, ref, computed, watch, toRef, onMounted } from "vue";
import { getRandomString } from "@/helpers/getRandomString";
import IconStar from "./icons/IconStar.vue";

export default defineComponent({
  components: {
    IconStar,
  },
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
      default: "",
    },
    widgetWidth: {
      type: Number,
      default: null,
    },
  },
  emits: {
    "update:modelValue": (value: number) =>
      typeof value === "number" && value >= 0,
  },
  setup(props, { emit }) {
    const name = getRandomString();

    const state = reactive({
      hoverRate: 0,
      selected: 0,
      rateText: "",
    });

    const selectRate = (rate: number) => {
      if (state.selected === rate) {
        state.selected = 0;
        state.rateText = ratingText(rate);
      } else {
        state.selected = rate;
        state.rateText = ratingText(state.selected);
      }
      emit("update:modelValue", state.selected);
    };

    const selectRateBtn = (rate: number) => {
      if (state.selected === rate) {
        state.selected = 0;
      } else {
        state.selected = rate;
      }
      state.rateText = ratingText(state.selected);
      emit("update:modelValue", state.selected);
    };

    const ratingText = (rate: number): string => {
      const text = {
        0: "",
        1: "— Terrible",
        2: "— Poor",
        3: "— Okay",
        4: "— Good",
        5: "— Excellent",
      };
      return text[rate];
    };

    const hoverRate = (rate: number): any => {
      state.hoverRate = rate;
      state.rateText = ratingText(rate);
    };

    const leaveRate = (): any => {
      if (!state.selected) {
        state.rateText = ratingText(0);
        state.hoverRate = 0;
      } else {
        state.rateText = ratingText(state.selected);
        state.hoverRate = state.selected;
      }
    };

    if (props.modelValue) {
      state.selected = ref(props.modelValue).value;
      state.rateText = ratingText(props.modelValue);
    }

    const containerRef = ref<HTMLElement>();
    let containerWidth = computed(() => containerRef.value?.clientWidth);
    let isShowRatingText = ref(true);

    watch(toRef(props, "widgetWidth"), () => {
      containerWidth = computed(() => containerRef.value?.clientWidth);
      if (containerWidth.value) {
        isShowRatingText.value = containerWidth.value > 365;
      }
    });

    onMounted(() => {
      if (containerWidth.value) {
        isShowRatingText.value = containerWidth.value > 365;
      }
    });

    return {
      name,
      state,
      selectRate,
      selectRateBtn,
      ratingText,
      hoverRate,
      leaveRate,
      containerRef,
      isShowRatingText,
    };
  },
});
</script>

<template>
  <div
    :class="{ '_has-error': hasError, '_is-disabled': isDisabled }"
    class="rate"
    ref="containerRef"
    @mouseleave="leaveRate"
  >
    <button
      class="rate__btn"
      v-for="rate in 5"
      :key="rate"
      type="button"
      @keyup.space="selectRateBtn(rate)"
    >
      <IconStar
        class="rate__star"
        :class="{
          '_is-hover': state.hoverRate >= rate,
          '_is-active': state.selected >= rate,
          '_is-any-active': state.selected,
          '_is-disabled': isDisabled,
        }"
        @mouseover="hoverRate(rate)"
        @click="selectRate(rate)"
      />
    </button>
    <input v-model="state.selected" name="rate" type="hidden" />
    <span
      v-if="isShowRatingText"
      class="rate__text"
      :class="{
        '_hide-mobile': !state.selected,
        '_is-widget': place === 'widget-add-review',
      }"
    >
      {{ state.rateText }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/responsive.scss";

.rate {
  display: flex;
  box-shadow: 2px 2px 6px 2px rgba(30, 43, 153, 0.12);
  border-radius: $rounding-medium;
  padding: 10px 12px;
  border: 1px solid transparent;

  &._has-error {
    box-shadow: 2px 2px 6px 2px rgba(255, 101, 45, 0.12);
    border: 1px solid $color-red-60;
  }

  &._is-disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  &__star {
    width: 36px;
    height: 36px;
    cursor: pointer;
    color: $color-black-10;

    &._is-hover {
      color: $color-blue;
    }

    &._is-active {
      color: $color-yellow;
    }

    &._is-hover._is-any-active {
      color: $color-yellow;
    }
  }

  &__text {
    @include typography-main(20px, 600);
    color: $color-blue;
    align-self: center;
    margin-left: 4px;
  }

  &__input {
    display: none;
  }
}

.rate__btn {
  border: none;
  background-color: transparent;
  height: 38px;
  padding: 0;
  margin-right: 8px;
}

@include responsive-media((xs, sm)) {
  .rate {
    flex-wrap: wrap;
  }

  .rate__text {
    width: 100%;
    height: 32px;

    &._hide-mobile {
      opacity: 0;
    }

    &._is-widget {
      width: inherit;

      &._hide-mobile {
        opacity: 1;
      }
    }
  }
}
</style>
