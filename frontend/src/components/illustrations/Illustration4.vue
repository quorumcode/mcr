<template>
  <div class="image">
    <img class="image__ref" src="@/assets/illustrations/image4.svg" alt="" />
    <img
      class="image__detail"
      src="@/assets/illustrations/image4-detail.svg"
      alt=""
    />
  </div>
</template>

<style lang="scss" scoped>
@keyframes detail {
  from {
    opacity: 0;
    transform: translateY(-100px) rotate(30deg);
  }
  to {
    opacity: 1;
  }
}

.image {
  display: inline-block;
  position: relative;
  user-select: none;
  -webkit-user-drag: none;

  &__detail {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: right bottom;
    animation: detail 1s;
  }
}
</style>
