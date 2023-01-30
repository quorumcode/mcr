<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { routesNames } from "@/routesNames";

export default defineComponent({
  async setup() {
    const userStore = useUserStore();
    const router = useRouter();

    userStore.logout();
    // Reload page
    const { href } = router.resolve({ name: routesNames.home });
    window.location.href = href;
    return {};
  },
});
</script>
