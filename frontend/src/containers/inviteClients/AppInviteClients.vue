<script lang="ts">
import { computed, defineComponent } from "vue";
import { useInviteClientsStore } from "@/containers/inviteClients/store";
import { ReviewTemplateTabName } from "@/types/commonTypes";
import UiRadioButtonsInput from "@/components/UiRadioButtonsInput.vue";
import AppReviewsTabUploadCsv from "@/components/AppReviewsTabUploadCsv.vue";
import AppReviewsTabQrCode from "@/components/AppReviewsTabQrCode.vue";
import AppReviewsTabBcc from "@/components/AppReviewsTabBcc.vue";
import AppReviewsTabUrl from "@/components/AppReviewsTabUrl.vue";

const tabsTemplatesTitlesMap: Record<ReviewTemplateTabName, string> = {
  [ReviewTemplateTabName.uploadCsvFile]: "Upload CSV file",
  [ReviewTemplateTabName.byQrCode]: "by QR Code",
  [ReviewTemplateTabName.byBcc]: "by BCC",
  [ReviewTemplateTabName.byUrl]: "by URL",
};

export default defineComponent({
  components: {
    UiRadioButtonsInput,
    AppReviewsTabUploadCsv,
    AppReviewsTabQrCode,
    AppReviewsTabBcc,
    AppReviewsTabUrl,
  },
  async setup() {
    const store = useInviteClientsStore();

    const tabsItems = computed(() => {
      return Object.entries(tabsTemplatesTitlesMap).map((name) => ({
        value: name[0],
        title: name[1],
      }));
    });

    return {
      selectedTab: computed(() => store.selectedTab),
      selectTab: store.selectTab,
      tabsItems,
    };
  },
});
</script>

<template>
  <div>
    <UiRadioButtonsInput
      :model-value="selectedTab"
      :items="tabsItems"
      @update:modelValue="selectTab"
      @click="$emit('clickOnButtons')"
    />
    <div class="tab-content">
      <AppReviewsTabUploadCsv v-if="selectedTab === 'uploadCsvFile'" />
      <AppReviewsTabQrCode v-if="selectedTab === 'byQrCode'" />
      <AppReviewsTabBcc v-if="selectedTab === 'byBcc'" />
      <AppReviewsTabUrl v-if="selectedTab === 'byUrl'" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";

.tab-content {
  background-color: $color-white;
  padding: 40px;
  box-shadow: 12px 12px 24px rgb(30 43 153 / 10%);
  border-radius: 0px 20px 20px 20px;
}

:deep(.tab__item) {
  margin-right: 10px;
}
</style>
