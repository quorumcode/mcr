<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiButton from "@/components/UiButton.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiImageUpload from "@/components/UiImageUpload.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import { useAdditionalInfoFormStore } from "@/stores/additionalInfoForm";
import { createForm } from "@/helpers/form";
import {
  getEmailValidator,
  getLengthValidator,
  getRequiredValidator,
  getWebsiteValidator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiFormField,
    UiButton,
    UiForm,
    UiFormImageUpload: adaptForField(UiImageUpload),
    UiFormTextInput: adaptForField(UiTextInput),
  },
  props: {
    companyId: {
      type: String,
      required: true,
    },
    submitButtonText: {
      type: String,
      default: "Save",
    },
  },
  emits: {
    submit(payload: Promise<void>) {
      return payload;
    },
  },
  async setup(props, { emit }) {
    const store = useAdditionalInfoFormStore();

    const form = createForm({
      image: {
        ref: toRef(store.form, "image"),
        validators: [],
      },
      website: {
        ref: toRef(store.form, "website"),
        validators: [
          getWebsiteValidator(),
          getLengthValidator({ maxChars: 128 }),
        ],
      },
      phone: {
        ref: toRef(store.form, "phone"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
        ],
      },
      notificationEmail: {
        ref: toRef(store.form, "notificationEmail"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getEmailValidator(),
        ],
      },
      alertEmail: {
        ref: toRef(store.form, "alertEmail"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getEmailValidator(),
        ],
      },
    });

    const submit = () => {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }
      emit("submit", store.submit(form));
    };

    const skip = () => {
      emit("skip");
    };

    await store.init(props.companyId);

    return {
      submit,
      skip,
      form,
      imagePrevUrl: computed(() => store.imagePrevUrl),
    };
  },
});
</script>

<template>
  <UiForm :form="form" @submit="submit">
    <div class="fields">
      <UiFormField
        :field="form.fields.image"
        label="Upload Company Logo"
        tag="div"
        class="fields__item"
      >
        <UiFormImageUpload
          :field="form.fields.image"
          :transformation="{ maxWidth: 256, maxHeight: 256 }"
          :prev-url="imagePrevUrl"
        />
      </UiFormField>
      <UiFormField
        :field="form.fields.website"
        label="Website"
        class="fields__item"
      >
        <template #description>Optional</template>
        <UiFormTextInput
          :field="form.fields.website"
          placeholder="Enter your website to display on your page"
        />
      </UiFormField>
      <UiFormField
        :field="form.fields.phone"
        label="Contact Phone Number"
        class="fields__item"
      >
        <UiFormTextInput
          :field="form.fields.phone"
          placeholder="Enter the phone number to display on your page"
        />
      </UiFormField>
      <UiFormField
        :field="form.fields.notificationEmail"
        label="Email for New Review Notifications"
        class="fields__item"
      >
        <UiFormTextInput
          :field="form.fields.notificationEmail"
          placeholder=""
        />
      </UiFormField>
      <UiFormField
        :field="form.fields.alertEmail"
        label="Email for Negative Review Alerts (1-2 stars)"
        class="fields__item"
      >
        <UiFormTextInput :field="form.fields.alertEmail" placeholder="" />
      </UiFormField>
    </div>

    <div class="buttons">
      <UiButton
        type="submit"
        class="buttons__item"
        view="primary"
        :is-disabled="form.isDisabled"
      >
        {{ submitButtonText }}
      </UiButton>
    </div>
  </UiForm>
</template>

<style lang="scss" scoped>
.fields {
  margin-bottom: 40px;

  &__item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.buttons {
  display: flex;

  &__item {
    min-width: 184px;

    &:last-child {
      margin-left: auto;
    }
  }
}
</style>
