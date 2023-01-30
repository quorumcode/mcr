import { RouteRecordRaw } from "vue-router";
import { routesNames } from "@/routesNames";
import AppCompanyDashboardLayout from "@/containers/companyDashboardLayout/AppCompanyDashboardLayout.vue";
import HomePage from "@/pages/home/Container.vue";
import LoginPage from "@/pages/user/login/Container.vue";
import LogoutPage from "@/pages/user/logout/Container.vue";
import ForgotPasswordPage from "@/pages/user/forgotPassword/Container.vue";
import NewPasswordPage from "@/pages/user/newPassword/Container.vue";
import RegistrationPage from "@/pages/user/registration/registration/Container.vue";
import RegistrationBusinessInfoPage from "@/pages/user/registration/businessInfo/Container.vue";
import RegistrationAdditionalInfoPage from "@/pages/user/registration/additionalInfo/Container.vue";
import RegistrationConfirmEmailPage from "@/pages/user/registration/confirmEmail/Container.vue";
import DashboardStats from "@/pages/dashboard/stats/Container.vue";
import DashboardGetReviews from "@/pages/dashboard/getReviews/Container.vue";
import DashboardReviews from "@/pages/dashboard/reviews/Container.vue";
import CompanySearchPage from "@/pages/company/search/Container.vue";
import CompanyProfilePage from "@/pages/company/profile/Container.vue";
import CompanyEditUserAccount from "@/pages/company/edit/user-account/Container.vue";
import CompanyPaymentHistory from "@/pages/company/edit/user-account/payment-history/Container.vue";
import CompanyEditBusinessProfile from "@/pages/company/edit/business-profile/Container.vue";
import CompanyEditSubscription from "@/pages/company/edit/subscription/Container.vue";
import CompanyShareYourReviews from "@/pages/company/share-your-reviews/Container.vue";
import CompanyEditEmailTemplate from "@/pages/company/edit/email-template/Container.vue";
import CompanyAddReview from "@/pages/company/addReview/Container.vue";
import WidgetEditor from "@/pages/widget/editor/Container.vue";
import WidgetView from "@/pages/widget/view/Container.vue";
import Page from "@/pages/page/Container.vue";
import AccessForbidden from "@/pages/error/accessForbidden/Container.vue";
import Support from "@/pages/support/Container.vue";
// Admin pages
import AdminDashboardLayout from "@/admin/containers/dashboardLayout/AdminDashboardLayout.vue";
import AdminMain from "@/admin/containers/main/AdminMain.vue";
import AdminReportedReviews from "@/admin/containers/reportedReviews/AdminReportedReviews.vue";
import AdminPages from "@/admin/containers/pages/AdminPages.vue";
import AdminPagesList from "@/admin/containers/pages/AdminPagesList.vue";
import AdminEditPage from "@/admin/containers/pages/AdminEditPage.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: routesNames.home,
    component: HomePage,
    meta: {
      title: "Genuine Reviews for Business",
    },
  },
  {
    path: "/error",
    name: routesNames.error,
    component: HomePage,
    meta: {
      title: "Error",
    },
  },
  {
    path: "/access-forbidden",
    name: routesNames.accessForbidden,
    component: AccessForbidden,
    meta: {
      title: "403 Access Forbidden",
    },
  },
  {
    path: "/login",
    name: routesNames.login,
    component: LoginPage,
    meta: {
      requiresGuest: true,
      title: "Login",
    },
  },
  {
    path: "/logout",
    name: routesNames.logout,
    component: LogoutPage,
    meta: {
      title: "Logout",
    },
  },
  {
    path: "/forgot-password",
    name: routesNames.forgotPassword,
    component: ForgotPasswordPage,
    meta: {
      requiresGuest: true,
      title: "Forgot Password",
    },
  },
  {
    path: "/new-password/:code",
    name: routesNames.newPassword,
    component: NewPasswordPage,
    meta: {
      requiresGuest: true,
      title: "New Password",
    },
  },
  {
    path: "/registration",
    name: routesNames.registration,
    component: RegistrationPage,
    meta: {
      requiresGuest: true,
      title: "Registration",
    },
  },
  {
    path: "/registration/business-info",
    name: routesNames.registrationBusinessInfo,
    component: RegistrationBusinessInfoPage,
    meta: {
      title: "Business Info",
    },
  },
  {
    path: "/registration/additional-info",
    name: routesNames.registrationAdditionalInfo,
    component: RegistrationAdditionalInfoPage,
    meta: {
      title: "Additional Info",
    },
  },
  {
    path: "/registration/confirm-email/:code",
    name: routesNames.registrationConfirmEmail,
    component: RegistrationConfirmEmailPage,
    meta: {
      title: "Confirm Email",
    },
  },
  {
    path: "/dashboard",
    name: routesNames.dashboard,
    component: AppCompanyDashboardLayout,
    meta: {
      requiresAuth: true,
      requiresSubscription: true,
    },
    redirect: { name: routesNames.dashboardReviews },
    children: [
      {
        path: "stats",
        name: routesNames.dashboardStats,
        component: DashboardStats,
        meta: {
          title: "Stats",
        },
      },
      {
        path: "get-reviews",
        name: routesNames.dashboardGetReviews,
        component: DashboardGetReviews,
        meta: {
          title: "Get Reviews",
        },
      },
      {
        path: "reviews",
        name: routesNames.dashboardReviews,
        component: DashboardReviews,
        meta: {
          title: "My Reviews",
        },
      },
    ],
  },
  {
    path: "/company/search",
    name: routesNames.companySearch,
    component: CompanySearchPage,
    meta: {
      title: "Company Search",
    },
  },
  {
    path: "/company/:id",
    name: routesNames.companyProfile,
    component: CompanyProfilePage,
    meta: {
      title: "Company Profile",
    },
  },
  {
    path: "/company/:id/edit",
    name: routesNames.companyEdit,
    redirect: {
      name: routesNames.companyEditUserAccount,
    },
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "User Account",
    },
  },
  {
    path: "/company/:id/edit/user-account",
    name: routesNames.companyEditUserAccount,
    component: CompanyEditUserAccount,
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "User Account",
    },
  },
  {
    path: "/company/:id/edit/user-account/payment-history",
    name: routesNames.companyPaymentHistory,
    component: CompanyPaymentHistory,
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "Payment History",
    },
  },
  {
    path: "/company/:id/edit/business-profile",
    name: routesNames.companyEditBusinessProfile,
    component: CompanyEditBusinessProfile,
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "Edit Business Profile",
    },
  },
  {
    path: "/company/:id/edit/subscription",
    name: routesNames.companyEditSubscription,
    component: CompanyEditSubscription,
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "Edit Subscription",
    },
  },
  {
    path: "/company/:id/share-your-reviews",
    name: routesNames.companyShareYourReviews,
    component: CompanyShareYourReviews,
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "Share Your Reviews",
    },
  },
  {
    path: "/company/:id/edit/email-template",
    name: routesNames.companyEditEmailTemplates,
    component: CompanyEditEmailTemplate,
    meta: {
      requiresAuth: true,
      iAmCompanyOwner: true,
      title: "Email Settings",
    },
  },
  {
    path: "/review/:token",
    name: routesNames.companyAddReview,
    component: CompanyAddReview,
    meta: {
      title: "Add Review",
    },
  },
  {
    path: "/widget-editor",
    name: routesNames.widgetEditor,
    component: WidgetEditor,
    meta: {
      requiresAuth: true,
      title: "Widget Editor",
    },
  },
  {
    path: "/widget/:companyId?/:reviewToken?",
    name: routesNames.widgetView,
    component: WidgetView,
    meta: {
      title: "Widget",
    },
  },
  {
    path: "/page/:name",
    name: routesNames.page,
    component: Page,
    meta: {},
  },
  {
    path: "/support",
    name: routesNames.support,
    component: Support,
    meta: {
      title: "Support",
    },
  },
  // Admin pages
  {
    path: "/admin",
    name: routesNames.adminDashboard,
    component: AdminDashboardLayout,
    meta: {
      requiresAuth: true,
    },
    redirect: { name: routesNames.adminDashboardMain },
    children: [
      {
        path: "main",
        name: routesNames.adminDashboardMain,
        component: AdminMain,
        meta: {
          title: "Admin Main",
        },
      },
      {
        path: "reported-reviews",
        name: routesNames.adminDashboardReportedReviews,
        component: AdminReportedReviews,
        meta: {
          title: "Admin Reported Reviews",
        },
      },
      {
        path: "pages",
        name: routesNames.adminDashboardPages,
        redirect: { name: routesNames.adminDashboardPagesList },
        component: AdminPages,
        children: [
          {
            path: "list",
            name: routesNames.adminDashboardPagesList,
            component: AdminPagesList,
            meta: {
              title: "Admin Pages List",
            },
          },
          {
            path: "edit/:id?",
            name: routesNames.adminDashboardEditPage,
            component: AdminEditPage,
            meta: {
              title: "Admin Edit Page",
            },
          },
        ],
      },
    ],
  },
];
