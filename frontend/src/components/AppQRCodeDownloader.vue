<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useCommonStore } from "@/stores/common";
import QRCode from "qrcode";
import UiButton from "@/components/UiButton.vue";
import IconDownload from "@/components/icons/IconDownload.vue";
import IconChecked from "@/components/icons/IconChecked.vue";

export default defineComponent({
  components: {
    IconDownload,
    UiButton,
    IconChecked,
  },
  props: {
    encodingValue: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const commonStore = useCommonStore();
    const dataUrl = ref("");
    const isRecentlyDownloaded = ref(false);

    onMounted(async () => {
      try {
        dataUrl.value = await QRCode.toDataURL(props.encodingValue, {
          width: 240,
          margin: 1,
        });
      } catch (e) {
        console.error(e);
      }
    });

    const download = () => {
      const link = document.createElement("a");
      link.download = "qr-code.png";
      link.href = dataUrl.value;
      link.click();
      setTimeout(() => {
        commonStore.showNotification("success", "QR Code has been downloaded.");
        isRecentlyDownloaded.value = true;
      }, 3000);
    };

    return { dataUrl, isRecentlyDownloaded, download };
  },
});
</script>

<template>
  <div
    class="qr-code"
    :class="{
      'qr-code-compact': type === 'compact',
      '_status-downloaded': isRecentlyDownloaded,
    }"
  >
    <div class="container">
      <div class="container__qr">
        <img v-if="dataUrl" :src="dataUrl" :alt="description" />
      </div>
      <div class="container__content content">
        <div v-if="description" class="content__description">
          {{ description }}
        </div>
        <UiButton
          class="content__button"
          :class="{
            'content__button-download': !isRecentlyDownloaded,
            'content__button-downloaded': isRecentlyDownloaded,
          }"
          view="control"
          :state="isRecentlyDownloaded ? 'success' : undefined"
          @click="download"
        >
          <template #icon>
            <IconDownload v-if="!isRecentlyDownloaded" />
            <IconChecked v-else />
          </template>
          <template v-if="!isRecentlyDownloaded">Download</template>
          <template v-else>Downloaded</template>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";

.qr-code {
  padding: 24px;
  max-width: 420px;
  background-color: $color-blue-06;
  border-radius: $rounding-medium;
}

.container {
  display: flex;
  flex-wrap: nowrap;

  &__qr {
    margin-right: 12px;
    flex-shrink: 0;
    flex-grow: 0;
    width: 100px;
    height: 100px;

    & > img {
      image-rendering: pixelated;
      width: 100% !important;
      height: 100% !important;
    }
  }

  &__content {
    flex-shrink: 1;
    flex-grow: 1;
  }
}

.content {
  &__description {
    @include typography-main(12px, 600);
    color: $color-blue;
    margin-bottom: 8px;
  }

  &__button {
    @include typography-main(16px, 600);
    width: 100%;
    height: 100%;

    &-download {
      background-color: #e4e6f3 !important;
      color: $color-blue !important;
    }

    &-downloaded {
      color: $color-green !important;
      background-color: $color-white !important;
    }

    &-checked {
      color: $color-green !important;
    }
  }
}

.qr-code-compact {
  padding: 12px;
  max-width: 360px;
  background-color: rgba(30, 43, 153, 0.06);

  &._status-downloaded {
    background-color: $color-white;
  }

  .container {
    &__qr {
      width: 68px;
      height: 68px;
    }
  }

  .content {
    &__button {
      height: auto;

      &-download {
        background-color: $color-blue !important;
        color: $color-white !important;
      }

      &-downloaded {
        border: 2px solid $color-green-10;
        padding: 6px 16px;
      }
    }
  }
}
</style>
