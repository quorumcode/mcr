<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
} from "vue";
import AppCard from "@/components/AppCard.vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminPageEditStore } from "@/admin/containers/pages/pageEditStore";
import { createForm } from "@/helpers/form";
import { getRequiredValidator } from "@/helpers/validation";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiTextInput from "@/components/UiTextInput.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import { usePagesStore } from "@/stores/pages";
import { useAppConfig } from "@/appConfig";
import UiField from "@/components/UiField.vue";
import UiButton from "@/components/UiButton.vue";
import { PageCategory } from "@/types/commonTypes";
import { routesNames } from "@/routesNames";
import UiCheckbox from "@/components/UiCheckbox.vue";
import { getImage } from "@/helpers/getImage";

export default defineComponent({
  components: {
    UiButton,
    UiField,
    AppCard,
    UiFormField,
    UiForm,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormSelect: adaptForField(UiSelect),
    UiFormCheckbox: adaptForField(UiCheckbox),
  },
  async setup() {
    const { frontendExternalBaseUrl } = useAppConfig();
    const router = useRouter();
    const route = useRoute();
    const pagesStore = usePagesStore();
    const store = useAdminPageEditStore();
    const pageId = route.params.id as string | undefined;
    const page = computed(() => store.page);
    const bodyRef = ref<HTMLElement>();
    let editor: any;

    const categoryOptions = [
      {
        value: "",
        label: "Without category",
      },
      {
        value: PageCategory.forConsumer,
        label: "For Consumer",
      },
      {
        value: PageCategory.forBusiness,
        label: "For Business",
      },
      {
        value: PageCategory.ourCompany,
        label: "Our Company",
      },
    ];

    const form = createForm({
      name: {
        ref: toRef(store.form, "name"),
        validators: [getRequiredValidator()],
      },
      title: {
        ref: toRef(store.form, "title"),
        validators: [getRequiredValidator()],
      },
      subtitle: {
        ref: toRef(store.form, "subtitle"),
        validators: [],
      },
      category: {
        ref: toRef(store.form, "category"),
        validators: [],
      },
      body: {
        ref: toRef(store.form, "body"),
        validators: [],
      },
      withHeaderImage: {
        ref: toRef(store.form, "withHeaderImage"),
        validators: [],
      },
    });

    const pageRoute = computed(() => {
      return pagesStore.getPageRoute(store.form.name);
    });

    onMounted(async () => {
      const [
        { default: Editor },
        { default: EditorHeader },
        { default: EditorList },
        { default: ImageTool },
      ] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
        import("@editorjs/image"),
      ]);
      editor = new Editor({
        holder: bodyRef.value,
        placeholder: "Enter text here",
        tools: {
          header: EditorHeader,
          list: EditorList,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                /**
                 * Upload file to the server and return an uploaded image data
                 * @param {File} file - file selected from the device or pasted by drag-n-drop
                 * @return {Promise.<{success, file: {url}}>}
                 */
                async uploadByFile(file) {
                  return uploadImage(file).then((res) => {
                    return res;
                  });
                },
              },
            },
          },
        },
        data: form.fields.body.ref,
      });
    });

    const uploadImage = async (file) => {
      const image = await getImage(window.URL.createObjectURL(file));
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const imageBase64 = canvas.toDataURL("image/png");
      return await store.uploadImage(imageBase64);
    };

    onBeforeUnmount(() => {
      editor.destroy();
    });

    await store.init(pageId);

    return {
      bodyRef,
      page,
      form,
      isEdit: computed(() => store.isEdit),
      pageRoute,
      frontendExternalBaseUrl,
      categoryOptions,
      async submit() {
        const body = await editor.save();
        form.fields.body.setValue(body);
        await store.submit(pageId, form);
      },
      removePage() {
        if (!pageId) {
          return;
        }
        store.openRemovePageModal(pageId);
      },
      cancel() {
        router.push({ name: routesNames.adminDashboardPagesList });
      },
    };
  },
});
</script>

<template>
  <UiForm :form="form" class="form" @submit="submit">
    <AppCard class="form__fields fields">
      <UiFormField :field="form.fields.name" label="Name" class="fields__item">
        <UiFormTextInput :field="form.fields.name">
          <template #prefix>{{ frontendExternalBaseUrl }}/page/</template>
        </UiFormTextInput>
      </UiFormField>
      <UiFormField
        :field="form.fields.title"
        label="Title"
        class="fields__item"
      >
        <UiFormTextInput :field="form.fields.title" />
      </UiFormField>
      <UiFormField
        :field="form.fields.subtitle"
        label="Sub Title"
        class="fields__item"
      >
        <UiFormTextInput :field="form.fields.subtitle" />
      </UiFormField>
      <UiFormField
        :field="form.fields.category"
        label="Category"
        class="fields__item"
      >
        <UiFormSelect
          :field="form.fields.category"
          :options="categoryOptions"
        />
      </UiFormField>
      <div class="fields__item">
        <UiFormCheckbox :field="form.fields.withHeaderImage">
          With image header
        </UiFormCheckbox>
      </div>
    </AppCard>

    <UiField label="Page Body" class="form__body-field">
      <div
        ref="bodyRef"
        class="editor"
        :class="{ '_is-disabled': form.isDisabled }"
      ></div>
    </UiField>

    <div class="form__controls controls">
      <UiButton
        v-if="isEdit"
        view="control-secondary-danger"
        class="controls__item _danger"
        @click="removePage"
      >
        Delete Page
      </UiButton>
      <UiButton view="control-secondary" class="controls__item" @click="cancel">
        Cancel
      </UiButton>
      <UiButton view="control" type="submit" class="controls__item">
        Save
      </UiButton>
    </div>
  </UiForm>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.form {
  &__fields {
    margin-bottom: 40px;
  }

  &__body-field {
    margin-bottom: 40px;
  }
}

.fields {
  &__item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &__item {
    &:not(:last-child) {
      margin-right: 12px;

      &._danger {
        margin-right: auto;
      }
    }
  }
}

.editor {
  background-color: $color-white;
  border-radius: $rounding-medium;
  border: 2px solid $color-blue-06;
  padding: 20px 36px;

  :deep(.ce-block__content) {
    max-width: unset;
  }
  :deep(.ce-toolbar__content) {
    max-width: unset;
  }

  &._is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
