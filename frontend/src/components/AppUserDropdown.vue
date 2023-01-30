<script lang="ts">
import { defineComponent, PropType } from "vue";
import IconProfile from "@/components/icons/IconProfile.vue";
import UiDropdown from "@/components/UiDropdown.vue";
import IconChevron from "@/components/icons/IconChevron.vue";
import IconDashboard from "@/components/icons/IconDashboard.vue";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconReview from "@/components/icons/IconReview.vue";
import IconBusiness from "@/components/icons/IconBusiness.vue";
import { routesNames } from "@/routesNames";
import { RouteLocationRaw } from "vue-router";

export default defineComponent({
  components: {
    IconChevron,
    UiDropdown,
    IconProfile,
    IconDashboard,
    IconArrowRight,
    IconReview,
    IconBusiness,
  },
  props: {
    userName: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    adminRoute: {
      type: Object as PropType<RouteLocationRaw>,
      default: undefined,
    },
    subscriptionDaysLeft: {
      type: [String, Number],
      default: "",
    },
  },
  setup() {
    return {
      routesNames,
    };
  },
});
</script>

<template>
  <div class="app-user-dropdown">
    <UiDropdown placement="end">
      <template #trigger="{ isOpened }">
        <div class="trigger" :class="{ '_is-opened': isOpened }">
          <div class="trigger__name">{{ userName }}</div>
          <IconProfile class="trigger__icon" />
          <IconChevron class="trigger__chevron" />
        </div>
      </template>
      <template #content>
        <slot name="dropdown-content-start"></slot>
        <ul class="menu">
          <li v-if="adminRoute" class="menu__item">
            <RouterLink class="menu__link" :to="adminRoute">
              Admin dashboard
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{ name: routesNames.dashboardStats }"
            >
              <IconDashboard />
              Dashboard
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{ name: routesNames.dashboardGetReviews }"
            >
              <IconArrowRight />
              Get Reviews
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{ name: routesNames.dashboardReviews }"
            >
              <IconReview />
              My Reviews
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{
                name: routesNames.companyProfile,
                params: { id: companyId },
              }"
            >
              <IconBusiness />
              My Company
            </RouterLink>
          </li>

          <hr class="hr" />

          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{
                name: routesNames.companyEditUserAccount,
                params: { id: companyId },
              }"
            >
              User Account
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{
                name: routesNames.companyEditBusinessProfile,
                params: { id: companyId },
              }"
            >
              Business Profile
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{
                name: routesNames.companyEditSubscription,
                params: { id: companyId },
              }"
            >
              Subscription
              <span v-if="subscriptionDaysLeft" class="menu__label">
                {{ subscriptionDaysLeft }} left
              </span>
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink class="menu__link" :to="{ name: routesNames.support }">
              Support
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              :to="{ name: routesNames.widgetEditor }"
              class="menu__link"
            >
              Embed Reviews into Your Site
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{
                name: routesNames.companyShareYourReviews,
                params: { id: companyId },
              }"
            >
              Share Your Reviews Page
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink
              class="menu__link"
              :to="{
                name: routesNames.companyEditEmailTemplates,
                params: { id: companyId },
              }"
            >
              Email Settings
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink class="menu__link" :to="{ name: routesNames.logout }">
              Log Out
            </RouterLink>
          </li>
        </ul>
      </template>
    </UiDropdown>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/rounding.scss";
@import "@/styles/typography.scss";

.trigger {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  user-select: none;

  &__name {
    @include typography-main(16px, 700);
    margin-right: 8px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__icon {
    margin-right: 4px;
  }

  &__chevron {
    transition: transform 0.2s;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: currentColor;
    opacity: 0;
    border-radius: $rounding-medium;
    transition: opacity 0.2s;
  }

  &._is-opened,
  &:hover {
    &::before {
      opacity: 0.06;
    }
  }

  &._is-opened {
    .trigger__chevron {
      transform: scaleY(-1);
    }
  }
}

.menu {
  @include typography-main(14px, 600);
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    min-width: 240px;
  }

  &__link {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    color: $color-blue;
    text-decoration: none;

    &:hover {
      background-color: $color-blue-06;
    }

    svg {
      margin-right: 8px;
    }
  }

  &__label {
    @include typography-main(10px, 600);
    color: $color-green;
    background-color: $color-green-10;
    padding: 4px;
    margin-left: 24px;
    border-radius: $rounding-medium;
  }

  .hr {
    height: 2px;
    background: $color-black-10;
    border-radius: 20px;
    margin: 0;
    border: none;
  }
}
</style>
