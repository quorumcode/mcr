<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import format from "date-fns/format";
import AppCreditCardIcon from "./AppCreditCardIcon.vue";
import { CardType } from "@/types/commonTypes";

export default defineComponent({
  components: { AppCreditCardIcon },
  props: {
    type: {
      type: String as PropType<CardType>,
    },
    lastDigits: {
      type: String,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
  },
  setup(props) {
    const formattedDate = computed(() => {
      if (!props.year || !props.month) {
        return "";
      }
      const date = new Date(props.year, props.month - 1);
      return format(date, "MM / yy");
    });

    return { formattedDate };
  },
});
</script>

<template>
  <div class="app-credit-card">
    <div class="app-credit-card__container">
      <div class="app-credit-card__card card">
        <div class="card__name">{{ type }}</div>
        <div class="card__number">
          <span class="blur">•••• •••• ••••</span> {{ lastDigits }}
        </div>
        <div class="card__bottom">
          <div class="card__date">{{ formattedDate }}</div>
          <div class="card__icon-container">
            <AppCreditCardIcon class="card__icon" :type="type" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.app-credit-card {
  padding-right: 12px;
  padding-bottom: 12px;

  &__container {
    position: relative;
    padding-bottom: 50%;
  }

  &__card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $color-blue-06;
    border-radius: $rounding-medium;
  }
}

.card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  background-color: $color-blue-06;
  border-radius: $rounding-medium;
  box-shadow: 12px 12px 0 $color-blue-20;

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name,
  &__date,
  &__icon {
    color: $color-blue-40;
  }

  &__number {
    @include typography-main(24px, 600);
    text-align: center;
    margin-top: auto;
    margin-bottom: auto;
  }

  &__icon-container {
    line-height: 0;
  }
}

.blur {
  filter: blur(6px);
}
</style>
