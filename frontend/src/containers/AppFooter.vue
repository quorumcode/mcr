<script lang="ts">
import { computed, defineComponent, h, mergeProps } from "vue";
import AppFooter from "@/components/AppFooter.vue";
import { usePagesStore } from "@/stores/pages";
import { useRouter } from "vue-router";
import { routesNames } from "@/routesNames";
import { PageCategory } from "@/types/commonTypes";

type SectionsLinks = {
  [sectionTitle: string]: {
    [pageTitle: string]: string;
  };
};

const pagesCategoriesTitlesMap: { [category: PageCategory]: string } = {
  [PageCategory.ourCompany]: "Our Company",
  [PageCategory.forBusiness]: "For Businesses",
  [PageCategory.forConsumer]: "For Consumers",
};

export default defineComponent({
  components: { AppFooter },
  setup(props, { attrs, slots }) {
    const router = useRouter();
    const pagesStore = usePagesStore();

    const sectionsLinks = computed<SectionsLinks>(() => {
      return pagesStore.pages.reduce((result, page) => {
        if (!page.category) {
          return result;
        }
        const categoryTitle = pagesCategoriesTitlesMap[page.category];
        if (!result[categoryTitle]) {
          result[categoryTitle] = {};
        }
        result[categoryTitle][page.title] = router.resolve({
          name: routesNames.page,
          params: { name: page.name },
        }).href;
        return result;
      }, {} as SectionsLinks);
    });

    const newProps = computed(() =>
      mergeProps({ sectionsLinks: sectionsLinks.value }, attrs)
    );

    return () => h(AppFooter, newProps.value, slots);
  },
});
</script>
