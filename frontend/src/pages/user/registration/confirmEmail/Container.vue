<script lang="ts">
import { defineComponent } from "vue";
import { useRegistrationConfirmEmailPageStore } from "./store";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const store = useRegistrationConfirmEmailPageStore();
    const route = useRoute();

    return {
      confirmEmail: () => {
        store.confirmEmail(route);
      },
    };
  },
  mounted() {
    this.confirmEmail();
  },
});
</script>

<template>
  <div></div>
</template>
