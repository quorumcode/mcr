<script lang="ts">
import { defineComponent, computed, toRefs, ref } from "vue";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { useWidgetEditorPageStore } from "./store";
import { copyToClipboard } from "@/helpers/copyToClipboard";
import { WidgetType } from "@/types/commonTypes";
import AppCompanyProfileLayout from "@/containers/AppCompanyProfileLayout.vue";
import AppWidget from "@/components/AppWidget.vue";
import AppWidgetInvite from "@/components/AppWidgetInvite.vue";
import AppWidgetAddReview from "@/components/AppWidgetAddReview.vue";
import AppWidgetTypePickerNew from "@/components/AppWidgetTypePickerNew.vue";
import AppWidgetCardBackgroundNew from "@/components/AppWidgetCardBackgroundNew.vue";
import AppCheckoutWidgetTypePicker from "@/components/AppCheckoutWidgetTypePicker.vue";
import UiColorPicker from "@/components/UiColorPicker.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiButton from "@/components/UiButton.vue";
import IconCopy from "@/components/icons/IconCopy.vue";
import IconCheck from "@/components/icons/IconCheck.vue";

export default defineComponent({
  components: {
    AppCompanyProfileLayout,
    AppWidget,
    AppWidgetInvite,
    AppWidgetAddReview,
    AppWidgetTypePickerNew,
    AppWidgetCardBackgroundNew,
    AppCheckoutWidgetTypePicker,
    UiColorPicker,
    UiTextInput,
    UiButton,
    IconCopy,
    IconCheck,
  },
  emits: {
    "update:modelValue": (value: WidgetType) => value,
  },
  async setup() {
    const userStore = useUserStore();
    const store = useWidgetEditorPageStore();
    const commonStore = useCommonStore();
    const code = computed(() => store.code);

    const {
      widgetType,
      cardBackgroud,
      color,
      secondaryColor,
      backgroudColor,
      width,
      height,
    } = toRefs(store.widgetConfig);

    const isEnableHightAnimation = ref(false);
    const isEnableCardAnimation = ref(false);

    const currentWidgetBlock = ref("rating");
    const changeRadioBlock = (type: string) => {
      if (type === currentWidgetBlock.value) {
        return;
      }

      if (type === "checkout") {
        height.value = 360;
        store.changeWidgetType(WidgetType.invite);
        currentWidgetBlock.value = "checkout";
        setTimeout(() => (isEnableHightAnimation.value = false), 400);
      } else {
        setTimeout(() => (isEnableHightAnimation.value = true), 100);
        isEnableCardAnimation.value = true;
        height.value = 317;
        store.changeWidgetType(WidgetType.compact);
        currentWidgetBlock.value = "rating";
      }
    };

    const companyId = computed(() => userStore.info?.company?._id);
    const companyName = computed(() => userStore.info?.company?.name);
    const reviewToken = computed(() => userStore.info?.company?.reviewToken);

    const colorPresets = computed(() => store.colorPresets);
    const secondaryColorPresets = computed(() => store.secondaryColorPresets);
    const backgroundColorPresets = computed(() => store.backgroundColorPresets);

    const selectPresetColor = (value: string) => {
      color.value = value;
    };
    const selectPresetSecondaryColor = (value: string) => {
      secondaryColor.value = value;
    };
    const selectPresetBackgroudColor = (value: string) => {
      backgroudColor.value = value;
    };

    const data = computed(() => store.data);
    const filteredData = computed(() => {
      if (widgetType.value === WidgetType.lastReview) {
        return {
          ...data.value,
          reviews: data.value?.reviews.slice(0, 3) || [],
        };
      }
      return data.value;
    });

    const isCodeRecentlyCopied = ref(false);
    const copyCode = async () => {
      try {
        await copyToClipboard(code.value);
        commonStore.showNotification(
          "success",
          "The code was copied successfully."
        );
        isCodeRecentlyCopied.value = true;
        setTimeout(() => {
          isCodeRecentlyCopied.value = false;
        }, 3000);
      } catch (e) {
        commonStore.showNotification("error", "Code not copied");
      }
    };

    await store.init(
      companyId.value,
      userStore.info?.company?.widgetConfig,
      reviewToken
    );

    const loadMore = async () => {
      store.fetchMoreReviews();
    };

    const isShowSecondaryColour = computed(() => {
      if (currentWidgetBlock.value === "rating") {
        return true;
      } else if (
        !(widgetType.value === "carousel" || widgetType.value === "lastReview")
      ) {
        return false;
      }
      return true;
    });

    return {
      companyId,

      currentWidgetBlock,
      changeRadioBlock,
      widgetType,
      cardBackgroud,
      setDefaultHeight: store.setWidgetHeight,
      isEnableHightAnimation,
      isEnableCardAnimation,

      backgroudColor,
      color,
      secondaryColor,
      backgroundColorPresets,
      colorPresets,
      secondaryColorPresets,
      selectPresetColor,
      selectPresetSecondaryColor,
      selectPresetBackgroudColor,
      isShowSecondaryColour,
      width,
      height,

      filteredData,

      companyName,

      isCodeRecentlyCopied,
      copyCode,
      code,
      save: store.saveWidgetConfig,
      isLoading: commonStore.isLoading,
      isMoreReviewsLoading: computed(() => store.isMoreReviewsLoading),
      loadMore,
    };
  },
});
</script>

<template>
  <AppCompanyProfileLayout :company-id="companyId" body-size-class="_medium">
    <template v-slot:title>Edit Review Widgets</template>
    <div class="widget">
      <aside class="widget__sidebar">
        <div
          class="widget__sidebar-section sidebar-radio raiting"
          :class="{
            _active: currentWidgetBlock === 'rating',
            '_show-bg-cards':
              currentWidgetBlock === 'rating' &&
              !(widgetType === 'compact' || widgetType === 'rating'),
            '_is-enable-animation': isEnableHightAnimation,
          }"
        >
          <label
            @click="changeRadioBlock('rating')"
            class="sidebar-radio__btn"
            tabindex="0"
            @keydown.space.prevent="changeRadioBlock('rating')"
          >
            <div class="sidebar-radio__btn-img" />
            <span class="sidebar-radio__btn-label">Rating Widget</span>
          </label>
          <template v-if="currentWidgetBlock === 'rating'">
            <AppWidgetTypePickerNew
              v-model="widgetType"
              :is-enable-animation="isEnableCardAnimation"
              class="sidebar-radio__picker"
            />
            <template
              v-if="!(widgetType === 'compact' || widgetType === 'rating')"
            >
              <div class="sidebar-radio__btn-label">Review Card Background</div>
              <AppWidgetCardBackgroundNew
                v-model="cardBackgroud"
                class="sidebar-radio__card-bg"
              />
            </template>
          </template>
        </div>

        <div
          class="widget__sidebar-section sidebar-radio checkout"
          :class="{ _active: currentWidgetBlock === 'checkout' }"
        >
          <label
            @click="changeRadioBlock('checkout')"
            class="sidebar-radio__btn"
            tabindex="0"
            @keydown.space.prevent="changeRadioBlock('checkout')"
          >
            <div class="sidebar-radio__btn-img" />
            <span class="sidebar-radio__btn-label">Checkout Widget</span>
          </label>
          <template v-if="currentWidgetBlock === 'checkout'">
            <AppCheckoutWidgetTypePicker
              v-model="widgetType"
              class="sidebar-radio__picker"
              @set-default-height="setDefaultHeight"
            />
          </template>
        </div>

        <div class="widget__sidebar-section color">
          <div class="color__title">Background Colour</div>
          <div class="color__presets">
            <div
              v-for="preset in backgroundColorPresets"
              :key="`bg-${preset}`"
              class="color__presets-item"
              :class="{
                '_is-active': preset === backgroudColor,
                '_is-transparent': preset === 'transparent',
              }"
              :style="`color: #${preset}`"
              @click="selectPresetBackgroudColor(preset)"
            >
              <div v-if="preset === 'transparent'" class="preset-transparent">
                <div class="preset-transparent__border" />
                <div class="preset-transparent__top" />
                <div class="preset-transparent__bot" />
              </div>
            </div>
          </div>
          <label class="color__field field">
            <span class="field__label">Hex:</span>
            <UiColorPicker size="small" v-model="backgroudColor" />
          </label>
        </div>

        <div class="widget__sidebar-section color">
          <div class="color__title">Text Colour</div>
          <div class="color__presets">
            <div
              v-for="preset in colorPresets"
              :key="`text-${preset}`"
              class="color__presets-item"
              :class="{ '_is-active': preset === color }"
              :style="`color: #${preset}`"
              @click="selectPresetColor(preset)"
            />
          </div>
          <label class="color__field field">
            <span class="field__label">Hex:</span>
            <UiColorPicker size="small" v-model="color" />
          </label>
        </div>

        <div v-if="isShowSecondaryColour" class="widget__sidebar-section color">
          <div class="color__title">Text Secondary Colour</div>
          <div class="color__presets">
            <div
              v-for="preset in secondaryColorPresets"
              :key="`text-${preset}`"
              class="color__presets-item"
              :class="{ '_is-active': preset === secondaryColor }"
              :style="`color: #${preset}`"
              @click="selectPresetSecondaryColor(preset)"
            />
          </div>
          <label class="color__field field">
            <span class="field__label">Hex:</span>
            <UiColorPicker size="small" v-model="secondaryColor" />
          </label>
        </div>

        <div class="widget__sidebar-section size">
          <div class="size__title">Widget Size</div>
          <div class="size__fields">
            <label class="size__field field">
              <span class="field__label">W:</span>
              <UiTextInput size="small" v-model="width" />
            </label>
            <label class="size__field field">
              <span class="field__label">H:</span>
              <UiTextInput
                size="small"
                :isDisabled="widgetType === 'addReview'"
                v-model="height"
              />
            </label>
          </div>
        </div>
      </aside>

      <main class="main">
        <template v-if="currentWidgetBlock === 'rating'">
          <section class="main__preview preview">
            <div
              class="preview__inner"
              :class="{ 'preview__inner-compact': widgetType === 'compact' }"
              :style="{ width: `${width}px`, height: `${height}px` }"
            >
              <AppWidget
                v-if="filteredData"
                :is-mobile="width <= 768"
                :type="widgetType"
                :card-backgroud="cardBackgroud"
                :color="color"
                :secondary-color="secondaryColor"
                :backgroud-color="backgroudColor"
                :data="filteredData"
                :is-more-reviews-loading="isMoreReviewsLoading"
                @load-more="loadMore"
              />
            </div>
          </section>
        </template>

        <template v-if="currentWidgetBlock === 'checkout'">
          <section class="main__preview preview">
            <div
              class="preview__inner"
              :style="{ width: `${width}px`, height: `${height}px` }"
            >
              <AppWidgetInvite
                v-if="widgetType === 'invite'"
                :company-name="companyName"
                :is-mobile="width <= 768"
                :card-backgroud="cardBackgroud"
                :color="color"
                :backgroud-color="backgroudColor"
                :is-editor-mode="true"
              />
              <AppWidgetAddReview
                v-else-if="widgetType === 'addReview'"
                :widget-width="+width"
                :company-name="companyName"
                :is-mobile="width <= 768"
                :color="color"
                :backgroud-color="backgroudColor"
                :is-editor-mode="true"
              />
            </div>
          </section>
        </template>

        <section class="main__code code">
          <h3 class="code__title">Integrate Widget into Your Website</h3>
          <p class="code__description">
            Copy and paste the following source code into your page.
          </p>
          <div class="code__output code-output">
            <div
              class="code-output__code"
              :class="{ '_is-copied': isCodeRecentlyCopied }"
            >
              {{ code }}
            </div>
            <UiButton
              class="code-output__copy"
              view="control-secondary"
              :state="isCodeRecentlyCopied ? 'success' : undefined"
              @click="copyCode"
            >
              <template #icon>
                <IconCheck v-if="isCodeRecentlyCopied" />
                <IconCopy v-else />
              </template>
            </UiButton>
          </div>
        </section>

        <div class="main__buttons">
          <UiButton class="main__button" @click="save" :is-disabled="isLoading">
            Save
          </UiButton>
        </div>
      </main>
    </div>
  </AppCompanyProfileLayout>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";
@import "@/styles/shadow.scss";
@import "@/styles/animation.scss";

.widget {
  display: flex;

  &__sidebar {
    @include shadow-x-large;
    background-color: $color-white;
    border-radius: $rounding-large;
    min-width: 264px;
    max-width: 264px;
    padding: 24px 24px;
    box-sizing: border-box;

    &-section {
      margin-top: 24px;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}

.sidebar-radio {
  padding: 0;
  border: 2px solid transparent;
  box-sizing: border-box;
  position: relative;

  &__picker {
    margin-top: 35px;
  }

  &__card-bg {
    margin-top: 6px;
  }

  &__btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    position: absolute;
    left: 0px;

    &-label {
      @include typography-main(14px, 600);
      color: $color-blue;
      margin: 0;

      &:not(:last-child) {
        margin-top: 12px;
      }
    }

    &-img {
      border: 2px solid $color-blue-40;
      background-color: $color-white;
      border-radius: $rounding-medium;
      width: 14px;
      height: 14px;
      margin: 2px 7px 3px 3px;
    }
  }

  &.raiting {
    height: 23px;

    &._is-enable-animation {
      transition: height 0.4s ease;
    }

    &._active {
      height: 231px;
      transition: height 0.4s ease;
    }
  }

  &.checkout {
    height: 23px;

    &._active {
      height: 127px;
      transition: height 0.3s ease;
    }
  }

  &._active {
    padding: 12px;
    border: 2px solid $color-blue-40;
    border-radius: $rounding-medium;
    background-color: $color-blue-06;

    &._show-bg-cards.raiting {
      height: 325px;
      transition: height 0.1s ease;
    }

    .sidebar-radio__btn {
      left: 12px;
      transition: left 0.3s ease-out;

      &-img {
        &:after {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: $rounding-medium;
          background-color: $color-blue;
          display: block;
          margin: 2px;
        }
      }
    }
  }
}

.color {
  &__title {
    @include typography-main(14px, 600);
    color: $color-blue;
    margin: 0;
  }

  &__presets {
    margin: 12px 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-item {
      width: 24px;
      height: 24px;
      background-color: currentColor;
      border: 2px solid rgba($color-black, 0.2);
      box-sizing: border-box;
      cursor: pointer;
      border-radius: $rounding-circle;
      background-clip: border-box;

      &._is-active {
        @include shadow-small;
        border-color: $color-blue;

        .preset-transparent__border {
          border-color: $color-blue;
        }
      }

      &._is-transparent {
        border: none;
      }
    }
  }
}

.size {
  margin-top: 24px;

  &__title {
    @include typography-main(14px, 600);
    color: $color-blue;
    margin: 0;
  }

  &__fields {
    margin-top: 12px;
    display: flex;
    align-items: center;
  }

  &__field {
    &:not(:last-child) {
      margin-right: 12px;
    }
  }
}

.preset-transparent {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  background-color: #fff;

  &__border {
    border: 2px solid rgba(30, 43, 153, 0.1);
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 12px;
    z-index: 2;
  }

  &__top {
    background-color: #c4c4c4;
    width: 50%;
    height: 50%;
    z-index: 1;
  }

  &__bot {
    background-color: #c4c4c4;
    width: 50%;
    height: 50%;
    right: 0;
    bottom: 0;
    position: absolute;
    z-index: 1;
  }
}

.field {
  display: flex;
  align-items: center;

  &__label {
    @include typography-main(12px);
    color: $color-blue;
    margin-right: 4px;
  }
}

.main {
  margin-left: 24px;
  width: auto;

  &__code {
    margin-bottom: 40px;
  }

  &__buttons {
    text-align: right;
  }

  &__button {
    min-width: 168px;
  }
}

.preview {
  position: relative;

  &__inner {
    position: relative;
    margin: 0 auto;
    overflow: hidden;
  }

  &__inner-compact {
    display: flex;
    align-items: center;
  }
}

.code {
  margin-top: 24px;

  &__title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 0;
  }

  &__description {
    @include typography-main(12px);
    margin: 0;
    margin-bottom: 12px;
  }
}

.code-output {
  position: relative;

  &__code {
    @include typography-main(14px);
    line-height: 24px;
    background-color: rgba($color-black, 0.06);

    padding: 14px 12px;
    padding-right: 60px;
    min-height: 68px;
    box-sizing: border-box;
    color: $color-blue-60;
    border-radius: $rounding-medium;
    word-break: break-all;

    &._is-copied {
      background-color: rgba($color-green, 0.06);
    }
  }

  &__copy {
    position: absolute;
    top: 14px;
    right: 12px;
  }
}
</style>
