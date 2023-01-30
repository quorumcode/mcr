<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import AppUtilityLayout from "@/containers/AppUtilityLayout.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiButton from "@/components/UiButton.vue";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiPasswordInput from "@/components/UiPasswordInput.vue";
import { useNewPasswordPageStore } from "./store";
import { createForm } from "@/helpers/form";
import {
  getPasswordValidator,
  getRequiredValidator,
  Validator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiButton,
    UiFormPasswordInput: adaptForField(UiPasswordInput),
    UiFormField,
    UiForm,
    AppUtilityLayout,
  },
  setup() {
    const route = useRoute();
    const store = useNewPasswordPageStore();
    const code = computed(() => route.params.code);

    const form = createForm({
      password: {
        ref: ref(""),
        validators: [getRequiredValidator(), getPasswordValidator()],
      },
      passwordRepeat: {
        ref: ref(""),
        validators: [
          getRequiredValidator(),
          getPasswordValidator().stop(),
          new Validator((value) => {
            if (value !== form.fields.password.ref) {
              return "Password mismatch";
            }
          }),
        ],
      },
    });

    const submit = async () => {
      await store.submit(form, code.value);
    };

    return {
      form,
      submit,
    };
  },
});
</script>

<template>
  <AppUtilityLayout :illustration-variant="4">
    <template v-slot:title>New Password</template>

    <UiForm :form="form" @submit="submit">
      <div class="fields">
        <UiFormField
          class="fields__item"
          :field="form.fields.password"
          label="New Password"
        >
          <UiFormPasswordInput
            :field="form.fields.password"
            placeholder="Must be at least 8 characters long"
          />
        </UiFormField>

        <UiFormField
          class="fields__item"
          :field="form.fields.passwordRepeat"
          label="Repeat Password"
        >
          <UiFormPasswordInput
            :field="form.fields.passwordRepeat"
            placeholder="Must be at least 8 characters long"
          />
        </UiFormField>
      </div>

      <div class="buttons">
        <UiButton type="submit" class="buttons__item" view="primary">
          Change Password
        </UiButton>
      </div>
    </UiForm>
  </AppUtilityLayout>
</template>

<style lang="scss" scoped>
.fields {
  margin-bottom: 60px;

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
</style>
