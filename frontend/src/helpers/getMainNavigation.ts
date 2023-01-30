import { routesNames } from "@/routesNames";
import IconDashboard from "@/components/icons/IconDashboard.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconReview from "@/components/icons/IconReview.vue";
import IconShield from "@/components/icons/IconShield.vue";
import { NavigationLink } from "@/types/commonTypes";

export function getMainNavigation(
  isAdmin: boolean,
  isShort = false
): NavigationLink[] {
  let links = [] as NavigationLink[];

  if (isAdmin) {
    links.push({
      title: isShort ? "Admin" : "Admin Dashboard",
      route: {
        name: routesNames.adminDashboard,
      },
      icon: IconShield,
    });
  }

  links = links.concat([
    {
      title: "Dashboard",
      route: {
        name: routesNames.dashboardStats,
      },
      icon: IconDashboard,
    },
    {
      title: "Get Reviews",
      route: {
        name: routesNames.dashboardGetReviews,
      },
      icon: IconArrowRight,
    },
    {
      title: "My Reviews",
      route: {
        name: routesNames.dashboardReviews,
      },
      icon: IconReview,
    },
  ]);

  if (isAdmin) {
    links.push({
      title: "Companies",
      route: {
        name: routesNames.companySearch,
      },
      icon: IconDashboard,
    });
  }

  return links;
}
