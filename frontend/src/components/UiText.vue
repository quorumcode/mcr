<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PageBody } from "@/types/commonTypes";

export default defineComponent({
  props: {
    body: {
      type: Object as PropType<PageBody>,
      default: undefined,
    },
  },
});
</script>

<template>
  <div class="ui-text">
    <slot />
    <template v-if="body">
      <template v-for="block in body.blocks" :key="block.id">
        <component
          v-if="block.type === 'header'"
          :is="`h${block.data.level}`"
          v-html="block.data.text"
        />
        <p v-else-if="block.type === 'paragraph'" v-html="block.data.text" />
        <component
          v-else-if="block.type === 'list'"
          :is="block.data.style === 'unordered' ? 'ul' : 'ol'"
        >
          <li
            v-for="(item, index) in block.data.items"
            :key="index"
            v-html="item"
          />
        </component>
        <div v-else-if="block.type === 'image'">
          <img :src="block.data.file.url" alt="" />
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/color.scss";
@import "@/styles/typography.scss";
@import "@/styles/rounding.scss";

.ui-text {
  @include typography-main(16px, 400);

  > :deep(*:first-child) {
    margin-top: 0;
  }

  :deep(h1) {
    @include typography-header(40px, 700);
    color: $color-blue;
    margin-top: 80px;
    margin-bottom: 12px;
  }

  :deep(h2) {
    @include typography-header(32px, 600);
    color: $color-blue;
    margin-top: 40px;
    margin-bottom: 8px;
  }

  :deep(h3) {
    @include typography-header(24px, 400);
    color: $color-blue;
    margin-top: 20px;
    margin-bottom: 8px;
  }

  :deep(h4),
  :deep(h5) {
    @include typography-header(20px, 400);
    color: $color-blue;
    margin-top: 20px;
    margin-bottom: 8px;
  }

  :deep(p) {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  :deep(ul),
  :deep(ol) {
    list-style: none;
    margin-top: 40px;
    margin-bottom: 40px;
    padding-left: 12px + 20px;
  }

  :deep(li) {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: $rounding-circle;
      background-color: $color-blue;
      top: 6px;
      left: -12px - 14px;
    }

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  :deep(a) {
    color: $color-blue;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
}
</style>
