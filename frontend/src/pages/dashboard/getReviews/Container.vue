<script lang="ts">
import { defineComponent } from "vue";
import AppInviteClients from "@/containers/inviteClients/AppInviteClients.vue";

export default defineComponent({
  components: {
    AppInviteClients,
  },
});
</script>

<template>
  <div class="page">
    <h1 class="page__title">Get Reviews</h1>
    <AppInviteClients class="page__content" />
    <button class="page__help">?</button>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";

.page {
  margin: 0 auto;
  max-width: 1128px;

  &__title {
    @include typography-header(32px, 700);
    color: $color-blue;
    margin: 40px 0 36px;
  }

  &__content {
    margin-bottom: 60px;
  }

  &__help {
    @include shadow-large;
    @include typography-main(32px, 700);
    color: $color-blue;
    width: 60px;
    height: 60px;
    background-color: $color-white;
    border-radius: $rounding-circle;
    margin-bottom: 60px;
    border: none;
  }
}
</style>
