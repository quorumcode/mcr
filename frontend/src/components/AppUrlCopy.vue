<script lang="ts">
import { defineComponent, ref } from "vue";
import { useCommonStore } from "@/stores/common";
import { copyToClipboard } from "@/helpers/copyToClipboard";
import UiButton from "@/components/UiButton.vue";
import IconLink from "@/components/icons/IconLink.vue";
import IconChecked from "@/components/icons/IconChecked.vue";

export default defineComponent({
  components: { IconLink, UiButton, IconChecked },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const isRecentlyCopied = ref(false);
    const commonStore = useCommonStore();

    const copy = async () => {
      try {
        await copyToClipboard(props.url);
        commonStore.showNotification(
          "success",
          "Link has been copied successfully"
        );
      } catch (e) {
        console.error(e);
        return;
      }
      isRecentlyCopied.value = true;
      setTimeout(() => {
        isRecentlyCopied.value = false;
      }, 10000);
    };

    return { isRecentlyCopied, copy };
  },
});
</script>

<template>
  <div class="app-url-copy" :class="{ '_status-copied': isRecentlyCopied }">
    <UiButton
      class="app-url-copy__button"
      view="text"
      :icon-margin="8"
      :state="isRecentlyCopied ? 'success' : undefined"
      @click="copy"
    >
      <template #icon>
        <IconLink v-if="!isRecentlyCopied" />
        <IconChecked v-else />
      </template>
      <template v-if="isRecentlyCopied">Link successfully copied</template>
      <template v-else>Copy Link</template>
    </UiButton>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";

.app-url-copy {
  background-color: rgba(30, 43, 153, 0.06);
  border-radius: $rounding-medium;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  &__button {
    height: 100%;
    width: 100%;
  }

  &._status-copied {
    background-color: $color-white;
    border: 2px solid $color-green-10;
  }
}
._status-copied .app-url-copy__button {
  color: $color-green !important;
}
</style>
