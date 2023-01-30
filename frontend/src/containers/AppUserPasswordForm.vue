<script lang="ts">
import { defineComponent, toRef, ref } from "vue";
import { useProfileFormStore } from "@/stores/profileForm";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import { createForm } from "@/helpers/form";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiButton from "@/components/UiButton.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import {
  getRequiredValidator,
  getPasswordValidator,
  getWhitespaceValidator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiFormField,
    UiButton,
    UiForm,
    UiFormTextInput: adaptForField(UiTextInput),
  },
  emits: {
    submit(payload: Promise<void>) {
      return payload;
    },
  },
  async setup() {
    const store = useProfileFormStore();
    let showChangePasswordForm = ref(false);

    const form = createForm({
      password: {
        ref: toRef(store.changePasswordForm, "password"),
        validators: [],
      },
      oldPassword: {
        ref: toRef(store.changePasswordForm, "oldPassword"),
        validators: [
          getRequiredValidator(),
          getPasswordValidator(),
          getWhitespaceValidator(),
        ],
      },
      newPassword: {
        ref: toRef(store.changePasswordForm, "newPassword"),
        validators: [
          getRequiredValidator(),
          getPasswordValidator(),
          getWhitespaceValidator(),
        ],
      },
    });

    const isFocus = ref(false);
    const toggleChangePasswordForm = () => {
      isFocus.value = true;
      showChangePasswordForm.value = !showChangePasswordForm.value;
    };

    const submit = async () => {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }
      const res = await store.changeAccountPassword(form);
      if (res) {
        toggleChangePasswordForm();
      }
    };

    return {
      form,
      submit,
      showChangePasswordForm,
      toggleChangePasswordForm,
      isFocus,
    };
  },
});
</script>

<template>
  <UiForm :form="form" @submit="submit">
    <div class="fields">
      <template v-if="!showChangePasswordForm">
        <UiFormField
          :field="form.fields.password"
          label="Password"
          class="fields__item"
        >
          <UiFormTextInput
            :field="form.fields.password"
            :is-disabled="true"
            type="password"
          />
        </UiFormField>
        <div class="buttons">
          <UiButton
            @click="toggleChangePasswordForm"
            class="buttons__item-big"
            view="control"
          >
            Change password
          </UiButton>
        </div>
      </template>

      <template v-else>
        <UiFormField
          :field="form.fields.oldPassword"
          label="Old Password"
          class="fields__item"
        >
          <UiFormTextInput
            :field="form.fields.oldPassword"
            :is-focus="isFocus"
          />
        </UiFormField>
        <UiFormField
          :field="form.fields.newPassword"
          label="New Password"
          class="fields__item"
        >
          <UiFormTextInput
            :field="form.fields.newPassword"
            type="password"
            disable-autocomplete
          />
        </UiFormField>
        <div class="buttons">
          <UiButton type="submit" class="buttons__item-big" view="control">
            Save
          </UiButton>
        </div>
      </template>
    </div>
  </UiForm>
</template>

<style lang="scss" scoped>
.fields {
  margin-bottom: 40px;

  &__item {
    &:not(:last-child) {
      margin-bottom: 40px;
    }

    &:nth-child(3) {
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

  &__item-big {
    min-height: 52px;
    min-width: 168px;
    margin-left: auto;
  }

  &__item-change {
    margin-bottom: 16px;

    &._no-card {
      margin-left: initial;
    }
  }

  &__item-delete {
    margin: 24px 0 0;
    min-width: 184px;
  }
}
</style>
