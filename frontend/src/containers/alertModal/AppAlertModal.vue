<script lang="ts">
import { ref, defineComponent, computed } from "vue";
import { createForm } from "@/helpers/form";
import {
  getRequiredValidator,
  getLengthValidator,
  getWhitespaceValidator,
} from "@/helpers/validation";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiModal from "@/components/UiModal.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiButton from "@/components/UiButton.vue";
import { useCompanyProfilePageStore } from "@/pages/company/profile/store";

export default defineComponent({
  components: {
    UiModal,
    UiForm,
    UiFormField,
    UiFormTextInput: adaptForField(UiTextInput),
    UiTextarea: adaptForField(UiTextarea),
    UiButton,
  },
  props: {
    alert: {
      type: Object,
      default: {
        title: "",
        body: "",
      },
    },
  },
  setup(props, { emit }) {
    const title = ref(props.alert.title);
    const body = ref(props.alert.body);
    const store = useCompanyProfilePageStore();
    const form = createForm({
      title: {
        ref: title,
        validators: [getRequiredValidator(), getWhitespaceValidator()],
      },
      body: {
        ref: body,
        validators: [
          getRequiredValidator(),
          getWhitespaceValidator(),
          getLengthValidator({ maxChars: 3000 }),
        ],
      },
    });

    const submit = () => {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }
      store
        .updateAlert({ title: title.value, body: body.value }, form)
        .then(() => {
          close();
        });
    };

    const close = () => {
      emit("close");
    };

    return {
      body,
      form,
      submit,
      close,
      hideHighlight: store.hideBodyHighlight,
      bodyMatches: computed(() => store.bodyMatches),
    };
  },
});
</script>

<template>
  <UiModal @close="close" :show-close-btn="true">
    <div class="alert-modal">
      <div class="alert-modal__header">
        <template v-if="!alert.title">Add</template>
        <template v-else>Edit</template>
        Company Warning Message
      </div>
      <div class="alert-modal__text">
        A warning message will appear for all website visitors to inform them to
        be cautious with this company or to convey any other message.
      </div>
      <UiForm :form="form" @submit="submit">
        <UiFormField
          :field="form.fields.title"
          label="Title"
          class="alert-modal__field"
        >
          <UiFormTextInput :field="form.fields.title" placeholder="Title" />
        </UiFormField>
        <UiFormField
          class="alert-modal__field"
          :field="form.fields.body"
          label="Text Message"
        >
          <UiTextarea
            placeholder="Enter Text..."
            :field="form.fields.body"
            :min-height="104"
            :counter="{ max: 3000 }"
            :highlighted-intervals="bodyMatches"
            @update:modelValue="hideHighlight"
          />
        </UiFormField>
        <div class="alert-modal__controls controls">
          <UiButton class="controls__item" view="secondary" @click="close">
            Cancel
          </UiButton>
          <UiButton class="controls__item" type="submit">
            <template v-if="alert.title">Apply</template>
            <template v-else>Add</template>
          </UiButton>
        </div>
      </UiForm>
    </div>
  </UiModal>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.alert-modal {
  width: 580px;
  max-width: 100%;

  &__header {
    @include typography-main(20px, 700);
    color: $color-blue;
    margin-bottom: 12px;
  }

  &__text {
    @include typography-main(14px);
  }

  &__field {
    margin-top: 40px;
  }

  &__controls {
    margin-top: 40px;
    text-align: right;
  }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &__item {
    min-width: 25%;

    &:not(:last-child) {
      margin-right: 24px;
    }
  }
}
</style>
