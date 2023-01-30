<template>
  <div class="image">
    <img class="image__ref" src="@/assets/illustrations/image3.svg" alt="" />
    <img
      class="image__detail"
      src="@/assets/illustrations/image3-detail.svg"
      alt=""
    />
    <img
      class="image__detail2"
      src="@/assets/illustrations/image3-detail2.svg"
      alt=""
    />
    <img
      class="image__detail3"
      src="@/assets/illustrations/image3-detail3.svg"
      alt=""
    />
  </div>
</template>

<style lang="scss" scoped>
@keyframes detail {
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  50% {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
  }
}

@keyframes detail2 {
  from {
    transform: skewY(15deg) scaleX(1.1);
  }
  to {}
}

.image {
  display: inline-block;
  position: relative;
  user-select: none;
  -webkit-user-drag: none;

  &__detail {
    position: absolute;
    top: 23px;
    left: 0;
    animation: detail 1s;
  }

  &__detail2 {
    position: absolute;
    top: 0;
    right: 45px;
    transform-origin: right bottom 50px;
    animation: detail2 1s;
  }

  &__detail3 {
    position: absolute;
    bottom: 10px;
    right: 0;
  }
}
</style>
