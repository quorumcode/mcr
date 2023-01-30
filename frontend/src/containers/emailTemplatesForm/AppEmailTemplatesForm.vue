<script lang="ts">
import { computed, defineComponent, PropType, ref, toRef } from "vue";
import { EmailTemplateName } from "@/types/commonTypes";
import { useEmailTemplatesFormStore } from "@/containers/emailTemplatesForm/store";
import { createForm } from "@/helpers/form";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiTextInput from "@/components/UiTextInput.vue";
import UiRadioButtonsInput from "@/components/UiRadioButtonsInput.vue";
import UiTextarea from "@/components/UiTextarea.vue";
import UiButton from "@/components/UiButton.vue";
import { getNumberValidator } from "@/helpers/validation";
import { getErrorText } from "@/helpers/errorHelper";

const emailTemplatesTitlesMap: Record<EmailTemplateName, string> = {
  [EmailTemplateName.invitation]: "Review Invitation",
  [EmailTemplateName.reminder]: "Reminder",
};

export default defineComponent({
  components: {
    UiForm,
    UiFormField,
    UiFormTextInput: adaptForField(UiTextInput),
    UiRadioButtonsInput,
    UiTextarea,
    UiButton,
  },
  props: {
    initialSelectedTemplate: {
      type: String as PropType<EmailTemplateName>,
      default: EmailTemplateName.invitation,
    },
    isProfilePage: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    selectTemplate: (value: EmailTemplateName) => value,
    clickOnButtons: () => true,
    saveTemplates(payload: Promise<void>) {
      return payload;
    },
  },
  async setup(props, { emit }) {
    const store = useEmailTemplatesFormStore();
    const templates = toRef(store, "templates");

    const invitationReminderDelayMin = (import.meta.env
      .VITE_INVITATION_REMINDER_DELAY_MIN || "7") as string;
    const invitationReminderDelayMax = (import.meta.env
      .VITE_INVITATION_REMINDER_DELAY_MAX || "60") as string;
    const errorText = getErrorText(
      "ReminderDelayLimitExceeded",
      "patchCompany",
      [{ invitationReminderDelayMin }, { invitationReminderDelayMax }]
    );
    store.reminderErrorText = errorText;

    const form = createForm({
      reminderDelay: {
        ref: toRef(store.form, "reminderDelay"),
        validators: [
          getNumberValidator({
            minNum: parseInt(invitationReminderDelayMin),
            maxNum: parseInt(invitationReminderDelayMax),
            customText: errorText,
          }),
        ],
      },
    });

    const templatesItems = computed(() => {
      return Object.keys(templates.value).map((name) => ({
        value: name,
        title: emailTemplatesTitlesMap[name as EmailTemplateName] || name,
      }));
    });
    const selectedTemplateName = ref<EmailTemplateName>(
      props.initialSelectedTemplate
    );
    const highlightedIntervals = ref(store.matches);

    const selectTemplate = (value: EmailTemplateName) => {
      selectedTemplateName.value = value;
      emit("selectTemplate", value);
    };

    const saveTemplates = async () => {
      await store.saveTemplates();
    };

    const submitForm = async () => {
      if (form.hasError) {
        return;
      }
      emit("saveTemplates");
    };

    await store.fetchTemplates();
    form.setErrorsVisible(true);
    
    return {
      templates,
      templatesItems,
      selectedTemplateName,
      selectTemplate,
      saveTemplates, // Public
      form,
      highlightedIntervals,
      hideHighlight: store.hideHighlight,
      submitForm,
      isNoChanges: computed(() => store.isNoChanges),
    };
  },
});
</script>

<template>
  <div class="email-ettings">
    <h2 class="email-ettings__sub-title">Invitation Reminder</h2>
    <p class="email-ettings__text">
      How many days after the review invitation do you want the reminder to be
      sent?
    </p>

    <UiForm :form="form" class="email-ettings__form">
      <span class="email-ettings__form-text">
        Send my clients a reminder in
      </span>
      <UiFormField :field="form.fields.reminderDelay" place="reminderDelay">
        <UiFormTextInput
          :field="form.fields.reminderDelay"
          place="byBCC"
          class="email-ettings__form-input"
          type="number"
        />
      </UiFormField>
      <span class="email-ettings__form-text">days</span>
    </UiForm>
    <h2 class="email-ettings__sub-title">Email Template</h2>
    <div class="email-ettings__templates">
      <UiRadioButtonsInput
        tab-style="button"
        :model-value="selectedTemplateName"
        :items="templatesItems"
        @update:modelValue="selectTemplate"
        @click="$emit('clickOnButtons')"
      />
      <div class="email-ettings__templates-input">
        <template v-for="item in templatesItems" :key="item.value">
          <UiTextarea
            v-if="selectedTemplateName === item.value"
            v-model="templates[item.value]"
            :max-height="150"
            :min-height="100"
            :highlighted-intervals="highlightedIntervals[item.value]"
            @update:modelValue="hideHighlight(item.value)"
          />
        </template>
      </div>
    </div>
    <UiButton
      v-if="isProfilePage"
      class="button"
      view="primary"
      @click="submitForm"
      :isDisabled="isNoChanges"
    >
      Save
    </UiButton>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.email-ettings {
  &__sub-title {
    @include typography-main(16px, 600);
    color: $color-blue;
    margin: 40px 0 0;

    &:first-child {
      margin: 0;
    }
  }

  &__text {
    @include typography-main(12px);
    color: $color-black;
    margin: 0;
  }

  &__form {
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 12px;

    &-text {
      @include typography-main(12px);

      &:first-child {
        margin-right: 12px;
      }

      &:last-child {
        margin-left: 12px;
      }
    }

    &-input {
      height: 52px;
      width: 100px;
      box-sizing: border-box;
    }
  }
}

.email-ettings__templates {
  margin-top: 12px;

  &-input {
    margin-top: 12px;
  }
}

.button {
  min-width: 168px;
  margin: 40px 0 0 auto;
  display: block;
}
</style>
