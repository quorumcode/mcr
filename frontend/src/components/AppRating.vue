<script lang="ts">
import { computed, defineComponent } from "vue";
import UiStars from "@/components/UiStars.vue";

export default defineComponent({
  components: { UiStars },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    maxValue: {
      type: Number,
      default: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    widgetType: {
      type: String,
      default: "",
    },
    adaptive: {
      type: Boolean,
      default: true,
    },
    isReviewsCountVisible: {
      type: Boolean,
      default: true,
    },
    isStrongValue: {
      type: Boolean,
      default: false,
    },
    isCompanyPage: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
      default: "",
    },
    secondaryColor: {
      type: String,
      default: "6F728D",
    },
  },
  setup(props) {
    const fixedValue = computed(() => {
      return props.value.toFixed(1);
    });

    return { fixedValue };
  },
});
</script>

<template>
  <div>
    <div
      class="app-rating"
      :class="{
        _adaptive: adaptive,
        '_is-reviews-count-visible': isReviewsCountVisible,
        '_is-strong-value': isStrongValue,
        '_is-company-page-grid': place === 'company-page-grid',
        '_is-company-page-card': place === 'company-page-card',
        '_is-dashboard-stats': place === 'dashboard-stats',
        '_is_dashboard-stats-review': place === 'dashboard-stats-review',
      }"
    >
      <div
        class="app-rating__rating"
        :class="{ '_no-have-value': reviewsCount === 0 }"
      >
        <div class="app-rating__value">
          {{ fixedValue }}
        </div>
        <UiStars
          :value="value"
          :max-value="maxValue"
          :widget-type="widgetType"
          :place="place"
        />
      </div>

      <div
        v-if="place === 'dashboard-stats'"
        class="app-rating__dashboard-stats"
      >
        <template v-if="+reviewsCount">
          Based on {{ reviewsCount }}
          {{ reviewsCount === 1 ? "review" : "reviews" }}
        </template>
        <template v-else>No ratings yet</template>
      </div>

      <div v-else class="app-rating__reviews">
        <div class="app-rating__value">{{ reviewsCount }}</div>
        <span :style="`color: #${secondaryColor}`">Reviews</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/responsive.scss";

.app-rating {
  display: flex;
  align-items: center;

  &__rating {
    display: flex;
    align-items: center;
  }

  &__value {
    @include typography-main(14px, 700);
    color: currentColor;
    margin-right: 4px;
  }

  &__reviews {
    @include typography-main(14px);
    display: flex;
    align-items: center;
    margin-left: 8px;

    &::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 2px;
      background-color: $color-black-20;
      margin-right: 8px;
      opacity: 0.7;
    }
  }

  &__dashboard-stats {
    @include typography-main(14px);
    color: $color-black-60;
    border-bottom: 2px solid $color-blue-06;
    width: 100%;
    padding-bottom: 12px;
    margin: 2px 0 12px;
  }

  &:not(._is-reviews-count-visible) {
    .app-rating__reviews {
      display: none;
    }
  }

  &._is-strong-value {
    .app-rating__value {
      @include typography-main(16px, 700);
    }
  }

  &._is-company-page-grid {
    .app-rating__rating {
      flex-direction: row-reverse;

      .app-rating__value {
        margin: 0 0 0 4px;
      }
    }
  }
}

._is-company-page-card {
  .app-rating__rating {
    .app-rating__value {
      @include typography-main(14px, 700);
    }
  }
  .app-rating__reviews {
    .app-rating__value {
      @include typography-main(14px);
      color: $color-black-60;
    }
    .fixed-color {
      @include typography-main(14px);
    }
  }
}

._is-dashboard-stats {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-top: 14px;

  .app-rating__rating {
    min-height: 32px;

    .app-rating__value {
      @include typography-main(20px, 700);
      color: $color-blue;
    }

    &._no-have-value {
      .app-rating__value {
        display: none;
      }

      ._is-dashboard-stats {
        position: relative;
        left: -3px;
      }

      & ~ .app-rating__dashboard-stats {
        margin-top: 4px;
      }
    }
  }

  &.app-rating__dashboard-stats {
    margin-top: 4px;
  }
}

._is_dashboard-stats-review {
  .app-rating__rating {
    flex-direction: row-reverse;

    .app-rating__value {
      @include typography-main(12px, 700);
      color: $color-black;
      margin: 0 0 0 4px;
    }
  }
}

@include responsive-media((xs, sm)) {
  .app-rating._adaptive {
    flex-direction: column;

    .app-rating {
      &__rating {
        margin-bottom: 4px;
      }

      &__reviews {
        @include typography-main(10px);
        margin: 0;

        &::before {
          display: none;
        }
      }
    }
  }
}
</style>
