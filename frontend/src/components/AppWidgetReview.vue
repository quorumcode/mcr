<script lang="ts">
import { computed, defineComponent } from "vue";
import { RouteLocationRaw } from "vue-router";
import { routesNames } from "@/routesNames";
import { formatDate } from "@/helpers/formatDate";
import AppRating from "@/components/AppRating.vue";

export default defineComponent({
  components: { AppRating },
  props: {
    companyId: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    ratingValue: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      default: "",
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
  setup(props) {
    const formattedDate = computed(() => {
      return formatDate(props.date);
    });

    const route = computed(() => {
      return {
        name: routesNames.companyProfile,
        params: { id: props.companyId },
        hash: `#${props.id}`,
        query: { fromWidget: "true" },
      } as RouteLocationRaw;
    });

    return { formattedDate, route };
  },
});
</script>

<template>
  <RouterLink
    :to="route"
    class="app-widget-review"
    :class="{
      'test-white-gb':
        cardBackgroud === 'white' && backgroudColor.toUpperCase() === 'FFFFFF',
    }"
    target="_blank"
  >
    <AppRating
      class="app-widget-review__rating"
      :value="ratingValue"
      :is-reviews-count-visible="false"
      :adaptive="false"
    />
    <div class="app-widget-review__name">{{ userName }}</div>
    <p
      class="app-widget-review__message"
      :class="`app-widget-review__message-${cardBackgroud}`"
    >
      {{ message }}
    </p>
    <div
      class="app-widget-review__date"
      :class="`app-widget-review__date-${cardBackgroud}`"
    >
      {{ formattedDate }}
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/typography.scss";

.app-widget-review {
  display: flex;
  flex-direction: column;
  background-color: $color-blue-05;
  border-radius: $rounding-large;
  padding: 12px;
  box-sizing: border-box;
  color: currentColor;
  text-decoration: none;

  &__rating {
    flex-shrink: 0;
    flex-grow: 0;
    margin-bottom: 12px;
  }

  &__name {
    @include typography-main(14px, 600);
    flex-shrink: 0;
    flex-grow: 0;
  }

  &__message {
    @include typography-main(12px);
    position: relative;
    margin: 0;
    margin-bottom: 8px;
    opacity: 0.6;
    flex-shrink: 1;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    @include typography-main(12px);
    opacity: 0.6;
    flex-shrink: 0;
    flex-grow: 0;

    &-white {
      color: $color-black;
    }

    &-black {
      color: $color-white;
    }

    &-transparent {
      color: $color-white;
    }
  }

  &.test-white-gb {
    background-color: $color-blue-05;
  }
}

.app-widget-review__message {
  &-white {
    color: $color-black;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      background: linear-gradient(rgba($color-blue-05, 0), $color-blue-05);
    }
  }

  &-black {
    color: $color-white;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      background: linear-gradient(#1616160d, #1a1a1a96);
    }
  }

  &-transparent {
    color: $color-white;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      background: linear-gradient(rgba(244, 244, 250, 0), #ffffff14);
      // background: linear-gradient(#f4f4fa00, rgb(244 244 250 / 20%));
      // background: linear-gradient(rgba($color-blue-05, 0), $color-blue-05);
    }
  }
}
</style>
