<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import IconVisaCard from "@/components/icons/IconVisaCard.vue";
import IconMasterCard from "@/components/icons/IconMasterCard.vue";
import IconAmexCard from "@/components/icons/IconAmexCard.vue";
import IconOtherCard from "@/components/icons/IconOtherCard.vue";

type Type = "visa" | "amex" | "mastercard";

const iconsMap: { [type in Type]: InstanceType<any> } = {
  visa: IconVisaCard,
  amex: IconAmexCard,
  mastercard: IconMasterCard,
};

export default defineComponent({
  props: {
    type: {
      type: String as PropType<Type>,
      default: undefined,
    },
  },
  setup(props) {
    const iconComponent = computed(() => {
      if (props.type && iconsMap[props.type]) {
        return props.type ? iconsMap[props.type] : IconOtherCard;
      }
      return IconOtherCard;
    });
    return { iconComponent };
  },
});
</script>

<template>
  <component :is="iconComponent"></component>
</template>
