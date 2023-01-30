<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import UiModal from "@/components/UiModal.vue";
import UiButton from "@/components/UiButton.vue";
import { createForm } from "@/helpers/form";
import {
  getCreditCardCvvValidator,
  getCreditCardDateValidator,
  getCreditCardNumberValidator,
  getEmailValidator,
  getLengthValidator,
  getPatternValidator,
  getRequiredValidator,
  getWhitespaceValidator,
  Validator,
} from "@/helpers/validation";
import { adaptForField } from "@/components/formAdapters/adaptForField";
import UiTextInput from "@/components/UiTextInput.vue";
import UiFormField from "@/components/formAdapters/UiFormField.vue";
import UiForm from "@/components/formAdapters/UiForm.vue";
import UiAddressInput from "@/components/UiAddressInput.vue";
import UiField from "@/components/UiField.vue";
import { usePaymentModalStore } from "@/containers/paymentModal/store";
import UiSelect from "@/components/UiSelect.vue";
import AppCreditCard from "@/components/AppCreditCard.vue";
import UiLink from "@/components/UiLink.vue";
import IconPen from "@/components/icons/IconPen.vue";
import IconCross from "@/components/icons/IconCross.vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: {
    IconCross,
    IconPen,
    UiLink,
    AppCreditCard,
    UiField,
    UiButton,
    UiModal,
    UiFormTextInput: adaptForField(UiTextInput),
    UiFormSelect: adaptForField(UiSelect),
    UiFormField,
    UiForm,
    UiAddressInput,
  },
  emits: {
    close: () => true,
    subscribeSuccess: () => true,
  },
  async setup(props, { emit }) {
    const userStore = useUserStore();
    const store = usePaymentModalStore();
    const hasCardForm = computed(() => store.hasCardForm);

    const cardRequiredValidator = new Validator((value) => {
      if (hasCardForm.value && !value) {
        return "Please provide a valid value";
      }
    }).stop();

    const form = createForm({
      cardNumber: {
        ref: toRef(store.form, "cardNumber"),
        validators: [
          cardRequiredValidator,
          getCreditCardNumberValidator(),
          getWhitespaceValidator(),
        ],
      },
      cardDate: {
        ref: toRef(store.form, "cardDate"),
        validators: [
          cardRequiredValidator,
          getCreditCardDateValidator(),
          getWhitespaceValidator(),
        ],
      },
      cardCvv: {
        ref: toRef(store.form, "cardCvv"),
        validators: [
          cardRequiredValidator,
          getCreditCardCvvValidator(),
          getWhitespaceValidator(),
        ],
      },
      name: {
        ref: toRef(store.form, "name"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getPatternValidator(),
          getWhitespaceValidator(),
        ],
      },
      email: {
        ref: toRef(store.form, "email"),
        validators: [
          getRequiredValidator(),
          getEmailValidator(),
          getWhitespaceValidator(),
        ],
      },
      town: {
        ref: toRef(store.form, "town"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getPatternValidator(),
          getWhitespaceValidator(),
        ],
      },
      countryCode: {
        ref: toRef(store.form, "countryCode"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getPatternValidator(),
          getWhitespaceValidator(),
        ],
      },
      line1: {
        ref: toRef(store.form, "line1"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getPatternValidator(),
          getWhitespaceValidator(),
        ],
      },
      postalCode: {
        ref: toRef(store.form, "postalCode"),
        validators: [
          getRequiredValidator(),
          getLengthValidator({ maxChars: 128 }),
          getPatternValidator(),
          getWhitespaceValidator(),
        ],
      },
    });

    const countriesOptions = computed(() => {
      return store.countries.map((country) => ({
        value: country.code,
        label: country.name,
      }));
    });

    // await store.init();

    return {
      form,
      hasCardForm,
      countriesOptions,
      hasRealSubscription: computed(() => userStore.hasRealSubscription),
      savedCard: computed(() => store.savedCard),
      updateAddress: store.updateAddress,
      editCard: store.editCard,
      cancelCardEdit: store.cancelCardEdit,
      submit: async () => {
        const isSuccess = await store.submit(form);
        if (isSuccess) {
          emit("close");
          emit("subscribeSuccess");
        }
      },
    };
  },
});
</script>

<template>
  <UiModal @close="$emit('close')" class="app-payment-modal">
    <UiForm :form="form" class="app-payment-modal__content" @submit="submit">
      <div class="app-payment-modal__title">Payment Method</div>
      <div class="app-payment-modal__form fields">
        <div class="fields__item">
          <div class="card-header">
            <div class="card-header__label">Credit Card</div>
            <div class="card-header__button">
              <UiLink
                v-if="hasCardForm && savedCard"
                :is-disabled="form.isDisabled"
                @click.stop="cancelCardEdit"
              >
                <template #icon>
                  <IconCross />
                </template>
                Cancel
              </UiLink>
              <UiLink
                v-else-if="!hasCardForm"
                :is-disabled="form.isDisabled"
                @click.stop="editCard"
              >
                <template #icon>
                  <IconPen />
                </template>
                Edit
              </UiLink>
            </div>
          </div>

          <AppCreditCard
            v-if="savedCard && !hasCardForm"
            :type="savedCard.type"
            :last-digits="savedCard.lastDigits"
            :month="savedCard.month"
            :year="savedCard.year"
          />

          <div v-if="hasCardForm" class="card-form">
            <UiFormField
              :field="form.fields.cardNumber"
              class="card-form__item"
            >
              <UiFormTextInput
                :field="form.fields.cardNumber"
                placeholder="5200 0000 0000 0000"
                :mask="{ mask: '0000 0000 0000 0000' }"
              />
            </UiFormField>
            <div class="card-form__item card-form-group">
              <UiFormField
                :field="form.fields.cardDate"
                class="card-form-group__item"
              >
                <UiFormTextInput
                  :field="form.fields.cardDate"
                  placeholder="MM / YY"
                  :mask="{ mask: '00 / 00' }"
                  :maskCardDateRange="true"
                />
              </UiFormField>
              <UiFormField
                :field="form.fields.cardCvv"
                class="card-form-group__item"
              >
                <UiFormTextInput
                  :field="form.fields.cardCvv"
                  placeholder="CVV"
                  :mask="{ mask: '000[0]' }"
                />
              </UiFormField>
            </div>
          </div>
        </div>

        <UiFormField
          class="fields__item"
          :field="form.fields.name"
          label="Full Name"
        >
          <UiFormTextInput
            :field="form.fields.name"
            :mask="{ mask: /^[A-Z ]+$/i }"
            placeholder="Enter your full name"
          />
        </UiFormField>
        <UiFormField
          class="fields__item"
          :field="form.fields.email"
          label="Email"
        >
          <UiFormTextInput
            :field="form.fields.email"
            placeholder="Enter your email"
          />
        </UiFormField>

        <div class="fields__item address-grid">
          <UiField label="Address" class="address-grid__search">
            <UiAddressInput
              placeholder="Find your address"
              :is-disabled="form.isDisabled"
              @change="updateAddress"
            ></UiAddressInput>
          </UiField>
          <UiFormField
            class="address-grid__line1"
            :field="form.fields.line1"
            :show-errors-text="false"
          >
            <UiFormTextInput
              :field="form.fields.line1"
              placeholder="123 Street"
            />
          </UiFormField>
          <UiFormField class="address-grid__town" :field="form.fields.town">
            <UiFormTextInput :field="form.fields.town" placeholder="City" />
          </UiFormField>
          <UiFormField
            class="address-grid__country-code"
            :field="form.fields.countryCode"
          >
            <UiFormSelect
              :field="form.fields.countryCode"
              :options="countriesOptions"
              placeholder="Country"
            />
          </UiFormField>
          <UiFormField
            class="address-grid__postal-code"
            :field="form.fields.postalCode"
          >
            <UiFormTextInput
              :field="form.fields.postalCode"
              placeholder="Postcode"
            />
          </UiFormField>
        </div>
      </div>

      <div class="app-payment-modal__buttons">
        <UiButton
          class="app-payment-modal__button"
          view="secondary"
          :is-disabled="form.isDisabled"
          @click="$emit('close')"
        >
          Cancel
        </UiButton>
        <UiButton
          class="app-payment-modal__button"
          type="submit"
          :is-disabled="form.isDisabled"
        >
          <template v-if="hasRealSubscription">Save</template>
          <template v-else>Subscribe</template>
        </UiButton>
      </div>
    </UiForm>
  </UiModal>
</template>

<style lang="scss" scoped>
@import "@/styles/typography.scss";
@import "@/styles/color.scss";

.app-payment-modal {
  margin-left: 0 !important;

&__content {
    width: 350px;
    max-width: 100%;
  }

  &__title {
    @include typography-main(20px, 700);
    margin: 0;
    margin-bottom: 24px;
    color: $color-blue;
  }

  &__form {
    margin-bottom: 40px;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__button {
    &:not(:last-child) {
      margin-right: 24px;
    }
  }
}

.fields {
  margin-bottom: 40px;

  &__item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  &__label {
    @include typography-main(16px, 600);
    display: block;
    color: $color-blue;
  }

  &__button {
    line-height: 0;
  }
}

.address-grid {
  display: grid;
  // grid-template-areas: "a1 a2 a2" "b1 b1 b2" "c1 c1";
  // grid-template-columns: 25% 25% 50%;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 12px;
  grid-row-gap: 12px;

  &__search {
    grid-column: span 4;
  }

  &__line1 {
    grid-column: span 4;
  }

  &__town {
    grid-column: span 2;
  }

  &__postal-code {
    grid-column: span 2;
  }

  &__country-code {
    grid-column: span 2;
  }
}

.card-form {
  &__item {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
}

.card-form-group {
  display: flex;
  align-items: flex-start;

  &__item {
    &:not(:last-child) {
      margin-right: 12px;
    }
  }
}
</style>
