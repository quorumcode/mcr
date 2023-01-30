<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import { useBusinessProfileStore } from "@/stores/businessProfileForm";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import { createForm } from "@/helpers/form";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiField from "@/components/UiField.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiTagsInput from "@/components/UiTagsInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiAddressInput from "@/components/UiAddressInput.vue";
import UiImageUpload from "@/components/UiImageUpload.vue";
import UiButton from "@/components/UiButton.vue";
import {
  getLengthValidator,
  getRequiredValidator,
  getWebsiteValidator,
  getEmailValidator,
  getWhitespaceValidator,
  getPhoneNumberValidator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiFormField,
    UiButton,
    UiForm,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormTagsInput: adaptForField(UiTagsInput),
    UiFormTextarea: adaptForField(UiTextarea),
    UiFormImageUpload: adaptForField(UiImageUpload),
    UiField,
    UiAddressInput,
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
    const store = useBusinessProfileStore();
    await store.fetchData(props.companyId);

    const form = createForm({
      businessName: {
        ref: toRef(store.form, "businessName"),
        validators: [
          getWhitespaceValidator(),
          getLengthValidator({ maxChars: 30 }),
        ],
      },
      categories: {
        ref: toRef(store.form, "categories"),
        validators: [getRequiredValidator()],
      },
      route: {
        ref: toRef(store.form, "route"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      streetNumber: {
        ref: toRef(store.form, "streetNumber"),
        validators: [
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      town: {
        ref: toRef(store.form, "town"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      administrativeDivision: {
        ref: toRef(store.form, "administrativeDivision"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      postalCode: {
        ref: toRef(store.form, "postalCode"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      state: {
        ref: toRef(store.form, "state"),
        validators: [getWhitespaceValidator()],
      },
      about: {
        ref: toRef(store.form, "about"),
        validators: [
          getLengthValidator({ maxChars: 800 }),
          getWhitespaceValidator(),
        ],
      },
      image: {
        ref: toRef(store.form, "image"),
        validators: [],
      },
      website: {
        ref: toRef(store.form, "website"),
        validators: [
          getWebsiteValidator(),
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      phone: {
        ref: toRef(store.form, "phone"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getPhoneNumberValidator(),
          getWhitespaceValidator(),
        ],
      },
      notificationEmail: {
        ref: toRef(store.form, "notificationEmail"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getEmailValidator(),
          getWhitespaceValidator(),
        ],
      },
      alertEmail: {
        ref: toRef(store.form, "alertEmail"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getEmailValidator(),
          getWhitespaceValidator(),
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

    await store.init(props.companyId);

    return {
      submit,
      form,
      categories: computed(() => store.categories),
      updateAddress: store.updateAddress,
      imagePrevUrl: computed(() => store.imagePrevUrl),
    };
  },
});
</script>

<template>
  <UiForm :form="form" @submit="submit">
    <div class="fields">
      <UiFormField
        :field="form.fields.businessName"
        label="Business Name"
        class="fields__item"
      >
        <UiFormTextInput :field="form.fields.businessName" placeholder="" />
      </UiFormField>

      <UiFormField
        class="fields__item"
        :field="form.fields.categories"
        label="Choose Business Category"
      >
        <UiFormTagsInput
          placeholder="Enter category"
          :field="form.fields.categories"
          :options="categories"
        />
      </UiFormField>

      <div class="fields__item address-grid">
        <UiField label="Address" class="address-grid__search">
          <UiAddressInput
            placeholder="Find your address"
            @change="updateAddress"
          ></UiAddressInput>
        </UiField>
        <UiFormField
          class="address-grid__street-number"
          :field="form.fields.streetNumber"
          :show-errors-text="false"
        >
          <UiFormTextInput :field="form.fields.streetNumber" placeholder="№" />
        </UiFormField>
        <UiFormField class="address-grid__route" :field="form.fields.route">
          <UiFormTextInput :field="form.fields.route" placeholder="Street" />
        </UiFormField>
        <UiFormField class="address-grid__town" :field="form.fields.town">
          <UiFormTextInput :field="form.fields.town" placeholder="City" />
        </UiFormField>
        <UiFormField
          class="address-grid__postal-code"
          :field="form.fields.postalCode"
        >
          <UiFormTextInput
            :field="form.fields.postalCode"
            placeholder="Postcode"
          />
        </UiFormField>
        <UiFormField class="address-grid__state" :field="form.fields.state">
          <UiFormTextInput
            :field="form.fields.state"
            placeholder="State (optional)"
          />
        </UiFormField>
        <UiFormField
          class="address-grid__administrative-division"
          :field="form.fields.administrativeDivision"
        >
          <UiFormTextInput
            :field="form.fields.administrativeDivision"
            placeholder="Country"
          />
        </UiFormField>
      </div>

      <UiFormField
        class="fields__item"
        :field="form.fields.about"
        label="About My Business"
      >
        <UiFormTextarea
          :field="form.fields.about"
          :counter="{ max: 800 }"
          placeholder="Provide a short description of your business (optional)"
        />
      </UiFormField>

      <UiFormField
        :field="form.fields.image"
        label="Upload Company Logo"
        tag="div"
        class="fields__item"
      >
        <template #description
          >Allow JPG and PNG upload, picture size and other</template
        >

        <UiFormImageUpload
          class="fields__item-upload"
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
        <UiFormTextInput :field="form.fields.website" placeholder="Enter URL" />
      </UiFormField>
      <UiFormField
        :field="form.fields.phone"
        label="Contact Phone Number"
        class="fields__item"
      >
        <UiFormTextInput :field="form.fields.phone" />
      </UiFormField>
      <UiFormField
        :field="form.fields.notificationEmail"
        label="Email for New Review Notifications"
        class="fields__item"
      >
        <UiFormTextInput
          :field="form.fields.notificationEmail"
          placeholder="Enter text..."
        />
      </UiFormField>
      <UiFormField
        :field="form.fields.alertEmail"
        label="Email for Negative Review Alerts (1-2 stars)"
        class="fields__item"
      >
        <UiFormTextInput
          :field="form.fields.alertEmail"
          placeholder="Enter text..."
        />
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
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.fields {
  margin-bottom: 40px;

  &__item {
    margin-bottom: 24px;

    &-upload {
      margin-top: 4px;
    }

    &:nth-child(4) {
      margin-bottom: 40px;
    }

    &:last-child {
      margin-bottom: 40px;
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

.address-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-column-gap: 12px;
  grid-row-gap: 12px;

  &__search {
    grid-column: span 8;
  }

  &__street-number {
    grid-column: span 1;
  }

  &__route {
    grid-column: span 7;
  }

  &__town {
    grid-column: span 4;
  }

  &__postal-code {
    grid-column: span 4;
  }

  &__administrative-division {
    grid-column: span 4;
  }
  &__state {
    grid-column: span 4;
  }
}
</style>
