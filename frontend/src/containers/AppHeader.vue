<script lang="ts">
import { computed, defineComponent, h, mergeProps } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: { AppHeader },
  setup(props, { attrs, slots }) {
    const userStore = useUserStore();

    const newProps = computed(() =>
      mergeProps({ isUserLogged: userStore.isLogged }, attrs)
    );

    return () => h(AppHeader, newProps.value, slots);
  },
});
</script>
