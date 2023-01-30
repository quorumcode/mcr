<template>
  <div class="image">
    <img class="image__ref" src="@/assets/illustrations/image2.svg" alt="" />
    <img
      class="image__detail"
      src="@/assets/illustrations/image2-detail.svg"
      alt=""
    />
    <img
      class="image__detail2"
      src="@/assets/illustrations/image2-detail2.svg"
      alt=""
    />
  </div>
</template>

<style lang="scss" scoped>
@keyframes detail {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
  }
}

@keyframes detail2 {
  from {
    opacity: 0;
    transform: translateY(-100px) rotate(30deg);
  }
  50% {
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
    bottom: 0;
    right: 0;
    transform-origin: right bottom;
    animation: detail 0.5s;
  }

  &__detail2 {
    position: absolute;
    bottom: 60px;
    left: 15px;
    transform-origin: right bottom;
    animation: detail2 1s;
  }
}
</style>
