<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import IconMagnifier from "@/components/icons/IconMagnifier.vue";
import { Loader } from "@googlemaps/js-api-loader";
import UiTextInput from "@/components/UiTextInput.vue";

type Place = {
  route: string;
  streetNumber: string;
  town: string;
  administrativeDivision: string;
  postalCode: string;
  countryCode: string;
  state?: string;
};

export default defineComponent({
  components: {
    IconMagnifier,
    UiTextInput,
  },
  props: {
    hasError: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    change: (payload: Place) => payload,
  },
  setup(props, { emit }) {
    const value = ref("");
    const inputRef = ref<HTMLInputElement>();
    let autocomplete;
    let autocompleteListener;
    let gmFailed = ref(false);

    const saveInputRef = (ref: HTMLInputElement) => {
      inputRef.value = ref;
    };

    onMounted(() => {
      const googleApiLoader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY as string,
        libraries: ["places"],
      });
      googleApiLoader.load().then(() => {
        autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.value as HTMLInputElement
        );
        autocomplete.setComponentRestrictions({ country: ["AU", "NZ"] });
        autocompleteListener = autocomplete.addListener("place_changed", () => {
          emit("change", getFormattedPlace(autocomplete.getPlace()));
        });
      });
      window.gm_authFailure = () => {
        gmFailed.value = true;
        inputRef.value.style.background = null;
        inputRef.value.placeholder = "Google Maps API error";
        value.value = "";
      };
    });

    onBeforeUnmount(() => {
      window.google.maps.event.removeListener(autocompleteListener);
      window.gm_authFailure = undefined;
    });

    return {
      value,
      saveInputRef,
      gmFailed,
    };
  },
});

// eslint-disable-next-line no-undef
function getFormattedPlace(googlePlace: google.maps.places.PlaceResult): Place {
  const addressTypesMap: {
    [type: string]: {
      long: string;
      short: string;
    };
  } = googlePlace.address_components?.reduce((result, component) => {
    result[component.types[0]] = {
      long: component.long_name,
      short: component.short_name,
    };
    return result;
  }, {});

  return {
    route: addressTypesMap.route?.long || "",
    streetNumber: addressTypesMap.street_number?.long || "",
    town:
      addressTypesMap.postal_town?.long || addressTypesMap.locality?.long || "",
    administrativeDivision:
      addressTypesMap.country?.long ||
      addressTypesMap.administrative_area_level_2?.long ||
      "",
    countryCode: addressTypesMap.country?.short || "",
    postalCode: addressTypesMap.postal_code?.long || "",
    state: addressTypesMap.administrative_area_level_1?.short || "",
  };
}
</script>

<template>
  <UiTextInput
    :placeholder="placeholder"
    :is-disabled="isDisabled || gmFailed"
    v-model="value"
    @mounted="saveInputRef"
  >
    <template v-slot:suffix>
      <IconMagnifier />
    </template>
  </UiTextInput>
</template>

<style lang="scss">
// Global styles for google autocomplete dropdown
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/shadow.scss";
@import "@/styles/rounding.scss";

.pac-container {
  @include typography-main;
  @include shadow-medium;
  border-top: none;
  border-radius: $rounding-medium;
  color: $color-black;
}

.pac-item-query {
  @include typography-main;
  flex-shrink: 0;
  flex-grow: 0;
  color: $color-black;
}

.pac-item {
  @include typography-main(12px);
  display: flex;
  align-items: baseline;
  padding: 14px 12px;
  border: none;
  border-radius: $rounding-medium;
  color: $color-black;

  & > *:not(.pac-item-query, .pac-icon) {
    flex-shrink: 1;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    text-align: left;
  }

  &:hover {
    background-color: $color-blue-06;
  }
}

.pac-icon {
  margin: 0;
  flex-shrink: 0;
  flex-grow: 0;
  margin-right: 6px;
  position: relative;
  top: 5px;
}

.pac-logo:after {
  display: none;
}
</style>
