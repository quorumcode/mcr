<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import { useBusinessInfoFormStore } from "@/stores/businessInfoForm";
import { getLengthValidator, getRequiredValidator } from "@/helpers/validation";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiField from "@/components/UiField.vue";
import UiAddressInput from "@/components/UiAddressInput.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiTagsInput from "@/components/UiTagsInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiButton from "@/components/UiButton.vue";

export default defineComponent({
  components: {
    UiForm,
    UiFormField,
    UiField,
    UiAddressInput,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormTagsInput: adaptForField(UiTagsInput),
    UiFormTextarea: adaptForField(UiTextarea),
    UiButton,
  },
  props: {
    companyId: {
      type: String,
      default: undefined,
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
    const store = useBusinessInfoFormStore();

    const form = createForm({
      businessName: {
        ref: toRef(store.form, "businessName"),
        validators: [
          getRequiredValidator(),
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
        ],
      },
      streetNumber: {
        ref: toRef(store.form, "streetNumber"),
        validators: [getLengthValidator({ maxChars: 128 })],
      },
      town: {
        ref: toRef(store.form, "town"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
        ],
      },
      administrativeDivision: {
        ref: toRef(store.form, "administrativeDivision"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
        ],
      },
      postalCode: {
        ref: toRef(store.form, "postalCode"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
        ],
      },
      state: {
        ref: toRef(store.form, "state"),
        validators: [],
      },
      about: {
        ref: toRef(store.form, "about"),
        validators: [getLengthValidator({ maxChars: 800 })],
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
    };
  },
});
</script>

<template>
  <UiForm :form="form" @submit="submit">
    <div class="fields">
      <UiFormField
        class="fields__item"
        :field="form.fields.businessName"
        label="Business Name"
      >
        <UiFormTextInput
          :field="form.fields.businessName"
          placeholder="Enter your trading name"
        />
      </UiFormField>
      <UiFormField
        class="fields__item"
        :field="form.fields.categories"
        label="Choose Business Category"
      >
        <template v-slot:description>
          List what the services do you provide, tagging multiple categories.
          Potential customers will then be able to search by category to find
          you.
        </template>
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
  justify-content: flex-end;

  &__item {
    min-width: 184px;
  }
}

.address-grid {
  display: grid;
  // grid-template-areas: "a1 a2 a2" "b1 b1 b2" "c1 c1";
  // grid-template-columns: 25% 25% 50%;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 24px;
  grid-row-gap: 12px;

  &__search {
    grid-column: span 4;
  }

  &__street-number {
    grid-column: span 1;
  }

  &__route {
    grid-column: span 3;
  }

  &__town {
    grid-column: span 2;
  }

  &__postal-code {
    grid-column: span 2;
  }

  &__administrative-division {
    grid-column: span 2;
  }

  &__state {
    grid-column: span 2;
  }
}
</style>
