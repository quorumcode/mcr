<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Form } from "@/helpers/form";

export default defineComponent({
  props: {
    form: {
      type: Object as PropType<Form>,
      required: true,
    },
  },
  emits: {
    "valid-submit": (event: Event) => !!event,
    submit: (event: Event) => !!event,
  },
  setup(props, { emit }) {
    const handleSubmit = (event: Event) => {
      if (!props.form.hasError) {
        emit("valid-submit", event);
      }
      emit("submit", event);
    };

    return {
      handleSubmit,
    };
  },
});
</script>

<template>
  <form @submit.prevent.stop="handleSubmit">
    <slot />
  </form>
</template>
