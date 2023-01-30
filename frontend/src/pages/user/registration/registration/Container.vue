<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import AppUtilityLayout from "@/containers/AppUtilityLayout.vue";
import { useRegistrationPageStore } from "./store";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import IconUser from "@/components/icons/IconUser.vue";
import IconMail from "@/components/icons/IconMail.vue";
import UiLink from "@/components/UiLink.vue";
import UiButton from "@/components/UiButton.vue";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiCheckbox from "@/components/UiCheckbox.vue";
import UiPasswordInput from "@/components/UiPasswordInput.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { createForm } from "@/helpers/form";
import {
  getEmailValidator,
  getLengthValidator,
  getPasswordValidator,
  getPatternValidator,
  getRequiredValidator,
  Validator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiButton,
    UiLink,
    UiFormCheckbox: adaptForField(UiCheckbox),
    UiFormPasswordInput: adaptForField(UiPasswordInput),
    IconMail,
    IconUser,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormField,
    UiForm,
    AppUtilityLayout,
  },
  setup() {
    const router = useRouter();
    const store = useRegistrationPageStore();

    const form = createForm({
      userName: {
        ref: ref(""),
        validators: [
          getRequiredValidator(),
          getPatternValidator(),
          getLengthValidator({ maxChars: 128, minChars: 2 }),
        ],
      },
      email: {
        ref: ref(""),
        validators: [getRequiredValidator(), getEmailValidator()],
      },
      password: {
        ref: ref(""),
        validators: [getPasswordValidator()],
      },
      passwordRepeat: {
        ref: ref(""),
        validators: [
          getPasswordValidator().stop(),
          new Validator((value) => {
            if (value !== form.fields.password.ref) {
              return "Password mismatch";
            }
          }),
        ],
      },
      isAgreementsConfirmed: {
        ref: ref(false),
        validators: [
          new Validator((value) => {
            if (!value) {
              return "You must agree to the Terms of Service";
            }
          }),
        ],
      },
    });

    const submit = async () => {
      await store.submit(form);
    };

    const goToLogin = () => {
      router.push({ name: routesNames.login });
    };

    const termsUrl = computed(() => {
      return router.resolve({
        name: routesNames.page,
        params: { name: "terms" },
      }).href;
    });

    return {
      form,
      submit,
      goToLogin,
      termsUrl,
      routesNames,
    };
  },
});
</script>

<template>
  <AppUtilityLayout :illustration-variant="1">
    <template v-slot:title>Create Your Account</template>

    <UiForm :form="form" @submit="submit">
      <div class="fields">
        <UiFormField
          class="fields__item"
          :field="form.fields.userName"
          label="Your name"
        >
          <UiFormTextInput
            :field="form.fields.userName"
            placeholder="Enter your full name"
          >
            <template v-slot:prefix>
              <IconUser />
            </template>
          </UiFormTextInput>
        </UiFormField>
        <UiFormField
          class="fields__item"
          :field="form.fields.email"
          label="Enter Email"
        >
          <UiFormTextInput
            :field="form.fields.email"
            placeholder="You will use this email to log in in the future"
          >
            <template v-slot:prefix>
              <IconMail />
            </template>
          </UiFormTextInput>
        </UiFormField>
        <UiFormField
          class="fields__item"
          :field="form.fields.password"
          label="Create a Password"
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

      <UiFormField
        class="agreements-confirm"
        :field="form.fields.isAgreementsConfirmed"
      >
        <UiFormCheckbox :field="form.fields.isAgreementsConfirmed">
          Creating an account means you agree with our
          <RouterLink
            :to="{ name: routesNames.page, params: { name: 'business-terms' } }"
            custom
            v-slot="{ href, navigate }"
          >
            <UiLink :href="href" @click="navigate" target="_blank">Terms of Service</UiLink>
          </RouterLink>
          &
          <RouterLink
            :to="{ name: routesNames.page, params: { name: 'privacy' } }"
            custom
            v-slot="{ href, navigate }"
          >
            <UiLink :href="href" @click="navigate" target="_blank">Privacy Policy</UiLink>
          </RouterLink>
          .
        </UiFormCheckbox>
      </UiFormField>

      <div class="buttons">
        <UiButton
          class="buttons__item"
          view="secondary"
          :is-disabled="form.isDisabled"
          @click.prevent="goToLogin"
        >
          Log In
        </UiButton>
        <UiButton
          type="submit"
          class="buttons__item"
          view="primary"
          :is-disabled="form.isDisabled"
        >
          Create Account
        </UiButton>
      </div>
    </UiForm>
  </AppUtilityLayout>
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

.agreements-confirm {
  margin-bottom: 40px;
}

.buttons {
  display: flex;
  justify-content: space-between;

  &__item {
    min-width: 184px;
  }
}
</style>
