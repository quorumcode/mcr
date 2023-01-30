import { Field } from "@/helpers/form";

export function getFieldProps(field: Field) {
  return {
    modelValue: field.ref,
    "onUpdate:modelValue": (value: any) => field.setValue(value),
    hasError:
      (field.hasError && field.isErrorsVisible) || !!field.serverErrors.length,
    isDisabled: field.isDisabled,
    onChange: () => field.setServerErrors([]),
  };
}
