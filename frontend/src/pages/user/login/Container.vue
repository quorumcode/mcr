<script lang="ts">
import { defineComponent, toRef } from "vue";
import AppUtilityLayout from "@/containers/AppUtilityLayout.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import IconMail from "@/components/icons/IconMail.vue";
import UiLink from "@/components/UiLink.vue";
import UiButton from "@/components/UiButton.vue";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiPasswordInput from "@/components/UiPasswordInput.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import { useLoginPageStore } from "./store";
import { useRoute, useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { createForm } from "@/helpers/form";
import {
  getEmailValidator,
  getPasswordValidator,
  getRequiredValidator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiButton,
    UiLink,
    UiFormPasswordInput: adaptForField(UiPasswordInput),
    IconMail,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormField,
    UiForm,
    AppUtilityLayout,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useLoginPageStore();

    const form = createForm({
      email: {
        ref: toRef(store.form, "email"),
        validators: [getRequiredValidator(), getEmailValidator()],
      },
      password: {
        ref: toRef(store.form, "password"),
        validators: [getRequiredValidator(), getPasswordValidator()],
      },
    });

    const submit = async () => {
      await store.submit(form, route.query.redirect);
    };

    const goToRegistration = () => {
      router.push({ name: routesNames.registration });
    };

    const goToForgotPassword = () => {
      router.push({ name: routesNames.forgotPassword });
    };

    return {
      form,
      submit,
      goToRegistration,
      goToForgotPassword,
    };
  },
});
</script>

<template>
  <AppUtilityLayout :illustration-variant="3">
    <template v-slot:title>Welcome Back!</template>

    <UiForm :form="form" @submit="submit">
      <div class="fields">
        <UiFormField
          class="fields__item"
          :field="form.fields.email"
          label="Enter Email"
        >
          <UiFormTextInput :field="form.fields.email" placeholder="Email">
            <template v-slot:prefix>
              <IconMail />
            </template>
          </UiFormTextInput>
        </UiFormField>

        <UiFormField
          class="fields__item"
          :field="form.fields.password"
          label="Enter Password"
        >
          <UiFormPasswordInput
            :field="form.fields.password"
            placeholder="Must be at least 8 characters long"
          />
        </UiFormField>
      </div>

      <div class="forgot">
        <UiLink @click.prevent="goToForgotPassword">Forgot Password?</UiLink>
      </div>

      <div class="buttons">
        <UiButton
          class="buttons__item"
          view="secondary"
          :is-disabled="form.isDisabled"
          @click.prevent="goToRegistration"
        >
          Create Account
        </UiButton>
        <UiButton
          type="submit"
          class="buttons__item"
          view="primary"
          :is-disabled="form.isDisabled"
        >
          Log In
        </UiButton>
      </div>
    </UiForm>
  </AppUtilityLayout>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.fields {
  margin-bottom: 8px;

  &__item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.forgot {
  @include typography-main(12px);
  margin-bottom: 80px;
  text-align: right;
  color: $color-blue;
}

.buttons {
  display: flex;
  justify-content: space-between;

  &__item {
    min-width: 184px;
  }
}
</style>
