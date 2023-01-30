<script lang="ts">
import { computed, defineComponent, h, mergeProps, PropType, unref } from "vue";
import { Field } from "@/helpers/form";
import UiField from "@/components/UiField.vue";

export default defineComponent({
  components: {
    UiField,
  },
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    const errors = computed(() => {
      let errors = unref(props.field.serverErrors);
      if (props.field.isErrorsVisible) {
        errors = errors.concat(unref(props.field.errors));
      }
      return errors;
    });

    const newProps = computed(() =>
      mergeProps({ errors: errors.value }, attrs)
    );

    return () => h(UiField, newProps.value, slots);
  },
});
</script>
