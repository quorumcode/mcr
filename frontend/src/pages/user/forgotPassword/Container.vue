<script lang="ts">
import { defineComponent, toRef } from "vue";
import AppUtilityLayout from "@/containers/AppUtilityLayout.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import IconMail from "@/components/icons/IconMail.vue";
import UiButton from "@/components/UiButton.vue";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiTextInput from "@/components/UiTextInput.vue";
import { useForgotPasswordPageStore } from "./store";
import { createForm } from "@/helpers/form";
import { getEmailValidator, getRequiredValidator } from "@/helpers/validation";

export default defineComponent({
  components: {
    UiButton,
    IconMail,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormField,
    UiForm,
    AppUtilityLayout,
  },
  setup() {
    const store = useForgotPasswordPageStore();

    const form = createForm({
      email: {
        ref: toRef(store.form, "email"),
        validators: [getRequiredValidator(), getEmailValidator()],
      },
    });

    const submit = async () => {
      await store.submit(form);
    };

    return {
      form,
      submit,
    };
  },
});
</script>

<template>
  <AppUtilityLayout :illustration-variant="4" :back="true">
    <template v-slot:title>Forgot Password?</template>
    <template v-slot:description>
      Enter the email address you used when you joined and we’ll send you
      instructions to reset your password.
    </template>

    <UiForm :form="form" @submit="submit">
      <UiFormField class="field" :field="form.fields.email" label="Enter Email">
        <UiFormTextInput :field="form.fields.email" placeholder="Email">
          <template v-slot:prefix>
            <IconMail />
          </template>
        </UiFormTextInput>
      </UiFormField>

      <div class="buttons">
        <UiButton type="submit" class="buttons__item" view="primary">
          Send Reset Instructions
        </UiButton>
      </div>
    </UiForm>
  </AppUtilityLayout>
</template>

<style lang="scss" scoped>
.field {
  margin-bottom: 80px;
}

.buttons {
  display: flex;
  justify-content: flex-end;

  &__item {
    min-width: 184px;
  }
}
</style>
