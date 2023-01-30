<script lang="ts">
import { computed, defineComponent, ref, toRef } from "vue";
import { useCommonStore } from "@/stores/common";
import { copyToClipboard } from "@/helpers/copyToClipboard";
import { useAppConfig } from "@/appConfig";
import { useBccDelayStore } from "@/stores/bccDelay";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiModal from "@/components/UiModal.vue";
import UiButton from "@/components/UiButton.vue";
import UiCheckbox from "@/components/UiCheckbox.vue";
import IconCopy from "@/components/icons/IconCopy.vue";
import IconChecked from "@/components/icons/IconChecked.vue";
import IconTrash from "@/components/icons/IconTrash.vue";
import IconMail from "@/components/icons/IconMail.vue";
import { getEmailValidator, getRequiredValidator } from "@/helpers/validation";

export default defineComponent({
  components: {
    UiForm,
    UiFormField,
    UiFormTextInput: adaptForField(UiTextInput),
    UiModal,
    UiButton,
    UiCheckbox,
    IconCopy,
    IconChecked,
    IconTrash,
    IconMail,
  },
  async setup() {
    const { bccEmail } = useAppConfig();
    const commonStore = useCommonStore();
    const store = useBccDelayStore();

    let emailCopied = ref(false);
    let isModalOpened = ref(false);
    let isHaveError = ref(false);
    let bccDelaySending = ref(false);

    store.init();

    const copyBccEmail = async () => {
      try {
        await copyToClipboard(bccEmail);
        emailCopied.value = true;
        commonStore.showNotification(
          "success",
          "Email has been copied successfully"
        );
      } catch (e) {
        commonStore.showNotification("error", "Email not copied");
      }
    };

    const form = createForm({
      bccDelay: {
        ref: toRef(store.form, "bccDelay"),
        validators: [],
      },
    });

    let isSentImmediately = ref(!+form.fields.bccDelay.ref);

    const blurSubmitBbcDelay = async (value: string) => {
      if (bccDelaySending.value) return;
      bccDelaySending.value = true;

      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      if (value === "0") {
        isSentImmediately.value = true;
      }

      setTimeout(() => {
        // if user click on checkbox when input has been focused
        if (isSentImmediately.value) {
          form.fields.bccDelay.ref = "0";
        }
        store.patchCompany();
        bccDelaySending.value = false;
      }, 1);
    };

    const updateCheckbox = (value: boolean) => {
      if (bccDelaySending.value) return;
      if (value) {
        form.fields.bccDelay.ref = "0";
        store.patchCompany();
      }
    };

    const isShowTooltip = ref(false);
    const showMaskToolip = () => {
      isShowTooltip.value = true;
      setTimeout(() => (isShowTooltip.value = false), 5000);
    };
    const hideMaskToolip = () => {
      isShowTooltip.value = false;
    };

    const openModal = () => {
      isModalOpened.value = true;
    };
    const closeModal = () => {
      isModalOpened.value = false;
    };

    const formAddEmail = createForm({
      email: {
        ref: ref(""),
        validators: [getRequiredValidator(), getEmailValidator()],
      },
    });

    const deleteEmail = async (idx: number, email: string) => {
      await store.deleteEmailForBcc(idx, email);
    };

    const addEmail = async () => {
      formAddEmail.setErrorsVisible(true);
      if (formAddEmail.hasError) {
        return;
      }

      const res = await store.addEmailForBcc(formAddEmail.fields.email.ref);
      if (res) {
        formAddEmail.fields.email.ref = "";
        formAddEmail.setErrorsVisible(false);
        isModalOpened.value = false;
      }
    };

    return {
      copyBccEmail,
      emailCopied,
      isHaveError,
      blurSubmitBbcDelay,
      isShowTooltip,
      showMaskToolip,
      hideMaskToolip,
      isSentImmediately,
      updateCheckbox,
      form,
      bccInvitationDelayMax: computed(() => store.bccInvitationDelayMax),
      isModalOpened,
      openModal,
      closeModal,
      formAddEmail,
      addEmail,
      deleteEmail,
      bbcEmails: computed(() => store.bbcEmails),
    };
  },
});
</script>

<template>
  <div>
    <h2 class="bcc__title">by BCC</h2>
    <p class="bcc__description">
      You can add the My Client Reviews BCC email address to your emails and we
      will reach out to invite the clients to leave a review. Read the guide
      <router-link :to="{ path: '/page/add-a-bcc' }" target="_blank">
        on how to add a BCC</router-link
      >.
    </p>

    <div class="bcc__buttons">
      <UiButton
        class="bcc__button"
        :class="{
          'bcc__button-download': !emailCopied,
          'bcc__button-downloaded': emailCopied,
        }"
        view="control"
        @click.prevent="copyBccEmail"
      >
        <template #icon>
          <IconCopy v-if="!emailCopied" />
          <IconChecked v-else />
        </template>
        <template v-if="!emailCopied">Copy email</template>
        <template v-else>Email has been copied</template>
      </UiButton>
    </div>

    <h3 v-if="isHaveError" class="bcc__sub-title _error">*Field Title</h3>
    <h3 v-else class="bcc__sub-title">Invitation Delay</h3>
    <p class="bcc__description">
      By default we will send invites to your recipients immediately upon
      receiving the BCC mail. You can have such invitations be sent after a
      specified number of days instead.
    </p>
    <UiCheckbox
      v-model="isSentImmediately"
      :is-disabled="false"
      @update:modelValue="updateCheckbox"
      class="bcc__checkbox"
    >
      Review invitations will be sent out immediately.
    </UiCheckbox>

    <UiForm :form="form" class="bcc__form">
      <span
        class="bcc__form-text"
        :class="{ '_text-disabled': isSentImmediately }"
      >
        Send review invitation
      </span>
      <UiFormField :field="form.fields.bccDelay">
        <UiFormTextInput
          :field="form.fields.bccDelay"
          :is-disabled="isSentImmediately"
          place="byBCC"
          class="bcc__form-input"
          :mask="{ mask: '000' }"
          :maskNumberRange="[0, bccInvitationDelayMax]"
          @blur:modelValue="blurSubmitBbcDelay"
          @showMaskToolip="showMaskToolip"
          @hideMaskToolip="hideMaskToolip"
        />
      </UiFormField>

      <div v-if="isShowTooltip" class="bcc__form-input-tooltip">
        <div>You can set up a delay for no more than 180 days.</div>
      </div>
      <span
        class="bcc__form-text"
        :class="{ '_text-disabled': isSentImmediately }"
      >
        days after sending a BCC email.
      </span>
    </UiForm>

    <span v-if="isHaveError" class="bcc__form-text _error">
      *Sorry! Something went wrong. Please check your internet connection or
      repeat uploading.
    </span>

    <h3 class="bcc__sub-title">Specify your email addresses</h3>
    <p class="bcc__description">
      Add the email addresses that will send out bcc emails:
    </p>

    <section class="emails">
      <div class="emails__body">
        <div class="emails__body-scroller">
          <div class="emails-table">
            <div
              class="emails-table__row"
              v-for="(email, idx) in bbcEmails"
              :key="idx"
            >
              <span class="emails-table__col _email">
                {{ email }}
              </span>

              <span class="emails-table__col _delete">
                <UiButton
                  class="emails__delete-button"
                  view="control-secondary"
                  @click="deleteEmail(idx, email)"
                >
                  <template #icon><IconTrash /></template>
                </UiButton>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content__buttons">
        <UiButton class="emails__add-button" view="control" @click="openModal">
          Add Email
        </UiButton>
      </div>
    </section>

    <teleport to="body">
      <UiModal v-if="isModalOpened" @close="closeModal">
        <div class="bcc-modal">
          <div class="bcc-modal__header">
            <h2 class="bcc-modal__title">Add New Email</h2>
          </div>
          <UiForm :form="formAddEmail" class="bcc-modal__form">
            <UiFormField
              :field="formAddEmail.fields.email"
              label="Enter Email"
              class="bcc-modal__form-field"
            >
              <UiFormTextInput
                :field="formAddEmail.fields.email"
                class="bcc-modal__form-input"
                placeholder="Enter Email"
              >
                <template v-slot:prefix>
                  <IconMail />
                </template>
              </UiFormTextInput>
            </UiFormField>
          </UiForm>

          <div class="bcc-modal__buttons">
            <UiButton
              class="bcc-modal__button"
              view="control-secondary"
              @click="closeModal"
            >
              Close
            </UiButton>
            <UiButton class="bcc-modal__button" @click="addEmail">
              Add Email
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
@import "@/styles/responsive.scss";

.bcc {
  &__title {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__sub-title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 40px 0 0;

    &._error {
      color: $color-red;
    }
  }

  &__description {
    @include typography-main(14px);
    color: $color-black;
    margin: 4px 0 0;

    & a {
      @include typography-main(14px, 600);
      color: $color-blue;
    }
  }

  &__buttons {
    margin-top: 40px;
    height: 80px;
    background-color: $color-blue-06;
    border-radius: $rounding-medium;
  }

  &__checkbox {
    margin-top: 26px;
  }

  &__form {
    display: flex;
    align-items: center;
    position: relative;

    &-text {
      @include typography-main(12px);

      &:first-child {
        margin-right: 12px;
      }

      &:last-child {
        margin-left: 12px;
      }

      &._text-disabled {
        color: $color-black-40;
      }

      &._error {
        color: $color-red;
        margin-top: 12px;
        display: block;
      }
    }

    &-input {
      height: 52px;
      width: 100px;
      box-sizing: border-box;

      &-tooltip {
        @include typography-main(10px);
        color: $color-blue;
        background-color: $color-white;
        border-radius: $rounding-medium;
        position: absolute;
        top: -40px;
        left: 60px;
        padding: 8px;
        box-shadow: 4px 4px 10px rgba($color-blue, 0.2);
        display: flex;
        width: max-content;
        flex-direction: column;
      }
    }
  }

  &__button {
    @include typography-main(16px, 600);
    width: 100%;
    height: 100%;

    &-download {
      background-color: transparent !important;
      color: $color-blue !important;
    }

    &-downloaded {
      color: $color-green !important;
      background-color: transparent !important;
    }

    &-checked {
      color: $color-green !important;
    }
  }
}

.emails {
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
    margin-top: 24px;
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

  &__add-button {
    display: block;
    margin-top: 24px;
    min-width: 200px;
    height: 52px;
  }

  &__delete-button {
    background: transparent !important;
    padding: 0 !important;
  }
}

.emails-table {
  &__row {
    display: flex;
    align-items: center;
    color: $color-blue;
    border-radius: $rounding-medium;

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

    &._email {
      @include typography-main(14px, 600);
      color: $color-blue;
      width: 30%;
      flex-shrink: 1;
      flex-grow: 1;
    }

    &._delete {
      line-height: 0;
    }
  }
}

.bcc-modal {
  padding: 10px;
  min-width: 656px;

  @include responsive-media((xs, md)) {
    min-width: initial;
  }

  &__title {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin: 0;
  }

  &__form-field {
    margin-top: 40px;
  }

  &__buttons {
    display: flex;
    margin-top: 40px;
  }

  &__button {
    height: 52px;
    width: 184px;

    &:first-child {
      margin-left: auto;
      margin-right: 24px;
    }
  }
}
</style>
