// @ts-nocheck
import { computed, ComputedRef, ref, Ref, reactive, UnwrapRef } from "vue";
import { combineValidators, Validator } from "@/helpers/validation";

type FieldConfig<T> = {
  ref: Ref<T>;
  validators: Validator<T>[];
};

type FieldsMap = Record<string, any>;

type Config<M extends FieldsMap> = {
  [fieldId in keyof M]: FieldConfig<M[fieldId]>;
};

export type Field<T> = UnwrapRef<{
  ref: Ref<T>;
  errors: ComputedRef<string[]>;
  serverErrors: Ref<string[]>;
  hasError: ComputedRef<boolean>;
  isErrorsVisible: Ref<boolean>;
  isDisabled: Ref<boolean>;
  setValue(value: T): void;
  setErrorsVisible(value: boolean): void;
  setDisabled(value: boolean): void;
  setServerErrors(value: string[]): void;
}>;

type Fields<M extends FieldsMap> = {
  [fieldId in keyof M]: Field<M[fieldId]>;
};

export type Form<M extends FieldsMap> = UnwrapRef<{
  isErrorsVisible: Ref<boolean>;
  fields: Fields<M>;
  hasError: ComputedRef<boolean>;
  isDisabled: Ref<boolean>;
  setErrorsVisible(value: boolean): void;
  setDisabled(value: boolean): void;
  setValues(data: { [fieldId in keyof M]?: M[fieldId] }): void;
}>;

export function createForm<M extends FieldsMap>(config: Config<M>): Form<M> {
  const fieldsIds = Object.keys(config) as Array<keyof M>;
  const isErrorsVisible = ref(false);
  const isDisabled = ref(false);
  const fields = fieldsIds.reduce((result, fieldId) => {
    result[fieldId] = createField(config[fieldId], {
      isFormErrorsVisible: isErrorsVisible,
      isFormDisabled: isDisabled,
    });
    return result;
  }, {} as Fields<M>);

  return reactive({
    fields,
    isErrorsVisible,
    isDisabled,
    hasError: computed(() => {
      const fieldsIds = Object.keys(fields) as Array<keyof M>;
      return fieldsIds.some((fieldId) => {
        return fields[fieldId].hasError;
      });
    }),
    setErrorsVisible(value: boolean) {
      isErrorsVisible.value = value;
    },
    setDisabled(value: boolean) {
      isDisabled.value = value;
    },
    setValues(data: M) {
      Object.keys(data).forEach((fieldId) => {
        fields[fieldId].setValue(data[fieldId]);
      });
    },
  });
}

export function createField<T>(
  config: FieldConfig<T>,
  {
    isFormErrorsVisible,
    isFormDisabled,
  }: { isFormErrorsVisible: Ref<boolean>; isFormDisabled: Ref<boolean> }
): Field<T> {
  const isFieldErrorsVisible = ref(false);
  const isDisabled = ref(false);
  const serverErrors = ref<string[]>([]);

  const errors = computed(() => {
    const validator = combineValidators(...config.validators);
    const result = validator.validate(config.ref.value);
    if (result) {
      return ([] as string[]).concat(result);
    }
    return [];
  });

  return reactive({
    ref: config.ref,
    errors,
    serverErrors,
    hasError: computed(
      () => !!errors.value.length || !!serverErrors.value.length
    ),
    isErrorsVisible: computed(() => {
      return isFormErrorsVisible.value || isFieldErrorsVisible.value;
    }),
    isDisabled: computed(() => {
      return isFormDisabled.value || isDisabled.value;
    }),
    setValue(value: T) {
      config.ref.value = value;
    },
    setErrorsVisible(value: boolean) {
      isFieldErrorsVisible.value = value;
    },
    setDisabled(value: boolean) {
      isDisabled.value = value;
    },
    setServerErrors(value: string[]) {
      serverErrors.value = value;
    },
  });
}
