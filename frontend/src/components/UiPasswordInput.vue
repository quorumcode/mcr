<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import UiTextInput from "@/components/UiTextInput.vue";
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeCrossed from "@/components/icons/IconEyeCrossed.vue";
import UiLink from "@/components/UiLink.vue";

export default defineComponent({
  inheritAttrs: false,
  components: {
    UiLink,
    IconEye,
    IconEyeCrossed,
    UiTextInput,
  },
  props: {},
  setup() {
    const isPasswordVisible = ref(false);
    let isTouched = false;
    const showPassword = () => {
      isPasswordVisible.value = true;
    };
    const hidePassword = () => {
      if (!isTouched) {
        isPasswordVisible.value = false;
      }
    };
    const doTouch = () => {
      isTouched = !isTouched;
    };

    onMounted(() => {
      document.addEventListener("mouseup", hidePassword);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("mouseup", hidePassword);
    });

    return {
      isPasswordVisible,
      showPassword,
      hidePassword,
      doTouch,
    };
  },
});
</script>

<template>
  <UiTextInput v-bind="$attrs" :type="isPasswordVisible ? 'text' : 'password'">
    <template v-slot:suffix>
      <UiLink
        class="eye"
        @mousedown="showPassword"
        @mouseup="hidePassword"
        @touchstart="doTouch"
        tabindex="-1"
      >
        <IconEyeCrossed v-if="isPasswordVisible" />
        <IconEye v-else />
      </UiLink>
    </template>
  </UiTextInput>
</template>

<style lang="scss" scoped>
.eye {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
