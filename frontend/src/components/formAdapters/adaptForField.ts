import { computed, defineComponent, h, mergeProps, PropType } from "vue";
import { Field } from "@/helpers/form";
import { getFieldProps } from "@/components/formAdapters/getFieldProps";

export function adaptForField(InputComponent: any) {
  return defineComponent({
    components: {
      InputComponent,
    },
    props: {
      field: {
        type: Object as PropType<Field>,
        required: true,
      },
    },
    setup(props, { attrs, slots }) {
      const newProps = computed(() =>
        mergeProps(getFieldProps(props.field), attrs)
      );

      return () => h(InputComponent, newProps.value, slots);
    },
  });
}
