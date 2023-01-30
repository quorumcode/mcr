<script lang="ts">
import { computed, defineComponent } from "vue";
import AppRating from "@/components/AppRating.vue";
import IconReplied from "@/components/icons/IconReplied.vue";
import { formatDate } from "@/helpers/formatDate";

export default defineComponent({
  components: { IconReplied, AppRating },
  props: {
    ratingValue: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    replyMessage: {
      type: String,
      default: "",
    },
    iAmCompanyOwner: {
      type: Boolean,
      default: false,
    },
    showFullMessage: {
      type: Boolean,
      default: false,
    },
    place: {
      type: String,
      default: "",
    },
    isStrongValue: {
      type: Boolean,
      default: true,
    },
    companyName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const formattedDate = computed(() => {
      return formatDate(props.date);
    });

    return { formattedDate };
  },
});
</script>

<template>
  <article
    class="app-review"
    :class="{
      '_is-replied': replyMessage,
      '_show-full-message': showFullMessage,
      '_is_dashboard-stats-review': place === 'dashboard-stats-review',
    }"
  >
    <div class="app-review__header header">
      <div class="header__priority">
        <div class="header__name">{{ userName }}</div>
        <div class="header__rating">
          <AppRating
            :value="ratingValue"
            :max-value="5"
            :is-reviews-count-visible="false"
            :is-strong-value="isStrongValue"
            :adaptive="false"
            :place="place"
          />
        </div>
      </div>
      <div class="header__date">{{ formattedDate }}</div>
    </div>
    <div class="app-review__message">{{ message }}</div>
    <div v-if="replyMessage" class="app-review__reply reply">
      <div class="reply__status">
        <IconReplied class="reply__status-icon" />
        Response from {{ companyName }}
      </div>
      <div class="reply__message">{{ replyMessage }}</div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";

.app-review {
  &__header {
    margin-bottom: 12px;
  }

  &__message {
    @include typography-main(14px);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    white-space: pre-line;
  }

  &._is_dashboard-stats-review .app-review__message {
    -webkit-line-clamp: 7;
  }

  &__reply {
    margin-top: 12px;
  }

  &._is-replied {
    .app-review__message {
      -webkit-line-clamp: 4;
    }
  }

  &._show-full-message {
    .app-review__message {
      display: block;
      -webkit-line-clamp: auto;
    }
    .reply__message {
      white-space: pre-line;
    }
  }
}

.header {
  &__priority {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    @include typography-main(16px, 700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 12px;
    color: $color-blue;
    height: 28px;
  }

  &__rating {
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__date {
    @include typography-main(12px);
    color: $color-blue-60;
  }
}

.reply {
  &__status {
    @include typography-main(16px, 600);
    display: flex;
    align-items: center;
    color: $color-green;
  }

  &__status-icon {
    margin-right: 8px;
  }

  &__message {
    @include typography-main(14px);
    white-space: pre-line;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
