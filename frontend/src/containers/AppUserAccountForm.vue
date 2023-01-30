<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import { useProfileFormStore } from "@/stores/profileForm";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import { createForm } from "@/helpers/form";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiButton from "@/components/UiButton.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import IconMail from "@/components/icons/IconMail.vue";
import IconUser from "@/components/icons/IconUser.vue";
import {
  getEmailValidator,
  getLengthValidator,
  getRequiredValidator,
  getPatternValidator,
  getWhitespaceValidator,
} from "@/helpers/validation";

export default defineComponent({
  components: {
    UiFormField,
    UiButton,
    UiForm,
    UiFormTextInput: adaptForField(UiTextInput),
    IconMail,
    IconUser,
  },
  emits: {
    submit(payload: Promise<void>) {
      return payload;
    },
  },
  async setup(props, { emit }) {
    const store = useProfileFormStore();

    const form = createForm({
      newName: {
        ref: toRef(store.form, "newName"),
        validators: [
          getRequiredValidator(),
          getPatternValidator(),
          getLengthValidator({ maxChars: 128 }),
          getWhitespaceValidator(),
        ],
      },
      newEmail: {
        ref: toRef(store.form, "newEmail"),
        validators: [
          getRequiredValidator(),
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

    return {
      form,
      submit,
      isFieldNameChanged: computed(() => store.isFieldNameChanged),
      isFieldEmailChanged: computed(() => store.isFieldEmailChanged),
    };
  },
});
</script>

<template>
  <UiForm :form="form" @submit="submit">
    <div class="fields">
      <UiFormField
        :field="form.fields.newName"
        label="Your Name"
        class="fields__item"
      >
        <UiFormTextInput
          :field="form.fields.newName"
          :mask="{ mask: /^[A-Z ]+$/i }"
          placeholder=""
        >
          <template v-slot:prefix>
            <IconUser />
          </template>
        </UiFormTextInput>
      </UiFormField>
      <UiFormField
        :field="form.fields.newEmail"
        label="Your Email"
        class="fields__item"
      >
        <UiFormTextInput :field="form.fields.newEmail" placeholder="">
          <template v-slot:prefix>
            <IconMail />
          </template>
        </UiFormTextInput>
      </UiFormField>
    </div>

    <div class="buttons">
      <UiButton
        type="submit"
        class="buttons__item"
        view="primary"
        :is-disabled="
          !(isFieldNameChanged || isFieldEmailChanged) || form.isDisabled
        "
      >
        Save changes
      </UiButton>
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
