<script lang="ts">
import { computed, defineComponent, ref, toRef } from "vue";
import { useCommonStore } from "@/stores/common";
import { useInviteClientsStore } from "@/containers/inviteClients/store";
import { useEmailTemplatesFormStore } from "@/containers/emailTemplatesForm/store";
import AppEmailTemplatesForm from "@/containers/emailTemplatesForm/AppEmailTemplatesForm.vue";
import AppLoadingSpinner from "@/components/AppLoadingSpinner.vue";
import UiFileUpload from "@/components/UiFileUpload.vue";
import UiButton from "@/components/UiButton.vue";
import UiCheckbox from "@/components/UiCheckbox.vue";
import UiModal from "@/components/UiModal.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconCheckboxChecked from "@/components/icons/IconCheckboxChecked.vue";
import IconCheckboxUnchecked from "@/components/icons/IconCheckboxUnchecked.vue";
import IconPen from "@/components/icons/IconPen.vue";

export default defineComponent({
  components: {
    AppEmailTemplatesForm,
    AppLoadingSpinner,
    UiFileUpload,
    UiButton,
    UiCheckbox,
    UiModal,
    IconArrowRight,
    IconCheckboxChecked,
    IconCheckboxUnchecked,
    IconPen,
  },
  async setup() {
    const commonStore = useCommonStore();
    const storeClient = useInviteClientsStore();
    const storeEmailTemplates = useEmailTemplatesFormStore();
    const templatesFormRef = ref<InstanceType<typeof AppEmailTemplatesForm>>();
    const templates = toRef(storeEmailTemplates, "templates");

    const clients = computed(() => storeClient.clients);
    const hasClients = computed(() => !!clients.value.length);
    const totalClients = computed(() => storeClient.totalClients);
    const selectedClientsIds = computed(() => storeClient.selectedClientsIds);
    const hasMoreClients = computed(() => {
      return totalClients.value > clients.value.length;
    });

    const isClientsLoading = computed(() => storeClient.isClientsLoading);
    const isInviteModalDisabled = computed(() => commonStore.isLoading);
    const isClientsDisabled = computed(
      () => isInviteModalDisabled.value || isClientsLoading.value
    );

    const loadMoreClients = () => {
      storeClient.fetchClients(true);
    };

    const isModalEditFormVisible = ref(false);
    const handleModalTemplateClick = () => {
      isModalEditFormVisible.value = true;
    };

    const openInviteModal = () => {
      storeClient.openInviteModal();
    };

    const closeInviteEditTextModal = () => {
      storeClient.closeInviteEditTextModal();
    };

    const submitTemplateForm = async () => {
      await templatesFormRef.value?.submitForm();
    };

    const saveTemplates = async () => {
      commonStore.startLoading();
      try {
        if (await storeEmailTemplates.saveTemplates()) {
          commonStore.showNotification("success", "Successfully saved");
          closeInviteEditTextModal();
        }
      } catch (e) {
        commonStore.showNotification("error", e.message);
      } finally {
        commonStore.stopLoading();
      }
    };

    const invite = async () => {
      await templatesFormRef.value?.saveTemplates();
      await storeClient.invite();
    };

    await storeEmailTemplates.fetchTemplates();
    await storeEmailTemplates.fetchHtmlTemplates();

    const formatHtmlText = (html: string) => {
      const startTemplateText = "</h1>";
      const endTemplateText = "</p>";
      const startTemplateTextIndex = html.indexOf(startTemplateText);
      const endTemplateTextIndex = html.indexOf(
        endTemplateText,
        startTemplateTextIndex
      );
      const templatePart = html.slice(
        startTemplateTextIndex + 5,
        endTemplateTextIndex + 4
      );
      return html.replace(
        templatePart,
        `<p style="white-space: break-spaces">${templates.value.invitation}</p>`
      );
    };

    return {
      clients,
      selectedClientsIds,
      hasClients,
      loadMoreClients,
      hasMoreClients,
      isClientsDisabled,
      uploadCsv: storeClient.uploadCsv,
      handleSelectAllClients: storeClient.handleSelectAllClients,
      isAllClientsSelected: computed(() => storeClient.isAllClientsSelected),
      openInviteModal,
      isInviteModalOpened: computed(() => storeClient.isInviteModalOpened),
      closeInviteModal: storeClient.closeInviteModal,
      openInviteEditTextModal: storeClient.openInviteEditTextModal,
      isClientsLoading,

      isInviteEditTextModalOpened: computed(
        () => storeClient.isInviteEditTextModalOpened
      ),
      closeInviteEditTextModal: storeClient.closeInviteEditTextModal,
      selectedTemplate: computed(() => storeClient.selectedTemplate),
      templatesFormRef,
      invite,
      selectTemplate: storeClient.selectTemplate,
      handleModalTemplateClick,
      hasSelectedClients: computed(() => storeClient.hasSelectedClients),
      submitTemplateForm,
      saveTemplates,
      templates,
      companyLogoUrl: computed(() => storeEmailTemplates.companyLogoUrl),
      htmlTemplate: computed(() => storeEmailTemplates.htmlTemplate),
      formatHtmlText,
    };
  },
});
</script>

<template>
  <div>
    <div class="clients-header">
      <div class="clients-header__text">
        <h4 class="clients-header__title">Invite Clients</h4>
        <p class="clients-header__description">
          Import CSV file with client name and email address in the first two
          columns. The list below is a preview of what email addresses we will
          use to send a review invitation. Read the guide on
          <a href="/page/upload-email-addresses" target="_blank"
            >how to create CSV files</a
          >.
        </p>
      </div>
      <div class="clients-header__controls">
        <UiFileUpload
          v-if="hasClients"
          class="clients-header-controls__item"
          view="button"
          title="Upload CSV"
          accept=".csv"
          :is-disabled="isClientsDisabled"
          @update:modelValue="uploadCsv"
        />
        <UiButton
          class="clients-header-controls__item"
          view="control-secondary"
          :is-end-icon="true"
          :is-disabled="isClientsDisabled || !hasClients"
          @click.stop="handleSelectAllClients"
        >
          <template #icon>
            <IconCheckboxChecked v-if="hasClients && isAllClientsSelected" />
            <IconCheckboxUnchecked
              v-if="!isAllClientsSelected || !hasClients"
            />
          </template>
          Select All
        </UiButton>
      </div>
    </div>

    <section class="clients" :class="{ 'clients-loaded': hasClients }">
      <div class="clients__body">
        <div class="clients__body-scroller">
          <template v-if="hasClients">
            <div class="clients-table">
              <label
                class="clients-table__row"
                v-for="client in clients"
                :key="client.id"
              >
                <span class="clients-table__col _name">
                  {{ client.name }}
                </span>
                <span class="clients-table__col _email">
                  {{ client.email }}
                </span>
                <span class="clients-table__col _check">
                  <UiCheckbox
                    v-model="client.selected"
                    :is-disabled="isClientsDisabled"
                  />
                </span>
              </label>
            </div>
            <div class="clients__more-button" v-if="hasMoreClients">
              <UiButton view="secondary" @click="loadMoreClients">
                Load More...
              </UiButton>
            </div>
          </template>
          <UiFileUpload
            v-else
            view="dropArea"
            title="Upload CSV"
            accept=".csv"
            @update:modelValue="uploadCsv"
            :is-disabled="isClientsDisabled"
          />
        </div>
        <div v-if="isClientsLoading" class="clients__loader clients-loader">
          <AppLoadingSpinner class="clients-loader__spinner" />
        </div>
      </div>

      <div class="content__buttons">
        <UiButton
          class="clients__send-button"
          @click="openInviteModal"
          :isDisabled="!selectedClientsIds.length"
        >
          <template #icon><IconArrowRight /></template>
          Send
        </UiButton>
      </div>
    </section>

    <teleport to="body">
      <UiModal
        v-if="isInviteModalOpened"
        :shrink-to-window="true"
        @close="closeInviteModal"
      >
        <div class="modal-content">
          <div class="modal-content__template template">
            <div class="template__title">Confirm review invitation</div>
            <div class="template__sub-title">
              You are going to send review invitations to
              {{ selectedClientsIds.length }} email
              {{ selectedClientsIds.length > 1 ? "addresses." : "address." }}
              Your recepients will receive the email below.
            </div>
            <div class="template__button-wrap">
              <UiButton
                @click="openInviteEditTextModal"
                view="control-secondary"
              >
                <template #icon><IconPen /></template>
                Edit text
              </UiButton>
            </div>

            <div class="review-invitation">
              <div v-html="formatHtmlText(htmlTemplate)" />
            </div>

            <div class="modal-content__buttons modal-content-buttons">
              <UiButton
                class="modal-content-buttons__item"
                view="secondary"
                @click="closeInviteModal"
              >
                Close
              </UiButton>
              <UiButton
                class="modal-content-buttons__item"
                :is-disabled="isClientsDisabled || !hasSelectedClients"
                @click="invite"
              >
                <template #icon><IconArrowRight /></template>
                Send
              </UiButton>
            </div>
          </div>
        </div>
      </UiModal>
    </teleport>

    <teleport to="body">
      <UiModal
        v-if="isInviteEditTextModalOpened"
        :shrink-to-window="true"
        @close="closeInviteEditTextModal"
      >
        <div class="modal-content modal-content-edit-text">
          <div class="modal-content__template template">
            <div class="template__label">Change Email Text:</div>
            <AppEmailTemplatesForm
              ref="templatesFormRef"
              :initial-selected-template="selectedTemplate"
              @selectTemplate="selectTemplate"
              @clickOnButtons="handleModalTemplateClick"
              @saveTemplates="saveTemplates"
            />
          </div>

          <div class="modal-content__buttons modal-content-buttons">
            <UiButton
              class="modal-content-buttons__item"
              view="secondary"
              @click="closeInviteEditTextModal"
            >
              Cancel
            </UiButton>
            <UiButton
              class="modal-content-buttons__item"
              :is-disabled="isClientsDisabled || !hasSelectedClients"
              @click="submitTemplateForm"
            >
              Save
            </UiButton>
          </div>
        </div>
      </UiModal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.clients {
  display: flex;
  flex-direction: column;

  &__header {
    flex-shrink: 0;
    flex-grow: 0;
    margin-bottom: 40px;
  }

  &__body {
    position: relative;
    flex-shrink: 1;
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    width: 100%;
    margin-top: 40px;
  }

  &__body-scroller {
    max-height: 620px;
    overflow: auto;
    padding-right: 0;
  }

  &__loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__more-button {
    margin-top: 12px;
    text-align: center;
  }

  &__send-button {
    margin-left: auto;
    display: block;
    margin-top: 40px;
    min-width: 200px;
  }
}

.clients-loaded {
  .clients {
    &__body {
      width: 102%;
    }

    &__body-scroller {
      padding-right: 1%;
    }
  }
}

.clients-loader {
  background-color: rgba($color-white, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;

  &__spinner {
    color: $color-blue;
    width: 50px;
    height: 50px;
  }
}

.clients-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__text {
    margin-right: 12px;
    flex-shrink: 1;
    flex-grow: 1;
  }

  &__controls {
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
  }

  &__title {
    @include typography-main(20px, 600);
    color: $color-blue;
    margin: 0;
  }

  &__description {
    @include typography-main(14px);
    color: $color-black;
    margin: 0;

    & a {
      @include typography-main(14px, 600);
      color: $color-blue;
    }
  }
}

.clients-header-controls {
  display: flex;
  align-items: center;

  &__item {
    &:not(:last-child) {
      margin-right: 12px;
    }
  }
}

.clients-table {
  &__row {
    display: flex;
    align-items: center;
    color: $color-blue;
    border-radius: $rounding-medium;
    cursor: pointer;

    &:nth-child(odd) {
      background-color: $color-blue-06;
    }

    &:hover {
      background-color: $color-blue-10;
    }
  }

  &__col {
    flex-shrink: 0;
    flex-grow: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    padding: 12px;

    &._name {
      @include typography-main(14px);
      color: $color-black;
      width: 30%;
    }

    &._email {
      @include typography-main(16px, 600);
      flex-shrink: 1;
      flex-grow: 1;
    }

    &._check {
      line-height: 0;
      width: 50px;
    }
  }
}

.review-invitation {
  border: 1px solid rgba(30, 43, 153, 0.2);
  box-sizing: border-box;
  border-radius: 10px;
  margin-top: 12px;
  padding: 24px 56px 10px;
  display: flex;
  flex-direction: column;

  &__logo {
    fill: #334384;
  }

  &__icon {
    width: 175px;
    margin: 14px auto 0;
  }

  &__title {
    @include typography-main(24px, 700);
    color: $color-blue;
    margin: 30px 0 0;
  }

  &__text {
    @include typography-main(16px);
    color: $color-black;
    margin: 12px 0 0;
    white-space: break-spaces;
  }

  &__business-name {
    @include typography-main(16px, 600);
    color: $color-blue;
  }

  :deep(a.button) {
    background: #1e2b99 !important;
    color: #ffffff !important;
  }
}

.template {
  &__title {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin-bottom: 4px;
  }

  &__sub-title {
    @include typography-main(14px);
    color: $color-black;
    margin-bottom: 40px;
  }

  &__label {
    @include typography-main(20px, 600);
    color: $color-blue;
    margin-bottom: 40px;
  }

  &__button-wrap {
    display: flex;
    justify-content: flex-end;
  }
}

.modal-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  width: 680px;
  max-width: 100%;
  height: 100%;

  &__template {
    flex-shrink: 0;
    flex-grow: 0;
  }

  &__clients {
    flex-shrink: 1;
    flex-grow: 1;
    min-height: 0;
  }

  &__buttons {
    flex-shrink: 0;
    flex-grow: 0;
  }
}

.modal-content-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 40px;

  &__item {
    min-width: 184px;

    &:not(:last-child) {
      color: $color-black;
      margin-right: 24px;
    }
  }
}
</style>
