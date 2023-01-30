import { defineStore } from "pinia";
import { Company, Payment } from "@/types/commonTypes";
import { useCommonStore } from "@/stores/common";
import { ServiceError } from "@/services/ServiceError";
import { useUserStore } from "@/stores/user";
import { showErrorNotification } from "@/helpers/errorHelper";

export const useCompanySubscriptionPageStore = defineStore({
  id: "companySubscriptionPage",
  state: () => ({
    company: undefined as Company | undefined,
    iAmCompanyOwner: false,
    isPaymentsLoading: false,
    payments: [] as Payment[],
    paymentsTotal: 0,
  }),
  getters: {
    hasRealSubscription(state) {
      return !!state.company?.isRealSubscription;
    },
    hasActiveSubscription(state) {
      return state.company?.isActiveSubscription;
    },
  },
  actions: {
    async init(companyId: string) {
      const userStore = useUserStore();

      this.iAmCompanyOwner = companyId === userStore.info?.company?._id;

      if (this.company && this.payments.length) {
        return;
      }
      return Promise.all([
        this.fetchCompany(companyId),
        this.iAmCompanyOwner ? this.fetchPayments() : undefined,
      ]);
    },

    async fetchCompany(companyId: string) {
      const commonStore = useCommonStore();

      if (!companyId) {
        throw new Error("Not company ID");
      }

      const service = this.companyService;

      commonStore.startLoading();
      try {
        this.company = await service.getCompany(companyId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompany");
        }
      } finally {
        commonStore.stopLoading();
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
