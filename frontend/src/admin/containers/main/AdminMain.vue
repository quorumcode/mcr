<script lang="ts">
import { computed, defineComponent } from "vue";
import { UserRole } from "@/types/commonTypes";
import { useUserStore } from "@/stores/user";
import AdminMainManagerContent from "./AdminMainManagerContent.vue";
import AdminMainSupportContent from "./AdminMainSupportContent.vue";

export default defineComponent({
  components: {
    AdminMainManagerContent,
    AdminMainSupportContent,
  },
  async setup() {
    const userStore = useUserStore();

    const contentComponentName = computed(() => {
      if (userStore.info?.role === UserRole.manager) {
        return "AdminMainManagerContent";
      } else if (userStore.info?.role === UserRole.support) {
        return "AdminMainSupportContent";
      }
      return undefined;
    });

    return { contentComponentName };
  },
});
</script>

<template>
  <component v-if="contentComponentName" :is="contentComponentName" />
</template>
