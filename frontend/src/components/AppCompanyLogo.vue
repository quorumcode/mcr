<script lang="ts">
import { defineComponent, PropType } from "vue";
import IconPicture from "@/components/icons/IconPicture.vue";

export default defineComponent({
  components: { IconPicture },
  props: {
    size: {
      type: Number,
      default: undefined,
    },
    rounding: {
      type: String as PropType<"medium" | "large">,
      default: "medium",
    },
    url: {
      type: String,
      default: "",
    },
  },
});
</script>

<template>
  <div
    class="app-company-logo"
    :class="`_rounding-${rounding}`"
    :style="size && `width: ${size}px; height: ${size}px;`"
  >
    <img v-if="url" :src="url" alt="" />
    <div v-else class="app-company-logo__stub">
      <IconPicture />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";

.app-company-logo {
  display: inline-block;
  line-height: 0;
  height: 56px; // default css rewritable size
  width: 56px;
  overflow: hidden;
  border: 1px solid rgba($color-blue, 0.1);

  & > img {
    max-width: 100%;
    max-height: 100%;
  }

  &__stub {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    background-color: rgba($color-blue, 0.06);
    color: $color-blue-60;
  }

  &._rounding-medium {
    border-radius: $rounding-medium;
  }

  &._rounding-large {
    border-radius: $rounding-large;
  }
}
</style>
