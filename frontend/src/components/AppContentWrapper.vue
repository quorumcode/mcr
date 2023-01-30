<template>
  <div class="ui-content-wrapper">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/component.scss";

.ui-content-wrapper {
  @include component-content-wrapper;
}
</style>
