import { defineStore } from "pinia";
import { CardType, Country, Payment } from "@/types/commonTypes";
import { Form } from "@/helpers/form";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { ServiceError } from "@/services/ServiceError";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FormFields {
  cardNumber: string;
  cardDate: string; // 0121 (2 digits month & 2 digits year)
  cardCvv: string;
  name: string;
  email: string;
  town: string;
  countryCode: string;
  line1: string;
  postalCode: string;
}

interface SavedCard {
  lastDigits: string; //  4242
  type: CardType | undefined;
  month: number;
  year: number;
}

interface UpdateAddressPayload {
  route: string;
  streetNumber: string;
  town: string;
  administrativeDivision: string;
  postalCode: string;
  countryCode: string;
}

export const usePaymentModalStore = defineStore({
  id: "paymentModal",
  state: () => ({
    countries: [] as Country[],
    savedCard: undefined as SavedCard | undefined,
    savedCardName: "",
    isCardEdit: false,
    form: {
      cardNumber: "",
      cardDate: "",
      cardCvv: "",
      name: "",
      email: "",
      town: "",
      countryCode: "",
      line1: "",
      postalCode: "",
    } as FormFields,
    payments: [] as Payment[],
    isPaymentsLoading: false,
    paymentsTotal: 0,
  }),
  getters: {
    hasCardForm: (state) => state.isCardEdit || !state.savedCard,
  },
  actions: {
    init() {
      return Promise.all([this.fetchCountries(), this.fetchBillingData()]);
    },

    async fetchCountries() {
      const commonStore = useCommonStore();
      const service = this.commonService;

      commonStore.startLoading();
      try {
        this.countries = await service.getCountries();
      } catch (e) {
        const errText = getErrorText("GetCountries", "getCountries");
        commonStore.showNotification("error", errText);
        console.error(e);
      } finally {
        commonStore.stopLoading();
      }
    },

    async fetchBillingData() {
      const commonStore = useCommonStore();
      commonStore.startLoading();

      try {
        const paymentMethod = await this.getPaymentMethod();
        if (!paymentMethod) {
          return;
        }
        this.form.name = paymentMethod.name;
        this.form.email = paymentMethod.email;
        this.form.town = paymentMethod.address.town;
        this.form.countryCode = paymentMethod.address.countryCode;
        this.form.line1 = paymentMethod.address.line1;
        this.form.postalCode = paymentMethod.address.postalCode;
        this.savedCardName = paymentMethod.name;
        this.savedCard = {
          type: paymentMethod.card.type,
          lastDigits: paymentMethod.card.lastDigits,
          month: paymentMethod.card.month,
          year: paymentMethod.card.year,
        };
      } catch (e) {
        console.error(e);
      } finally {
        commonStore.stopLoading();
      }
    },

    editCard() {
      this.isCardEdit = true;
    },

    cancelCardEdit() {
      this.isCardEdit = false;
      this.form.cardNumber = "";
      this.form.cardDate = "";
      this.form.cardCvv = "";
    },

    updateAddress(address: UpdateAddressPayload) {
      this.form.line1 = `${address.streetNumber} ${address.route}`;
      this.form.town = address.town;
      this.form.countryCode = address.countryCode;
      this.form.postalCode = address.postalCode;
    },

    async submit(form: Form<FormFields>) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      const commonStore = useCommonStore();
      const userStore = useUserStore();

      form.setDisabled(true);
      commonStore.startLoading();
      try {
        await this.updatePaymentMethod();

        const paymentMethod = await this.getPaymentMethod();
        if (!paymentMethod) {
          return;
        }

        this.savedCard = {
          type: paymentMethod.card.type,
          lastDigits: paymentMethod.card.lastDigits,
          month: paymentMethod.card.month,
          year: paymentMethod.card.year,
        };
        this.savedCardName = this.form.name;

        if (userStore.subscriptionStatus === "activeWillBeCanceled") {
          await this.resubscribe();
        } else if (!userStore.hasRealSubscription) {
          const result = await this.subscribe();
          if (result?.requiresAction) {
            const confirmResult = await this.stripe?.confirmCardPayment(
              result.clientSecret
            );
            if (confirmResult?.error) {
              console.error(confirmResult);
              return commonStore.showNotification(
                "error",
                confirmResult?.error.message || "Unrecognized error"
              );
            }
          }
        }
        await userStore.checkSubscriptionProgress();
        commonStore.showNotification(
          "success",
          "Your card details have been saved"
        );
        return true;
      } catch (e) {
        commonStore.showNotification("error", "Update payment method error");
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },

    async subscribe() {
      const service = this.billingService;

      try {
        return await service.subscribe();
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "subscribe");
          return;
        }
      }
    },

    async updatePaymentMethod() {
      const service = this.billingService;

      try {
        await service.updatePaymentMethod({
          name: this.form.name,
          email: this.form.email,
          card: this.hasCardForm
            ? {
                number: this.form.cardNumber,
                month: this.form.cardDate.slice(0, 2),
                year: this.form.cardDate.slice(2, 4),
                cvv: this.form.cardCvv,
              }
            : undefined,
          address: {
            town: this.form.town,
            countryCode: this.form.countryCode,
            line1: this.form.line1,
            postalCode: this.form.postalCode,
          },
        });
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "updatePaymentMethod");
        }
      }
    },

    async getPaymentMethod() {
      const service = this.billingService;
      try {
        return await service.getPaymentMethod();
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getPaymentMethod");
        }
      }
    },

    async resubscribe() {
      const service = this.billingService;
      try {
        return await service.resubscribe();
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "resubscribe");
        }
      }
    },

    async fetchPayments(isMore = false) {
      const service = this.billingService;
      const skip = isMore ? this.payments.length : 0;

      this.isPaymentsLoading = true;
      try {
        const result = await service.getPayments({
          limit: 20,
          skip,
        });

        if (isMore) {
          this.payments = this.payments.concat(result.data);
        } else {
          this.payments = result.data;
        }
        this.paymentsTotal = result.meta.total;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getPayments");
        }
      } finally {
        this.isPaymentsLoading = false;
      }
    },
  },
});
