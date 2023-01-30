<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<template>
  <div class="app-card">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/component.scss";

.app-card {
  @include component-card;
  cursor: pointer;
}
</style>
