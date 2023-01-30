<template>
  <div class="image">
    <img class="image__ref" src="@/assets/illustrations/image1.svg" alt="" />
    <img
      class="image__detail"
      src="@/assets/illustrations/image1-detail.svg"
      alt=""
    />
  </div>
</template>

<style lang="scss" scoped>
@keyframes detail {
  from {
    transform: rotate(45deg);
  }
  30% {
    transform: rotate(-20deg);
  }
  to {
  }
}

.image {
  display: inline-block;
  position: relative;
  user-select: none;
  -webkit-user-drag: none;

  &__detail {
    position: absolute;
    top: 135px;
    left: 55px;
    transform-origin: top center;
    animation: detail 2s;
  }
}
</style>
