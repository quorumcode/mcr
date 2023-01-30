<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: Number,
      required: true,
    },
    suffix: {
      type: String,
      default: "",
    },
  },
});
</script>

<template>
  <article class="admin-value">
    <h3 v-if="title" class="admin-value__title">{{ title }}</h3>
    <div class="admin-value__value content">
      <div class="content__value">{{ value }}</div>
      <div v-if="suffix" class="content__suffix">{{ suffix }}</div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.admin-value {
  &__title {
    @include typography-main(16px, 700);
    margin: 0;
    color: $color-blue;
  }
}

.content {
  display: flex;
  align-items: baseline;

  &__value {
    @include typography-main(40px, 700);
    margin: 0;
    color: $color-blue;
  }

  &__suffix {
    @include typography-main(16px);
    color: $color-blue-40;
    margin-left: 12px;
  }
}
</style>
